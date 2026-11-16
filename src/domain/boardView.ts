import type { GuestSessionActivity } from '@openchamber/sdk';
import { byRank, matchesFilter, type BoardFilter } from './board.ts';
import { DEFAULT_SYNC_OPTIONS, statusForSession, type AgentOutcome, type SyncOptions } from './sync.ts';
import { STATUSES, type Task, type TaskStatus } from './task.ts';

/**
 * The one view model behind both surfaces — the full-screen board page and
 * the rail panel. Both render the same sections of `BoardItem`s from the
 * same inputs: the stored tasks, the task filter (project scope + search),
 * and the live session state each surface knows. The rail regroups rows by
 * live agent state for display only and never writes a status; the page
 * persists agent-driven moves and so renders stored statuses that have
 * already converged — the same items either way.
 */

/**
 * Live agent state for one linked session, taken from a session snapshot a
 * surface trusts (`ready` — an incomplete list is not a disappearance, same
 * rule as everywhere else). `outcome` matches `sync.ts`'s `AgentOutcome`.
 */
export type SessionLiveState = {
  projectId: string;
  activity: GuestSessionActivity;
  outcome: AgentOutcome;
  /** The session's own last-change time — the closest thing to "when it started needing attention" for a task whose marker could never be persisted. */
  updatedAt: number;
};

export type ActivityTone = 'running' | 'waiting' | 'failed' | 'idle';

export type ActivityLine = { text: string; tone: ActivityTone };

/** One task as either surface shows it. */
export type BoardItem = {
  task: Task;
  /** The status to group the row under: agent-adjusted for display, or stored when nothing live is known. */
  displayStatus: TaskStatus;
  /** The live agent state implies a different status than the stored one — it changed while no writer was around to persist it. */
  movedByAgent: boolean;
  /** The row flags "look at this": a stored unseen marker, or the agent landed it in Review while nothing could persist the marker. */
  attention: boolean;
  /** Sort key for the Review section: the stored marker, else the session's last change. `null` for seen rows. */
  attentionSince: number | null;
  /** Live session state when known; `null` when unlinked or no trusted snapshot covers it. */
  live: SessionLiveState | null;
};

export type BoardSections = Record<TaskStatus, BoardItem[]>;

/**
 * The status to display for a task. Reuses the board's own pure mapping
 * (`statusForSession`) so every surface shows what the board *will* save
 * the next time it opens — without the rail ever writing a status itself.
 * Done stays done: the mapping already refuses to move it.
 */
export const effectiveStatus = (
  task: Task,
  state: SessionLiveState | null,
  sync: SyncOptions = DEFAULT_SYNC_OPTIONS,
): TaskStatus =>
  state ? statusForSession(task.status, state.activity, state.outcome, sync) ?? task.status : task.status;

export const liveStateFor = (task: Task, live: ReadonlyMap<string, SessionLiveState>): SessionLiveState | null =>
  task.sessionId ? live.get(task.sessionId) ?? null : null;

export const buildBoardItem = (
  task: Task,
  live: ReadonlyMap<string, SessionLiveState>,
  sync: SyncOptions = DEFAULT_SYNC_OPTIONS,
): BoardItem => {
  const state = liveStateFor(task, live);
  const displayStatus = effectiveStatus(task, state, sync);
  const movedByAgent = displayStatus !== task.status;
  // Unseen either through the stored marker (the board's own sync set it
  // before) or because the agent landed it in Review while no board was
  // running — nothing was around to persist the marker then, so the row
  // flags for display only, exactly like the board would have.
  const attention = task.needsAttentionSince !== null || (movedByAgent && displayStatus === 'review');
  return {
    task,
    displayStatus,
    movedByAgent,
    attention,
    attentionSince: task.needsAttentionSince ?? (attention && state ? state.updatedAt : null),
    live: state,
  };
};

/**
 * The Review section's order: unseen first (newest marker or last agent
 * change), then normal rank order among the seen — the Review column's
 * urgency sort every surface shares.
 * unseen first (newest first), then normal rank order among the seen.
 */
const byReviewAttention = (a: BoardItem, b: BoardItem): number =>
  (b.attentionSince ?? Number.NEGATIVE_INFINITY) - (a.attentionSince ?? Number.NEGATIVE_INFINITY) ||
  byRank(a.task, b.task);

/**
 * The one grouping both surfaces render: tasks matching the filter go into
 * sections by displayed status; the Review section sorts unseen-first like
 * the board's Review column always has, every other section stays
 * rank-ordered. The panel passes the current project's scope (with no open
 * directory: `ALL_PROJECTS`, which keeps the rail useful when nothing is
 * selected); the page passes its own filter, search included.
 */
export const buildBoardView = (
  tasks: readonly Task[],
  live: ReadonlyMap<string, SessionLiveState>,
  filter: BoardFilter,
  sync: SyncOptions = DEFAULT_SYNC_OPTIONS,
): BoardSections => {
  const sections = Object.fromEntries(STATUSES.map((status) => [status, [] as BoardItem[]])) as BoardSections;
  for (const task of tasks) {
    if (!matchesFilter(task, filter)) continue;
    const item = buildBoardItem(task, live, sync);
    sections[item.displayStatus].push(item);
  }
  for (const status of STATUSES) {
    sections[status].sort((a, b) => (status === 'review' ? byReviewAttention(a, b) : byRank(a.task, b.task)));
  }
  return sections;
};

/** Rows flagged "look at this" anywhere except Done (that column is deliberate work, not open attention). */
export const countUnseen = (sections: BoardSections): number =>
  Object.values(sections).reduce(
    (count, items) => count + items.filter((item) => item.attention && item.displayStatus !== 'done').length,
    0,
  );

/** Rows outside Done — the "open" number both surfaces show. */
export const countOpen = (sections: BoardSections): number =>
  Object.values(sections).reduce(
    (count, items) => count + items.filter((item) => item.displayStatus !== 'done').length,
    0,
  );

/** The badge both surfaces render for the same counts, unseen tipping it to warning. */
export const badgeForCounts = (open: number, unseen: number): { label: string; tone: 'neutral' | 'warning' } =>
  unseen > 0
    ? { label: `${open} open · ${unseen} unseen`, tone: 'warning' as const }
    : { label: `${open} open`, tone: 'neutral' as const };

/**
 * The row's live agent line under the title. `null` — show nothing: an
 * `unknown` activity, or no trusted snapshot for the session's project.
 */
export const describeActivity = (state: SessionLiveState): ActivityLine | null => {
  switch (state.activity) {
    case 'running': return { text: 'running', tone: 'running' };
    case 'retrying': return { text: 'retrying', tone: 'running' };
    case 'waiting-question': return { text: 'needs your answer', tone: 'waiting' };
    case 'waiting-permission': return { text: 'needs permission', tone: 'waiting' };
    case 'idle':
      if (state.outcome === 'completed') return { text: 'finished', tone: 'idle' };
      if (state.outcome === 'failed') return { text: 'failed', tone: 'failed' };
      return { text: 'idle', tone: 'idle' };
    default: return null; // 'unknown'
  }
};
