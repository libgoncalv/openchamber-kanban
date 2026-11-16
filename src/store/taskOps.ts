import type { HostClient } from '@openchamber/sdk';
import { planDrop, rankAtEnd, type DropPlan } from '../domain/board.ts';
import { applyPatch, createTask, type Task, type TaskPatch, type TaskStatus } from '../domain/task.ts';
import { deleteTask, saveTask } from './taskStore.ts';
import { saveDismissedSessions } from './dismissedSessions.ts';

/**
 * The write operations both surfaces shared until now as two duplicated
 * implementations. The full-screen page and the rail panel run the exact
 * same math and the exact same save/rollback discipline here, so their
 * orderings can never diverge. Callers commit the returned arrays to their
 * own state (`setTasks`/`tasks =`) and render; saves throw so each surface
 * can notify its own way and fall back to a reload. Nothing here touches
 * the DOM, and nothing here is agent-driven state — these are deliberate
 * user actions only.
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
 * A drop on a collapsible section header (included for a folded one) or any
 * "append at the column's end" move: the rank at the very end of that
 * column across all tasks. `changed` false when this would change nothing.
 */
export const moveTaskToEnd = (
  tasks: readonly Task[],
  id: string,
  status: TaskStatus,
): { next: Task[]; changed: boolean } => {
  const current = tasks.find((task) => task.id === id);
  const endRank = rankAtEnd(tasks, status);
  if (!current || (current.status === status && current.needsAttentionSince === null && current.rank === endRank)) {
    return { next: [...tasks], changed: false };
  }
  const updated = applyPatch(current, { status, rank: endRank, needsAttentionSince: null });
  return { next: tasks.map((task) => (task.id === id ? updated : task)), changed: true };
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
