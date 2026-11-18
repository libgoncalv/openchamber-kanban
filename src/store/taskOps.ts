import type { HostClient } from '@openchamber/sdk';
import { planDrop, rankAtEnd, type DropPlan } from '../domain/board.ts';
import { applyPatch, createTask, type Task, type TaskPatch, type TaskStatus } from '../domain/task.ts';
import { deleteTask, saveTask } from './taskStore.ts';
import { saveDismissedSessions } from './dismissedSessions.ts';

/**
 * The write operations behind the full-screen board page: quick-created
 * tasks, drag-and-drop moves, menu moves, status changes, and deletes —
 * single-task and in batch (multi-select, column emptying). Orderings and
 * the save/rollback discipline live in exactly one place, so
 * they can never diverge from what the rail panel merely displays. Callers
 * commit the returned arrays to their own state (`setTasks`) and render;
 * saves throw so the page can notify its own way and fall back to a reload.
 * Nothing here touches the DOM, and nothing here is agent-driven state —
 * these are deliberate user actions only, and only the page runs them.
 */
type Storage = Pick<HostClient, 'storage'>;

/**
 * A deliberate move (drag-and-drop): plan the drop against the target
 * column as the user sees it, then produce the next task list — the moved
 * task gets its new status and rank and its attention marker cleared (a
 * move you did yourself is an acknowledgment, exactly like opening the
 * card), rebalanced neighbours get their new ranks. `null` when the task is
 * gone from `tasks`.
 */
export const planMove = (
  tasks: readonly Task[],
  id: string,
  status: TaskStatus,
  beforeId: string | null,
  visible: readonly Task[],
): { next: Task[]; plan: DropPlan } | null => {
  const current = tasks.find((task) => task.id === id);
  if (!current) return null;
  const plan = planDrop(visible, id, beforeId);
  const rebalanceMap = new Map(plan.rebalance.map((entry) => [entry.id, entry.rank]));
  const next = tasks.map((task) => {
    if (task.id === id) return applyPatch(task, { status, rank: plan.rank, needsAttentionSince: null });
    const newRank = rebalanceMap.get(task.id);
    return newRank === undefined ? task : applyPatch(task, { rank: newRank });
  });
  return { next, plan };
};

/** Persists a planned move: the moved record first, then every rebalanced neighbour. Throws on failure. */
export const saveMove = async (host: Storage, next: readonly Task[], id: string, plan: DropPlan): Promise<void> => {
  await saveTask(host, next.find((task) => task.id === id)!);
  await Promise.all(plan.rebalance.map((entry) => saveTask(host, next.find((task) => task.id === entry.id)!)));
};

/**
 * A menu Move-to (the ⋯ menu on a row, or the detail popup's Move-to
 * buttons): a status change that keeps its rank — a deliberate move, so the
 * attention marker clears. `null` when this would change nothing, so a
 * repeated click never re-saves.
 */
export const statusMove = (task: Task, status: TaskStatus): Task | null => {
  if (task.status === status && task.needsAttentionSince === null) return null;
  return applyPatch(task, { status, needsAttentionSince: null });
};

/**
 * The board's auto-done write (fed by `autoDoneSync`): Done, kept rank, an
 * attention marker cleared — a card whose visits and commits check out is
 * acknowledged, the user-click semantics of every deliberate move — plus
 * the rule's own guard: `autoDoneCommit` records the worktree HEAD hash at
 * fire time, so nothing re-fires while that is still HEAD. Drags back out
 * of Done hold until a newer commit lands. `null` when the task is not in
 * Review (the watcher's fetch raced a move or a delete; the caller then
 * writes and saves nothing) — and pure, like everything in this file.
 */
export const autoDoneMove = (task: Task, commitSha: string): Task | null => {
  if (task.status !== 'review') return null;
  return applyPatch(task, { status: 'done', needsAttentionSince: null, autoDoneCommit: commitSha });
};

/** Applies any patch to one task in the list; `null` when the id is unknown. Pure. */
export const patchTask = (tasks: readonly Task[], id: string, patch: TaskPatch): { next: Task[]; task: Task } | null => {
  const current = tasks.find((task) => task.id === id);
  if (!current) return null;
  const updated = applyPatch(current, patch);
  return { next: tasks.map((task) => (task.id === id ? updated : task)), task: updated };
};

/** Creates and persists a real task, appended at the end of Backlog. Throws on failure. */
export const createBacklogTask = async (
  host: Storage,
  opts: { tasks: readonly Task[]; title: string; projectId: string | null },
): Promise<Task> => {
  const task = createTask({ title: opts.title, projectId: opts.projectId }, rankAtEnd(opts.tasks, 'backlog'));
  await saveTask(host, task);
  return task;
};

/**
 * Deleting a task whose session is linked must not let the board's orphan
 * watcher re-adopt that running session as a fresh card: the session is
 * recorded in dismissedSessions and that list is saved BEFORE the task is
 * deleted, rolled back if either save fails. This is why every surface
 * loads `dismissedSessions` on every load — saving a set that missed
 * previously dismissed sessions would wipe them.
 *
 * Returns whether a fresh dismissal was recorded (callers may need it to
 * update their in-memory set); throws so the caller keeps its old state and
 * can notify.
 */
export const deleteTaskWithDismissal = async (
  host: Storage,
  task: Task,
  dismissedSessionIds: Set<string>,
): Promise<{ dismissed: boolean }> => {
  const sessionId = task.sessionId;
  const alreadyDismissed = sessionId !== null && dismissedSessionIds.has(sessionId);
  let dismissed = false;
  if (sessionId && !alreadyDismissed) {
    dismissedSessionIds.add(sessionId);
    try {
      await saveDismissedSessions(host, dismissedSessionIds);
    } catch (error) {
      dismissedSessionIds.delete(sessionId);
      throw error;
    }
    dismissed = true;
  }
  try {
    await deleteTask(host, task.id);
  } catch (error) {
    if (dismissed && sessionId) {
      dismissedSessionIds.delete(sessionId);
      void saveDismissedSessions(host, dismissedSessionIds).catch(() => undefined);
    }
    throw error;
  }
  return { dismissed };
};

/**
 * The batch form of deleteTaskWithDismissal — multi-select deletes and the
 * column-head "empty column" run through this. Every linked session among
 * `tasks` that is not already dismissed joins the dismissed set, saved ONCE
 * before the first task is deleted: the orphan watcher can never catch an
 * adoptable session for even a moment between two per-task deletes. That save
 * failing throws and rolls the additions back (memory plus nothing deleted),
 * exactly like the single-task protocol.
 *
 * The deletes then run independently — one storage record per task means one
 * failure keeps only its own task, not the batch. The sessions behind failed
 * tasks are un-dismissed again (best-effort save, never thrown): a task that
 * was not deleted keeps its session adoption-eligible the moment its link is
 * gone, same as the single-task rollback. Callers get the split (`deletedIds`,
 * `failed`) and handle notify/reload in their own voice.
 */
export const deleteTasksWithDismissal = async (
  host: Storage,
  tasks: readonly Task[],
  dismissedSessionIds: Set<string>,
): Promise<{ deletedIds: string[]; failed: Task[] }> => {
  const fresh = tasks.flatMap((task) => (task.sessionId && !dismissedSessionIds.has(task.sessionId) ? [task.sessionId] : []));
  if (fresh.length > 0) {
    for (const id of fresh) dismissedSessionIds.add(id);
    try {
      await saveDismissedSessions(host, dismissedSessionIds);
    } catch (error) {
      for (const id of fresh) dismissedSessionIds.delete(id);
      throw error;
    }
  }
  const results = await Promise.allSettled(tasks.map((task) => deleteTask(host, task.id)));
  const deletedIds: string[] = [];
  const failed: Task[] = [];
  results.forEach((result, index) => {
    const task = tasks[index]!;
    if (result.status === 'fulfilled') deletedIds.push(task.id);
    else failed.push(task);
  });
  if (failed.length > 0) {
    const keepEligible = failed.flatMap((task) => (task.sessionId ? [task.sessionId] : []));
    for (const id of keepEligible) dismissedSessionIds.delete(id);
    void saveDismissedSessions(host, dismissedSessionIds).catch(() => undefined);
  }
  return { deletedIds, failed };
};
