export const STATUSES = ['backlog', 'todo', 'in_progress', 'review', 'done'] as const;
export type TaskStatus = (typeof STATUSES)[number];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  todo: 'To Do',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
};

export const TASK_SCHEMA_VERSION = 1;
export const TITLE_MAX = 200;
export const DESCRIPTION_MAX = 16000;
/** What one agent note may hold, and how many a task keeps (oldest dropped first). */
export const AGENT_NOTE_MAX = 2000;
export const AGENT_NOTES_MAX = 20;
/** What `Add task` titles a brand-new, not-yet-edited task. Treated as "no real title yet" wherever that distinction matters (e.g. choosing a session's title). */
export const DEFAULT_TASK_TITLE = 'New task';
const REF_MAX = 512;
const ID_PATTERN = /^t_[a-z0-9]{6,40}$/;

export type TaskWorktree = { directory: string; branch: string | null };

/** One wrap-up or breakdown note an agent left on a task through the agent channel. */
export type AgentNote = { at: number; text: string };

export type Task = {
  schemaVersion: typeof TASK_SCHEMA_VERSION;
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  rank: number;
  projectId: string | null;
  sourceBranch: string | null;
  worktree: TaskWorktree | null;
  sessionId: string | null;
  createdAt: number;
  updatedAt: number;
  /**
   * Set when a status change you didn't make yourself (the live agent-status
   * sync, or auto-adopting a running session) lands the task in Review —
   * never by a status change you made yourself. Cleared the moment you open
   * the task, whether that's its chat or its detail popup. `null` means
   * nothing is waiting on your attention. A task saved before this field
   * existed simply has no marker, which is correct: it was never flagged.
   */
  needsAttentionSince: number | null;
  /**
   * Wrap-up / breakdown notes agents left on this task through the agent
   * channel (the board applies them from the service's journal). Absent on
   * tasks that never received one — exactly like a record saved before
   * `needsAttentionSince` existed. Not a status and never saved directly by
   * the agent: the board is the only writer, same as every other field.
   */
  agentNotes?: AgentNote[];
  /**
   * The commit hash in the task's worktree when the board's auto-done rule
   * wrote Done itself (see `boardView.ts`). Re-firing stays a no-op as long
   * as the worktree's HEAD matches this: dragging the card back out of Done
   * holds until a newer commit actually lands. Absent (`null`) on tasks the
   * rule never fired for, exactly like a record saved before this field
   * existed.
   */
  autoDoneCommit: string | null;
  /**
   * When the task's session was linked, the anchor of the board's auto-done
   * rule for session cards that run in the project root (the common case —
   * most agents never enter a worktree): at least one commit newer than this
   * moment proves the linked session produced work. `null` on tasks linked
   * before this field existed (the board backfills them with `createdAt` on
   * its next load) and on tasks whose session link was cleared, which also
   * retires the evidence — a task no longer points at the session its
   * commits belong to. Cleared links and worktrees follow the same rule.
   */
  sessionLinkedAt: number | null;
};

export type TaskDraft = {
  title: string;
  description?: string;
  status?: TaskStatus;
  projectId?: string | null;
  sourceBranch?: string | null;
};

export type TaskPatch = Partial<
  Pick<Task, 'title' | 'description' | 'status' | 'projectId' | 'sourceBranch' | 'worktree' | 'sessionId' | 'rank' | 'needsAttentionSince' | 'agentNotes' | 'autoDoneCommit' | 'sessionLinkedAt'>
>;

export const isStatus = (value: unknown): value is TaskStatus =>
  typeof value === 'string' && (STATUSES as readonly string[]).includes(value);

export const newTaskId = (now = Date.now(), random: () => number = Math.random) => {
  const suffix = Array.from({ length: 6 }, () => Math.floor(random() * 36).toString(36)).join('');
  return `t_${now.toString(36)}${suffix}`;
};

const optionalRef = (value: unknown, field: string): string | null => {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string') throw new Error(`${field} must be a string`);
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > REF_MAX) throw new Error(`${field} is too long`);
  return trimmed;
};

const cleanTitle = (value: unknown) => {
  if (typeof value !== 'string') throw new Error('Title must be text');
  const title = value.trim();
  if (!title) throw new Error('A task needs a title');
  if (title.length > TITLE_MAX) throw new Error(`Title is limited to ${TITLE_MAX} characters`);
  return title;
};

const cleanDescription = (value: unknown) => {
  if (value === undefined || value === null) return '';
  if (typeof value !== 'string') throw new Error('Description must be text');
  if (value.length > DESCRIPTION_MAX) throw new Error(`Description is limited to ${DESCRIPTION_MAX} characters`);
  return value;
};

/**
 * Append dictated text to the existing description with a single space
 * separator. Never throws: the result is clamped to DESCRIPTION_MAX (with the
 * tail cut cleanly at whitespace where possible) because a dictated clip that
 * would overflow the limit must lose its tail, not fail the whole save.
 */
export const appendDictatedDescription = (existing: string, dictated: string): { description: string; clamped: boolean } => {
  const addition = dictated.replace(/\s+/g, ' ').trim();
  const joined = existing.trim() ? `${existing.trimEnd()} ${addition}` : addition;
  if (joined.length <= DESCRIPTION_MAX) return { description: joined, clamped: false };
  const room = DESCRIPTION_MAX - 3;
  const cut = joined.slice(0, room);
  const lastSpace = cut.lastIndexOf(' ');
  const truncated = lastSpace > room * 0.6 ? cut.slice(0, lastSpace) : cut;
  return { description: `${truncated.trimEnd()} …`, clamped: true };
};

const cleanAgentNotes = (value: unknown): AgentNote[] | undefined => {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) throw new Error('agentNotes must be an array');
  const notes: AgentNote[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== 'object') throw new Error('agentNotes entries must be objects');
    const record = raw as Record<string, unknown>;
    notes.push({ at: cleanTimestamp(record.at, 'agentNotes.at'), text: cleanDescription(record.text) });
  }
  return notes;
};

/**
 * Clamps one agent note's text to `AGENT_NOTE_MAX` the `appendDictatedDescription`
 * way (cut cleanly at whitespace where possible, tail dropped with `…`), and
 * merges it into a task's existing notes. A note left after the cap is not an
 * error the agent could fix — the oldest notes give way, so the newest
 * wrap-up always lands. Pure.
 */
export const appendAgentNote = (existing: AgentNote[] | undefined, text: string, at: number): AgentNote[] => {
  const addition = text.replace(/\s+/g, ' ').trim();
  const clamped = addition.length > AGENT_NOTE_MAX
    ? `${addition.slice(0, Math.max(0, AGENT_NOTE_MAX - 2)).trimEnd()} …`
    : addition;
  const source = existing ?? [];
  const merged = [...source, { at, text: clamped }];
  return merged.length > AGENT_NOTES_MAX ? merged.slice(merged.length - AGENT_NOTES_MAX) : merged;
};

/** For `parseTask`: absent notes add nothing; present notes validate, and a broken one fails the record. */
const cleanAgentNotesOptional = (value: unknown): { agentNotes?: AgentNote[] } =>
  value === undefined ? {} : { agentNotes: cleanAgentNotes(value) };

const cleanWorktree = (value: unknown): TaskWorktree | null => {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'object') throw new Error('worktree must be an object');
  const record = value as Record<string, unknown>;
  const directory = optionalRef(record.directory, 'worktree.directory');
  if (!directory) throw new Error('worktree.directory is required');
  return { directory, branch: optionalRef(record.branch, 'worktree.branch') };
};

const cleanTimestamp = (value: unknown, field: string) => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) throw new Error(`${field} must be a timestamp`);
  return value;
};

/** Like `cleanTimestamp`, but absent (a record saved before this field existed) is a valid `null`, not an error. */
const optionalTimestamp = (value: unknown, field: string): number | null => {
  if (value === null || value === undefined) return null;
  return cleanTimestamp(value, field);
};

export const createTask = (draft: TaskDraft, rank: number, now = Date.now(), id = newTaskId(now)): Task => ({
  schemaVersion: TASK_SCHEMA_VERSION,
  id,
  title: cleanTitle(draft.title),
  description: cleanDescription(draft.description),
  status: draft.status ?? 'backlog',
  rank,
  projectId: optionalRef(draft.projectId, 'projectId'),
  sourceBranch: optionalRef(draft.sourceBranch, 'sourceBranch'),
  worktree: null,
  sessionId: null,
  createdAt: now,
  updatedAt: now,
  needsAttentionSince: null,
  autoDoneCommit: null,
  sessionLinkedAt: null,
});

export const applyPatch = (task: Task, patch: TaskPatch, now = Date.now()): Task => {
  const next: Task = { ...task, updatedAt: Math.max(now, task.updatedAt) };
  if ('title' in patch) next.title = cleanTitle(patch.title);
  if ('description' in patch) next.description = cleanDescription(patch.description);
  if ('status' in patch) {
    if (!isStatus(patch.status)) throw new Error('Unknown status');
    next.status = patch.status;
  }
  if ('projectId' in patch) next.projectId = optionalRef(patch.projectId, 'projectId');
  if ('sourceBranch' in patch) next.sourceBranch = optionalRef(patch.sourceBranch, 'sourceBranch');
  if ('worktree' in patch) next.worktree = cleanWorktree(patch.worktree);
  if ('sessionId' in patch) next.sessionId = optionalRef(patch.sessionId, 'sessionId');
  if ('rank' in patch) {
    if (typeof patch.rank !== 'number' || !Number.isFinite(patch.rank)) throw new Error('rank must be a number');
    next.rank = patch.rank;
  }
  if ('needsAttentionSince' in patch) next.needsAttentionSince = optionalTimestamp(patch.needsAttentionSince, 'needsAttentionSince');
  if ('autoDoneCommit' in patch) next.autoDoneCommit = optionalRef(patch.autoDoneCommit, 'autoDoneCommit');
  if ('sessionLinkedAt' in patch) next.sessionLinkedAt = optionalTimestamp(patch.sessionLinkedAt, 'sessionLinkedAt');
  if ('agentNotes' in patch) {
    const notes = cleanAgentNotes(patch.agentNotes);
    if (notes !== undefined) next.agentNotes = notes;
    else delete next.agentNotes;
  }
  return next;
};

/** Validates an untrusted stored value. Throws with a reason when it is not a task. */
export const parseTask = (value: unknown): Task => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Task record is not an object');
  const record = value as Record<string, unknown>;
  if (record.schemaVersion !== TASK_SCHEMA_VERSION) throw new Error(`Unsupported task schema ${String(record.schemaVersion)}`);
  if (typeof record.id !== 'string' || !ID_PATTERN.test(record.id)) throw new Error('Task id is invalid');
  if (!isStatus(record.status)) throw new Error('Task status is invalid');
  if (typeof record.rank !== 'number' || !Number.isFinite(record.rank)) throw new Error('Task rank is invalid');
  return {
    schemaVersion: TASK_SCHEMA_VERSION,
    id: record.id,
    title: cleanTitle(record.title),
    description: cleanDescription(record.description),
    status: record.status,
    rank: record.rank,
    projectId: optionalRef(record.projectId, 'projectId'),
    sourceBranch: optionalRef(record.sourceBranch, 'sourceBranch'),
    worktree: cleanWorktree(record.worktree),
    sessionId: optionalRef(record.sessionId, 'sessionId'),
    createdAt: cleanTimestamp(record.createdAt, 'createdAt'),
    updatedAt: cleanTimestamp(record.updatedAt, 'updatedAt'),
    needsAttentionSince: optionalTimestamp(record.needsAttentionSince, 'needsAttentionSince'),
    autoDoneCommit: optionalRef(record.autoDoneCommit, 'autoDoneCommit'),
    sessionLinkedAt: optionalTimestamp(record.sessionLinkedAt, 'sessionLinkedAt'),
    ...cleanAgentNotesOptional(record.agentNotes),
  };
};
