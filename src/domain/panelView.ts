import type { GuestSessionActivity } from '@openchamber/sdk';
import { byRank } from './board.ts';
import { DEFAULT_SYNC_OPTIONS, statusForSession, type AgentOutcome, type SyncOptions } from './sync.ts';
import { STATUSES, type Task, type TaskStatus } from './task.ts';

/**
 * Live agent state for one linked session, taken from a session snapshot the
 * panel trusts (`ready` — an incomplete list is not a disappearance, same
 * rule as everywhere else). `outcome` matches `sync.ts`'s `AgentOutcome`.
 */
export type SessionLiveState = {
  projectId: string;
  activity: GuestSessionActivity;
  outcome: AgentOutcome;
  /** The session's own last-change time — the closest thing to "when it started needing attention" for a task the board was closed during. */
  updatedAt: number;
};

export type ActivityTone = 'running' | 'waiting' | 'failed' | 'idle';

export type ActivityLine = { text: string; tone: ActivityTone };

/** One task as the rail panel shows it. */
export type PanelItem = {
  task: Task;
  /** The status to group the row under: agent-adjusted for display, or stored when nothing live is known. */
  displayStatus: TaskStatus;
  /** The live agent state implies a different status than the stored one — it changed while the board was closed. */
  movedByAgent: boolean;
  /** The row flags "look at this": a stored unseen marker, or the agent landed it in Review while the board was closed. */
  attention: boolean;
  /** Sort key for the Review section: the stored marker, else the session's last change. `null` for seen rows. */
  attentionSince: number | null;
  /** Live session state when known; `null` when unlinked or no trusted snapshot covers it. */
  live: SessionLiveState | null;
};

export type PanelSections = Record<TaskStatus, PanelItem[]>;

/**
 * The status to display for a task. Reuses the board's own pure mapping
 * (`statusForSession`) so the panel shows what the board *will* save the
 * next time it opens — without the panel ever writing a status itself.
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

export const buildPanelItem = (
  task: Task,
  live: ReadonlyMap<string, SessionLiveState>,
  sync: SyncOptions = DEFAULT_SYNC_OPTIONS,
): PanelItem => {
  const state = liveStateFor(task, live);
  const displayStatus = effectiveStatus(task, state, sync);
  const movedByAgent = displayStatus !== task.status;
  // Unseen either through the stored marker (the board's own sync set it
  // before) or because the agent landed it in Review while no board was
  // running — nothing was around to persist the marker then, so the panel
  // flags it for display only, exactly like the board would have.
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
 * The tasks the panel may show: when OpenChamber has a project open, only
 * that project's tasks — tasks of other projects, and tasks attached to no
 * project at all, wait. With no open project (or one that matches no
 * registered project) everything shows, which keeps the rail useful when
 * nothing is selected.
 */
export const visibleTasks = (
  tasks: readonly Task[],
  currentProjectId: string | null,
): readonly Task[] => (currentProjectId ? tasks.filter((task) => task.projectId === currentProjectId) : tasks);

/**
 * The Review section's order, matching the board's `byReviewUrgency`:
 * unseen first (newest first), then normal rank order among the seen.
 */
const byReviewAttention = (a: PanelItem, b: PanelItem): number =>
  (b.attentionSince ?? Number.NEGATIVE_INFINITY) - (a.attentionSince ?? Number.NEGATIVE_INFINITY) ||
  byRank(a.task, b.task);

export const buildSections = (
  tasks: readonly Task[],
  live: ReadonlyMap<string, SessionLiveState>,
  sync: SyncOptions = DEFAULT_SYNC_OPTIONS,
): PanelSections => {
  const sections = Object.fromEntries(STATUSES.map((status) => [status, [] as PanelItem[]])) as PanelSections;
  for (const task of tasks) {
    const item = buildPanelItem(task, live, sync);
    sections[item.displayStatus].push(item);
  }
  for (const status of STATUSES) {
    sections[status].sort((a, b) => (status === 'review' ? byReviewAttention(a, b) : byRank(a.task, b.task)));
  }
  return sections;
};

/** Rows flagged "look at this" anywhere except Done (that column is deliberate work, not open attention). */
export const countUnseen = (sections: PanelSections): number =>
  Object.values(sections).reduce(
    (count, items) => count + items.filter((item) => item.attention && item.displayStatus !== 'done').length,
    0,
  );

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
