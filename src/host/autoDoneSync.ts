import type { HostClient } from '@openchamber/sdk';
import { autoDoneCandidate, type SessionLiveState } from '../domain/boardView.ts';
import type { Task } from '../domain/task.ts';

export type CommitAheadResult = { ahead: number; head: string | null };

export type AutoDoneSyncHost = Pick<HostClient, 'serviceRequest'>;

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
 * Asks the local git service how far a worktree sits ahead of a base ref,
 * and at which HEAD. Best-effort like `fetchServiceBranches`: the service
 * is optional (unapproved, not running, no services on this platform), git
 * can fail (base ref deleted, empty repository), and any of it is a
 * `null`, never a throw — the auto-done rule simply does not fire on
 * unknown evidence. The service route itself runs `git -C <directory>
 * rev-list --count <base>..HEAD` plus `rev-parse HEAD` host-side.
 */
export const fetchCommitsAhead = async (
  host: AutoDoneSyncHost,
  directory: string,
  base: string,
): Promise<CommitAheadResult | null> => {
  try {
    const result = await host.serviceRequest({ method: 'GET', path: '/commits-ahead', query: { directory, base } });
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
 *
 * Two writes, both the board page's through its callbacks (the page stays
 * the single status writer; the rail never writes and inherits the same
 * view):
 *  - a storeless one — the marker clear for a visit the host observed
 *    elsewhere, so badges and unseen counts converge on next load;
 *  - the real one — Done, guarded by the HEAD hash at fire time: while the
 *    task's `autoDoneCommit` equals the worktree HEAD, nothing re-fires,
 *    so dragging the card back out of Done holds until newer work lands.
 *
 * Errors are silent the board's background-sync way: a failed check hides
 * behind the retry floor and the next change re-tries it, never a toast.
 */
export const createAutoDoneSync = (
  host: AutoDoneSyncHost,
  /** The sessionSync live provider (read-only), so snapshot state is shared, not duplicated. */
  live: () => ReadonlyMap<string, SessionLiveState>,
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
      const directory = tasksById.get(taskId)?.worktree?.directory ?? null;
      const base = tasksById.get(taskId)?.sourceBranch ?? null;
      if (!directory || base === null) return;
      const result = await fetchCommitsAhead(host, directory, base);
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
