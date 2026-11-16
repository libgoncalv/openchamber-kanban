import type { Task, TaskStatus } from './task.ts';

export const ALL_PROJECTS = '__all__';
export const NO_PROJECT = '__none__';

export type BoardFilter = { projectId: string; query: string };

const RANK_STEP = 1024;
const MIN_GAP = 1e-6;

export const byRank = (a: Task, b: Task) => a.rank - b.rank || a.createdAt - b.createdAt || a.id.localeCompare(b.id);

export const matchesFilter = (task: Task, filter: BoardFilter) => {
  if (filter.projectId === NO_PROJECT && task.projectId !== null) return false;
  if (filter.projectId !== ALL_PROJECTS && filter.projectId !== NO_PROJECT && task.projectId !== filter.projectId) return false;
  const query = filter.query.trim().toLowerCase();
  if (!query) return true;
  return `${task.title}\n${task.description}\n${task.sourceBranch ?? ''}\n${task.sessionId ?? ''}`.toLowerCase().includes(query);
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
