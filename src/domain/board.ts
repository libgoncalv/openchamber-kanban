import { applyPatch, type Task, type TaskStatus } from './task.ts';

export const ALL_PROJECTS = '__all__';
export const NO_PROJECT = '__none__';

export type BoardFilter = { projectId: string };

const RANK_STEP = 1024;
const MIN_GAP = 1e-6;

export const byRank = (a: Task, b: Task) => a.rank - b.rank || a.createdAt - b.createdAt || a.id.localeCompare(b.id);

export const matchesFilter = (task: Task, filter: BoardFilter) => {
  if (filter.projectId === NO_PROJECT && task.projectId !== null) return false;
  if (filter.projectId !== ALL_PROJECTS && filter.projectId !== NO_PROJECT && task.projectId !== filter.projectId) return false;
  return true;
};

/** Rank for a task appended at the end of a column (across all projects so ordering stays global). */
export const rankAtEnd = (tasks: readonly Task[], status: TaskStatus) => {
  const ranks = tasks.filter((task) => task.status === status).map((task) => task.rank);
  return ranks.length ? Math.max(...ranks) + RANK_STEP : RANK_STEP;
};

export type DropPlan = {
  /** Rank for the moved task. */
  rank: number;
  /** Other tasks that must be renumbered first because the gap became too small. */
  rebalance: Array<{ id: string; rank: number }>;
};

/**
 * Compute where `movingId` lands when dropped into `status` before `beforeId`
 * (or at the end when `beforeId` is null). `visible` is the column as the user
 * sees it, already sorted by rank, and may exclude filtered-out tasks.
 */
export const planDrop = (visible: readonly Task[], movingId: string, beforeId: string | null): DropPlan => {
  const column = visible.filter((task) => task.id !== movingId);
  const index = beforeId === null ? column.length : column.findIndex((task) => task.id === beforeId);
  const at = index < 0 ? column.length : index;
  const prev = column[at - 1];
  const next = column[at];
  if (!prev && !next) return { rank: RANK_STEP, rebalance: [] };
  if (!next) return { rank: prev!.rank + RANK_STEP, rebalance: [] };
  if (!prev) return { rank: next.rank - RANK_STEP, rebalance: [] };
  if (next.rank - prev.rank > MIN_GAP) return { rank: (prev.rank + next.rank) / 2, rebalance: [] };
  const rebalance = column.map((task, i) => ({ id: task.id, rank: (i + (i >= at ? 2 : 1)) * RANK_STEP }));
  return { rank: (at + 1) * RANK_STEP, rebalance };
};

export type BulkMovePlan = {
  /** The whole task list with the bulk move applied. */
  next: Task[];
  /** Only the records that actually changed — the caller saves exactly these. */
  changed: Task[];
};

/**
 * A bulk move (multi-select): every task in `ids` moves to `status`, appended
 * as a group at the end of the target column, beyond its current max rank in
 * RANK_STEP steps. That never disturbs existing neighbours, so unlike a single
 * drop there is no rebalancing. The group's mutual order is the board's own
 * rank order (`byRank`) — not the urgency sort the Review column merely
 * displays. A deliberate move, so attention markers clear on every selected
 * task; a task already in the target keeps its rank and only clears a stale
 * marker (the same semantics a repeat Move-to click has). Unknown ids are
 * ignored. `null` when nothing would change, so the caller need not save or
 * render.
 */
export const planStatusMoves = (
  tasks: readonly Task[],
  ids: readonly string[],
  status: TaskStatus,
): BulkMovePlan | null => {
  const byId = new Map(tasks.map((task) => [task.id, task]));
  const picked = new Set<string>();
  const selected = ids
    .map((id) => byId.get(id))
    .filter((task): task is Task => {
      if (!task || picked.has(task.id)) return false;
      picked.add(task.id);
      return true;
    });
  if (selected.length === 0) return null;
  const targetRanks = tasks.filter((task) => task.status === status).map((task) => task.rank);
  let rank = (targetRanks.length ? Math.max(...targetRanks) : 0) + RANK_STEP;
  const movedRank = new Map<string, number>();
  for (const task of selected.filter((entry) => entry.status !== status).sort(byRank)) {
    movedRank.set(task.id, rank);
    rank += RANK_STEP;
  }
  const changed: Task[] = [];
  const next = tasks.map((task) => {
    const newRank = movedRank.get(task.id);
    // In the target already: a repeat click clears a stale marker, nothing else.
    const staleMarker = task.status === status && task.needsAttentionSince !== null && picked.has(task.id);
    const updated = newRank !== undefined
      ? applyPatch(task, { status, rank: newRank, needsAttentionSince: null })
      : staleMarker
        ? applyPatch(task, { needsAttentionSince: null })
        : task;
    if (updated !== task) changed.push(updated);
    return updated;
  });
  return changed.length > 0 ? { next, changed } : null;
};
