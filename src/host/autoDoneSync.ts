import type { HostClient } from '@openchamber/sdk';
import { autoDoneCandidate, type SessionLiveState } from '../domain/boardView.ts';
import type { Task } from '../domain/task.ts';

export type CommitAheadResult = { ahead: number; head: string | null };

export type AutoDoneSyncHost = Pick<HostClient, 'serviceRequest'>;

/**
 * What the commit check asks for, one of two evidence modes:
 *  - `{ base }` — the worktree path: how far the worktree sits ahead of a
 *    recorded source branch (`rev-list --count <base>..HEAD`).
 *  - `{ since }` — the project-root path, the common one: how many commits
 *    are newer, in commit-date terms, than the moment the card's session
 *    was linked (`rev-list --count --since <utc> HEAD`). That stamp is the
 *    `sessionLinkedAt` anchor every link flow records.
 */
export type CommitAheadQuery = { base: string } | { since: number };

/**
 * How long a finished commit check holds a task's retry back. The rule is
 * event-driven only — it runs when tasks or snapshots change — but a host
 * without the local git service (mobile, VS Code, an unapproved install)
 * fails every candidate fast, and trusted snapshots arrive continuously
 * while any watched session runs. A silent error could thus hammer the
 * absent service once per snapshot per candidate; this floor spaces those
 * attempts out. A successful write ends candidacy anyway (the card is in
 * Done), so the floor only ever bites the failure and the "no commits
 * yet" paths.
 */
const RETRY_PAUSE_MS = 60_000;

/**
 * Asks the local git service how far the evidence window holds: either the
 * worktree ahead of a base ref, or commits newer than a link anchor. The
 * service is optional (unapproved, not running, no services on this
 * platform), git can fail (base ref deleted, empty repository), and any of
 * it is a `null`, never a throw — the auto-done rule simply does not fire on
 * unknown evidence. The service route itself runs `git -C <directory>
 * rev-list --count <base>..HEAD` / `rev-list --count --since <utc> HEAD`
 * plus `rev-parse HEAD` host-side.
 */
export const fetchCommitsAhead = async (
  host: AutoDoneSyncHost,
  directory: string,
  query: CommitAheadQuery,
): Promise<CommitAheadResult | null> => {
  try {
    const params: Record<string, string> = { directory };
    if ('base' in query) params.base = query.base;
    else params.since = String(query.since);
    const result = await host.serviceRequest({ method: 'GET', path: '/commits-ahead', query: params });
    if (result.status !== 200) return null;
    const parsed: unknown = JSON.parse(result.body);
    if (!parsed || typeof parsed !== 'object') return null;
    const record = parsed as Record<string, unknown>;
    const ahead = record.ahead;
    if (typeof ahead !== 'number' || !Number.isInteger(ahead) || ahead < 0) return null;
    const head = record.head;
    if (head !== null && typeof head !== 'string') return null;
    return { ahead, head };
  } catch {
    return null;
  }
};

export type AutoDoneSyncCallbacks = {
  /**
   * The rule decided: write Done with the worktree HEAD as the guard. The
   * board page implements this through the shared ops (`autoDoneMove`) and
   * re-checks the task first — lists change while a check is in flight.
   */
  onAutoDone: (taskId: string, commitSha: string) => void;
  /**
   * The host reports the session was opened somewhere else (`unread` went
   * false) while a stored unseen marker waits: the visit happened, it just
   * did not pass through the board. The page clears the marker and saves.
   */
  onObservedRead: (taskId: string) => void;
};

/**
 * The auto-done watcher: the page-side convergence of "reviewed, committed
 * work, quiet session" into Done. Fed by `setTasks` (the task list
 * changed) and by trusted session snapshots (the session stopped, or its
 * chat was read elsewhere). No timers: every input to the rule arrives
 * through one of those two channels, and the commit evidence is
 * fetch-per-candidate rather than a poll.
 * Two writes, through the caller's callbacks (both the shared ops in
 * `store/autoDoneOps.ts` since the rail learned the rule; the agent-status
 * writes of `sessionSync.ts` remain the page's alone):
 *  - a storeless one — the marker clear for a visit the host observed
 *    elsewhere, so badges and unseen counts converge on next load;
 *  - the real one — Done, guarded by the HEAD hash at fire time: while the
 *    task's `autoDoneCommit` equals the worktree HEAD, nothing re-fires,
 *    so dragging the card back out of Done holds until newer work lands.
 *
 * Since `store/autoDoneOps.ts`, both writes are shared ops the rail's own
 * watcher reaches too (one implementation, like adoption) — the comments
 * below say "the page" where the history is the page's; the rule itself is
 * every open surface's.
 *
 * Errors are silent the board's background-sync way: a failed check hides
 * behind the retry floor and the next change re-tries it, never a toast.
 */
export const createAutoDoneSync = (
  host: AutoDoneSyncHost,
  /** The sessionSync live provider (read-only), so snapshot state is shared, not duplicated. */
  live: () => ReadonlyMap<string, SessionLiveState>,
  /**
   * Where the project-root evidence mode counts its commits: the project's
   * directory, from the same live project list the mirror push keeps.
   * Unknown project (no snapshot yet, a task's project gone) answers `null`
   * and the check stays quiet until a later pass.
   */
  projectDirectory: (projectId: string | null) => string | null,
  callbacks: AutoDoneSyncCallbacks,
) => {
  let tasksById = new Map<string, Task>();
  /** Checks currently awaiting the service; one per task at a time. */
  const inFlight = new Set<string>();
  /** Last attempt per task id, the retry floor's clock. Expire on their own. */
  const lastAttempt = new Map<string, number>();
  let disposed = false;

  const stateFor = (task: Task): SessionLiveState | null =>
    task.sessionId ? live().get(task.sessionId) ?? null : null;

  /** One candidate's commit check: fetch, verify the facts still hold, then hand the write to the page. */
  const checkCommit = async (taskId: string): Promise<void> => {
    try {
      // Evidence mode picked at check time, from the task's own shape: a
      // worktree card counts ahead of its recorded branch, everything else
      // counts commits newer than its session-link anchor. No evidence, no
      // fetch (the predicate already screened, but the list may have
      // changed since).
      const start = tasksById.get(taskId);
      let directory: string | null = null;
      let query: CommitAheadQuery | null = null;
      if (start) {
        if (start.worktree !== null && start.sourceBranch !== null) {
          directory = start.worktree.directory;
          query = { base: start.sourceBranch };
        } else if (start.sessionLinkedAt !== null) {
          const root = projectDirectory(start.projectId);
          if (root !== null) {
            directory = root;
            query = { since: start.sessionLinkedAt };
          }
        }
      }
      if (directory === null || query === null) return;
      const result = await fetchCommitsAhead(host, directory, query);
      if (disposed) return;
      if (result === null) return; // service or git failed: silent, retry on a later event
      if (result.ahead <= 0 || result.head === null) return; // nothing ahead of the branch, or unreadable HEAD
      const current = tasksById.get(taskId);
      if (!current || current.status !== 'review') return; // moved, deleted, or its status changed meanwhile
      if (current.autoDoneCommit === result.head) return; // the guard: the exact commit already fired this rule
      if (!autoDoneCandidate(current, stateFor(current))) return; // a new turn started, or the card was dragged, meanwhile
      callbacks.onAutoDone(current.id, result.head);
    } finally {
      inFlight.delete(taskId);
    }
  };

  /** What one evaluate pass does: observed reads write first, then every fresh candidate asks git. */
  const evaluate = () => {
    if (disposed) return;
    for (const task of tasksById.values()) {
      const state = stateFor(task);
      if (task.needsAttentionSince !== null && state?.unread === false) {
        callbacks.onObservedRead(task.id);
        continue; // the marker clear re-enters through setTasks; no double decision per snapshot
      }
      if (!autoDoneCandidate(task, state)) continue;
      if (inFlight.has(task.id)) continue;
      const stamp = lastAttempt.get(task.id);
      if (stamp !== undefined && Date.now() - stamp < RETRY_PAUSE_MS) continue;
      inFlight.add(task.id);
      lastAttempt.set(task.id, Date.now());
      void checkCommit(task.id);
    }
  };

  /** Call whenever the task list changes (reload, link, create, move, save). */
  const sync = (tasks: readonly Task[]) => {
    if (disposed) return;
    tasksById = new Map(tasks.map((task) => [task.id, task]));
    evaluate();
  };

  const dispose = () => {
    disposed = true;
    inFlight.clear();
    lastAttempt.clear();
  };

  return { sync, evaluate, dispose };
};
