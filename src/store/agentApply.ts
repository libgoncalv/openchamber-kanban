import type { HostClient } from '@openchamber/sdk';
import type { Task } from '../domain/task.ts';
import { planPendingApply } from '../domain/agentChannel.ts';
import { deleteTask, loadTasks, saveTask } from './taskStore.ts';
import { ackPendingEntries, fetchPendingEntries } from '../host/agentChannel.ts';
import { fetchProjects } from '../host/workspace.ts';

type ApplyHost = Pick<HostClient, 'storage' | 'serviceRequest' | 'onProjects'> & {
  /**
   * `fetchProjects` asks a `WorkspaceHost` only for `onProjects`; the wider
   * structural pick is nothing this apply reads, so the narrowing cast is
   * the honest one — the caller's frame always has the full host anyway.
   */
  onProjects: HostClient['onProjects'];
};

/**
 * The one journal-apply every open Kanban surface runs — the full board, and
 * (since the rail learned the channel) the narrow mirror too — so "an agent's
 * queued task lands while something is open" is one implementation, not two.
 * Pulls the journal from the extension's local service, plans it against a
 * **fresh** storage read (never the caller's in-memory list), saves with
 * per-entry independence, converges any same-instant twin writes, and
 * acknowledges exactly what provably landed. Nothing here surfaces errors:
 * the caller styles toasts and banners, the op answers data or `null`.
 *
 * Convergence: each create stamps its entry id on the task record
 * (`agentEntryIds`), and two surfaces that pulled the same journal before
 * either acknowledged can both have saved their own record for it. After
 * saving, one fresh read finds rivals for the same entry id and settles them
 * the adoption way (`store/adoptOps.ts`): the smallest task id survives, the
 * other records are deleted, best-effort and idempotently — determinism for
 * every side of the race is why the tie-break is an ordering on minted ids,
 * not timing. A read that ran too early to even see the pair is corrected by
 * the other's delete, exactly as adoption's is. Note folds need no
 * convergence: both surfaces fold onto the *same* task id, and a note's
 * content is a pure function of its entry, so the last writer's record
 * already says the truth.
 *
 * The stamps also make an un-acked pull safe to replay: an ack lost after the
 * saves means the next pull re-plans the same entries — but the plan reads
 * the stamps (`appliedEntryIds`) and answers `alreadyLanded` for them, acked
 * this time and reapplied never. Without the stamp that replay used to
 * re-create the card: the old inline board apply re-minted ids on replan.
 */
export type AgentApplyOutcome = {
  /**
   * At least one journal write of this pull landed through *this* call (a
   * create this call's record survived, or a note fold). Callers tell the
   * user from this; converged-away twins and `alreadyLanded` entries stay
   * silent — the winning call's toast is the one telling the story.
   */
  applied: boolean;
  /** This pull's creates that this call's own save landed, post-convergence: `task` is the surviving record, `adopted` says it is this call's own. */
  created: Array<{ task: Task; adopted: boolean }>;
  /** Titles of the tasks this call folded notes onto, pre-patch (a fold changes no title). */
  noted: string[];
  /** The records this call ended with — survivor creates and folded note targets — for the caller to merge into its own view. */
  updated: Task[];
  /** Entries not applied by this call: the fresh read showed them already stamped (another surface's apply), or this call's own save failed while another surface's record carried the entry. Acked, never reapplied, never re-announced. */
  alreadyLanded: number;
  /** Entries the plan dropped (a note naming a deleted task); acked without a write. */
  dropped: number;
  /** Saves that failed (this call's or a vanished note target) — their entries stay pending and retry on the next pull. */
  failures: number;
  /**
   * Whether the acknowledgement itself succeeded. `false` means the applied
   * work stands but the journal still lists it: the caller merges the
   * outcome's records and leaves the ack to the next pull, and the replay
   * stays safe to the stamps above.
   */
  ackLanded: boolean;
};

const emptyOutcome = (): AgentApplyOutcome => ({
  applied: false, created: [], noted: [], updated: [], alreadyLanded: 0, dropped: 0, failures: 0, ackLanded: true,
});

/** Every journal entry id stamped on some stored task — the apply's idempotency book. */
const stampedIds = (tasks: readonly Task[]): ReadonlySet<string> =>
  new Set(tasks.flatMap((task) => task.agentEntryIds ?? []));

/**
 * The survivor record for one create-entry id on the post-save board: the
 * smallest task id among the tasks carrying the stamp, or `null` when none
 * is stored (no surface's save landed yet).
 */
const settleEntry = (tasks: readonly Task[], entryId: string): Task | null => {
  const rivals = tasks.filter((task) => task.agentEntryIds?.includes(entryId));
  if (rivals.length === 0) return null;
  return rivals.reduce((a, b) => (a.id < b.id ? a : b));
};

/** Task ids to delete so each of the given create-entry ids has one record: every rival but the survivor. */
const rivalsToDelete = (tasks: readonly Task[], entryIds: readonly string[]): string[] =>
  entryIds.flatMap((entryId) => {
    const survivor = settleEntry(tasks, entryId);
    if (survivor === null) return [];
    return tasks
      .filter((task) => task.agentEntryIds?.includes(entryId) && task.id !== survivor.id)
      .map((task) => task.id);
  });

/**
 * Applies what agents queued while nothing was open — or just now, live (the
 * service's emit reaches any open surface). `null` on a pull failure or an
 * empty journal: the channel is optional and the next event, load, surface,
 * or interval pass re-pulls.
 */
export const applyAgentJournal = async (
  host: ApplyHost,
  input: {
    /** The caller's live project list, the resolve of record for agent-created tasks; empty sends the op asking once on its own. */
    projects: readonly { id: string; directory: string | null }[];
    /** Fresh task ids, the board's own mint (plan-time, same as ever). */
    newId: () => string;
    now?: number;
  },
): Promise<AgentApplyOutcome | null> => {
  const now = input.now ?? Date.now();
  const entries = await fetchPendingEntries(host);
  if (entries === null || entries.length === 0) return null;
  // The caller's live list is the resolver of record for agent-created
  // projects; before its watcher snapshot has landed, ask once (the same
  // resolve/release pattern as every other one-off fetch).
  const knownProjects = input.projects.length > 0
    ? input.projects
    : (await fetchProjects(host).catch(() => ({ projects: [] as Array<{ id: string; directory: string | null }> }))).projects;
  const fresh = await loadTasks(host);
  // A plan failure (a stale journal can hold what today's validation
  // refuses) stays quiet: the entries stay pending, retried by the next
  // pull — the plan is pure, nothing was written.
  const plan = planPendingApply(entries, fresh.tasks, knownProjects, input.newId, now, stampedIds(fresh.tasks));
  // Records another surface already applied: the caller converges on them
  // too (its own list may predate the other surface's write), deduped by
  // task id — one record can carry several landed entries.
  const landed = [...new Map(
    plan.alreadyLanded.flatMap((entryId) =>
      fresh.tasks
        .filter((task) => task.agentEntryIds?.includes(entryId))
        .map((task) => [task.id, task] as const)),
  ).values()];

  const createResults = await Promise.allSettled(plan.creates.map((entry) => saveTask(host, entry.task)));
  const noteResults = await Promise.allSettled(plan.notes.map((note) => saveTask(host, note.task)));

  // Convergence, after every save: one fresh read, then for each of this
  // pull's create entries the smallest task id among the records carrying
  // its stamp survives. Deletes are best-effort: a failed loser delete
  // shows as a duplicate until a later pass reruns it — every pull settles
  // its own entries again, so a missed delete retries naturally.
  const settled = await loadTasks(host);
  const losers = rivalsToDelete(settled.tasks, plan.creates.map((entry) => entry.entryId));
  for (const id of losers) await deleteTask(host, id).catch(() => undefined);
  // Note targets are resolved against the post-delete board so a folded note
  // never points the caller at a record convergence just removed (the deep
  // same-instant race). When nothing was deleted, the read above is already
  // the final board.
  const finalBoard = losers.length === 0 ? settled.tasks : (await loadTasks(host)).tasks;

  const result = emptyOutcome();
  for (const [index, entry] of plan.creates.entries()) {
    const survivor = settleEntry(finalBoard, entry.entryId);
    if (survivor === null) { result.failures += 1; continue; }
    result.updated.push(survivor);
    if (createResults[index]?.status === 'fulfilled') {
      const adopted = survivor.id === entry.task.id;
      if (adopted) result.created.push({ task: survivor, adopted: true });
      // A fulfilled save that lost the convergence converges silently onto
      // the winner (the winner announces the card); the entry is still this
      // call's to ack, nothing was lost.
      else result.alreadyLanded += 1;
    } else {
      // This call's save failed, but the entry has a record: another
      // surface's twin landed. Count and ack as someone else's apply.
      result.alreadyLanded += 1;
    }
  }
  for (const [index, note] of plan.notes.entries()) {
    if (noteResults[index]?.status !== 'fulfilled') { result.failures += 1; continue; }
    const target = finalBoard.find((task) => task.id === note.taskId);
    if (!target) { result.failures += 1; continue; }
    result.noted.push(fresh.tasks.find((task) => task.id === note.taskId)?.title ?? note.taskId);
    result.updated.push(target);
  }
  result.applied = result.created.length > 0 || result.noted.length > 0;
  result.alreadyLanded += plan.alreadyLanded.length;
  result.dropped = plan.dropped.length;
  for (const task of landed) if (!result.updated.some((existing) => existing.id === task.id)) result.updated.push(task);

  // Ack exactly what provably landed: every create that ended on a record
  // (winner or converged twin), every folded note, the plan's already-stamped
  // entries and its dropped ones. A failed create save's entry stays out —
  // pending, retried by the next pull.
  const landedCreateIds = plan.creates
    .flatMap((entry, index) => (settleEntry(finalBoard, entry.entryId) !== null ? [entry.entryId] : []));
  const landedNoteIds = plan.notes.flatMap((note, index) =>
    noteResults[index]?.status === 'fulfilled' && finalBoard.some((task) => task.id === note.taskId)
      ? note.entryIds
      : []);
  const ackIds = [...new Set([...landedCreateIds, ...landedNoteIds, ...plan.dropped, ...plan.alreadyLanded])];
  if (ackIds.length > 0) result.ackLanded = await ackPendingEntries(host, ackIds);
  return result;
};
