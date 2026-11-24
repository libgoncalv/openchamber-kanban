import { rankAtEnd } from './board.ts';
import { AGENT_NOTE_MAX, AGENT_NOTES_MAX, DESCRIPTION_MAX, TITLE_MAX, appendAgentEntryId, appendAgentNote, applyPatch, createTask, type Task, type TaskStatus } from './task.ts';

/**
 * The agent channel: how an agent (an OpenCode session in one of the board's
 * projects) reads the board and queues changes to it — through the extension's
 * local service, not through any host API. The wire has three parts, all
 * defined here as pure data and functions:
 *
 * - the **mirror** — any open surface pushes a serializable summary of its
 *   tasks to the service (the service has no host.storage access); agents
 *   read it;
 * - the **journal** — accepted agent writes, appended to the service's data
 *   dir. Every open Kanban surface applies this journal through one shared
 *   op (`store/agentApply.ts`); when none is open the writes simply wait
 *   (`emit` reaches open frames only — "nothing replays" — hence the file);
 * - the **agent task view** — what `GET /agent/tasks` answers: the mirror's
 *   tasks dressed with their project name and directory.
 *
 * Writes stay deliberately narrow: create (Backlog/To Do) and notes. No
 * delete, no Done, no status moves — status is derived from the linked
 * session's own activity, and Done is a human decision everywhere on this
 * board.
 */

export const AGENT_CHANNEL_VERSION = 1;
/** Pending agent writes before the board must catch up; past it, the agent is refused until then. */
export const AGENT_JOURNAL_MAX = 200;
/** One note, as queued by the agent, may not exceed the per-note cap the board keeps. */
export const AGENT_NOTE_WIRE_MAX = AGENT_NOTE_MAX;

export type AgentCreateStatus = 'backlog' | 'todo';
export const AGENT_CREATE_STATUSES: readonly AgentCreateStatus[] = ['backlog', 'todo'];

/** A project as the mirror carries it: id, display name, and the directory that maps "the project the agent runs in" onto it. */
export type MirrorProject = { id: string; name: string; directory: string | null };

/** What the board pushes and `GET /agent/tasks` answers. */
export type AgentTaskView = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  projectId: string | null;
  projectName: string | null;
  sessionId: string | null;
  updatedAt: number;
  notes: Array<{ at: number; text: string }>;
};

/** The whole mirror document the board pushes (`PUT /agent/mirror`, service data dir `mirror.json`). */
export type MirrorDoc = {
  v: typeof AGENT_CHANNEL_VERSION;
  savedAt: number;
  projects: MirrorProject[];
  tasks: AgentTaskView[];
};

/** One journal entry (`journal.jsonl` line): id-carrying so the board can acknowledge exactly what it applied. */
export type AgentJournalEntry =
  | { id: string; v: typeof AGENT_CHANNEL_VERSION; kind: 'create'; at: number; title: string; description: string; directory: string | null; projectId: string | null; status: AgentCreateStatus }
  | { id: string; v: typeof AGENT_CHANNEL_VERSION; kind: 'note'; at: number; taskId: string; text: string };

// ---- The journal ----

const ENTRY_ID_PATTERN = /^a_[0-9a-f]{8,64}$/;

/**
 * Validates one journal line as loaded from disk. Throws like `parseTask`
 * does — the reader catches per line and skips the broken ones, so one
 * corrupt line can never take the whole journal down.
 */
export const parseJournalEntry = (value: unknown): AgentJournalEntry => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Journal entry is not an object');
  const record = value as Record<string, unknown>;
  if (record.v !== AGENT_CHANNEL_VERSION) throw new Error(`Unsupported journal entry version ${String(record.v)}`);
  if (typeof record.id !== 'string' || !ENTRY_ID_PATTERN.test(record.id)) throw new Error('Journal entry id is invalid');
  if (typeof record.at !== 'number' || !Number.isFinite(record.at) || record.at < 0) throw new Error('Journal entry at must be a timestamp');
  if (record.kind === 'create') {
    if (typeof record.title !== 'string' || !record.title.trim() || record.title.length > TITLE_MAX) throw new Error('Journal create title is invalid');
    if (typeof record.description !== 'string' || record.description.length > DESCRIPTION_MAX) throw new Error('Journal create description is invalid');
    if (record.directory !== null && typeof record.directory !== 'string') throw new Error('Journal create directory is invalid');
    if (record.projectId !== null && typeof record.projectId !== 'string') throw new Error('Journal create projectId is invalid');
    if (!(AGENT_CREATE_STATUSES as readonly string[]).includes(record.status as string)) throw new Error('Journal create status is invalid');
    return {
      id: record.id, v: AGENT_CHANNEL_VERSION, kind: 'create', at: record.at,
      title: record.title, description: record.description,
      directory: record.directory, projectId: record.projectId, status: record.status as AgentCreateStatus,
    };
  }
  if (record.kind === 'note') {
    if (typeof record.taskId !== 'string' || record.taskId.length > 64) throw new Error('Journal note taskId is invalid');
    if (typeof record.text !== 'string' || record.text.length > AGENT_NOTE_WIRE_MAX) throw new Error('Journal note text is invalid');
    return { id: record.id, v: AGENT_CHANNEL_VERSION, kind: 'note', at: record.at, taskId: record.taskId, text: record.text };
  }
  throw new Error('Journal entry kind is invalid');
};

/**
 * What the service accepts in one `POST /agent/tasks` body, validated the
 * `parseTask` way: throw with a human reason, so the agent's tool result says
 * what to fix instead of a number. The description is refused, not clamped —
 * unlike dictated audio, a text request can simply be corrected by its author.
 */
export type AgentCreateRequest = { title: string; description: string; directory: string | null; status: AgentCreateStatus };
export type AgentNoteRequest = { text: string };

export const parseAgentCreateRequest = (value: unknown): AgentCreateRequest => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Request body must be a JSON object');
  const record = value as Record<string, unknown>;
  if (typeof record.title !== 'string' || !record.title.trim()) throw new Error('A task needs a title');
  const title = record.title.trim();
  if (title.length > TITLE_MAX) throw new Error(`Title is limited to ${TITLE_MAX} characters`);
  if (record.description !== undefined && typeof record.description !== 'string') throw new Error('Description must be text');
  const description = record.description ?? '';
  if (description.length > DESCRIPTION_MAX) throw new Error(`Description is limited to ${DESCRIPTION_MAX} characters`);
  if (record.directory !== undefined && record.directory !== null && typeof record.directory !== 'string') throw new Error('directory must be a string or null');
  const directory = record.directory ?? null;
  const status = record.status ?? 'backlog';
  if (!(AGENT_CREATE_STATUSES as readonly string[]).includes(status as string)) throw new Error("status must be 'backlog' or 'todo'");
  return { title, description, directory, status: status as AgentCreateStatus };
};

export const parseAgentNoteRequest = (value: unknown): AgentNoteRequest => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Request body must be a JSON object');
  const record = value as Record<string, unknown>;
  if (typeof record.text !== 'string' || !record.text.trim()) throw new Error('A note needs text');
  if (record.text.length > AGENT_NOTE_MAX) throw new Error(`A note is limited to ${AGENT_NOTE_MAX} characters`);
  return { text: record.text };
};

// ---- The mirror ----

/** Mirror guards: the serviceRequest body cap (64 000 chars) decides the biggest doc the board can push. */
const MIRROR_TASKS_MAX = 2000;
const MIRROR_VIEW_BODY_MAX = 50_000; // json-stringified chars; leaves room for the request envelope

const viewOfTask = (task: Task, projectName: string | null): AgentTaskView => ({
  id: task.id,
  title: task.title,
  description: task.description,
  status: task.status,
  projectId: task.projectId,
  projectName,
  sessionId: task.sessionId,
  updatedAt: task.updatedAt,
  notes: (task.agentNotes ?? []).map((note) => ({ at: note.at, text: note.text })),
});

export const mirrorBodyLength = (doc: MirrorDoc): number => JSON.stringify(doc).length;

/**
 * The mirror the board pushes, cut back step by step until the JSON fits the
 * `serviceRequest` body cap: full descriptions first, then shorter ones, then
 * none — with tasks ordered most-recently-updated first at every cut, so what
 * survives is what the board worked on last. A mirror a few sizes smaller than
 * the truth is honest about exactly that (the agent reads a summary; the
 * board's cards hold the full text), and the listing never lies about
 * existence or status — only depth.
 */
export const buildMirrorDoc = (tasks: readonly Task[], projects: readonly { id: string; name: string; directory: string | null }[], savedAt: number): MirrorDoc => {
  const byId = new Map(projects.map((project) => [project.id, project.name]));
  const ordered = [...tasks].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, MIRROR_TASKS_MAX).reverse();
  const levels: Array<(list: AgentTaskView[]) => AgentTaskView[]> = [
    (list) => list,
    (list) => list.map((view) => ({ ...view, description: view.description.length > 1500 ? `${view.description.slice(0, 1498).trimEnd()} …` : view.description })),
    (list) => list.map((view) => ({ ...view, description: view.description.length > 400 ? `${view.description.slice(0, 398).trimEnd()} …` : view.description })),
    (list) => list.map((view) => ({ ...view, description: '' })),
    (list) => list.slice(-60).map((view) => ({ ...view, description: '', notes: [] })),
  ];
  const projectViews = projects.map((project) => ({ id: project.id, name: project.name, directory: project.directory ?? null }));
  let trimmed = ordered.map((task) => viewOfTask(task, task.projectId ? byId.get(task.projectId) ?? null : null));
  for (const level of levels) {
    const applied = level(trimmed);
    const doc: MirrorDoc = { v: AGENT_CHANNEL_VERSION, savedAt, projects: projectViews, tasks: applied };
    if (mirrorBodyLength(doc) <= MIRROR_VIEW_BODY_MAX) return doc;
    trimmed = applied;
  }
  // The tightest level still over: cut tasks from the front until it fits.
  while (trimmed.length > 1 && mirrorBodyLength({ v: AGENT_CHANNEL_VERSION, savedAt, projects: projectViews, tasks: trimmed }) > MIRROR_VIEW_BODY_MAX) {
    trimmed = trimmed.slice(1);
  }
  return { v: AGENT_CHANNEL_VERSION, savedAt, projects: projectViews, tasks: trimmed };
};

/** Reads a mirror document from disk leniently: shape-checked top level, junk rows dropped, corrupt file → null. */
export const parseMirrorDoc = (value: unknown): MirrorDoc | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  if (record.v !== AGENT_CHANNEL_VERSION || typeof record.savedAt !== 'number' || !Number.isFinite(record.savedAt)) return null;
  const projects: MirrorProject[] = Array.isArray(record.projects)
    ? record.projects.flatMap((raw) => {
        if (!raw || typeof raw !== 'object') return [];
        const one = raw as Record<string, unknown>;
        if (typeof one.id !== 'string' || typeof one.name !== 'string') return [];
        if (one.directory !== null && typeof one.directory !== 'string') return [];
        return [{ id: one.id, name: one.name, directory: one.directory as string | null }];
      })
    : [];
  const tasks: AgentTaskView[] = Array.isArray(record.tasks)
    ? record.tasks.flatMap((raw) => {
        if (!raw || typeof raw !== 'object') return [];
        const one = raw as Record<string, unknown>;
        if (typeof one.id !== 'string' || typeof one.title !== 'string' || typeof one.description !== 'string') return [];
        if (typeof one.updatedAt !== 'number' || !Number.isFinite(one.updatedAt)) return [];
        return [{
          id: one.id,
          title: one.title,
          description: one.description,
          status: one.status === 'backlog' || one.status === 'todo' || one.status === 'in_progress' || one.status === 'review' || one.status === 'done' ? one.status : 'backlog',
          projectId: typeof one.projectId === 'string' ? one.projectId : null,
          projectName: typeof one.projectName === 'string' ? one.projectName : null,
          sessionId: typeof one.sessionId === 'string' ? one.sessionId : null,
          updatedAt: one.updatedAt,
          notes: Array.isArray(one.notes)
            ? one.notes.flatMap((note) => {
                if (!note || typeof note !== 'object') return [];
                const n = note as Record<string, unknown>;
                if (typeof n.at !== 'number' || !Number.isFinite(n.at) || typeof n.text !== 'string') return [];
                return [{ at: n.at, text: n.text }];
              })
            : [],
        }];
      })
    : [];
  return { v: AGENT_CHANNEL_VERSION, savedAt: record.savedAt, projects, tasks };
};

/**
 * Maps "the directory the agent runs in" onto a project: exact match first,
 * then the longest registered project directory that prefixes it on a path
 * boundary (so `/repo` maps a session in `/repo/sub/dir`, but `/rec` never
 * maps to `/repo`). `null` when nothing matches — the board will try again on
 * its fresher, live project list at apply time.
 */
export const resolveDirectoryToProject = (projects: readonly MirrorProject[], directory: string | null): string | null => {
  if (!directory) return null;
  const exact = projects.find((project) => project.directory !== null && project.directory === directory);
  if (exact) return exact.id;
  let best: { id: string; length: number } | null = null;
  for (const project of projects) {
    if (project.directory === null) continue;
    if (!directory.startsWith(project.directory.endsWith('/') ? project.directory : `${project.directory}/`)) continue;
    if (best === null || project.directory.length > best.length) best = { id: project.id, length: project.directory.length };
  }
  return best?.id ?? null;
};

export const projectForDirectory = resolveDirectoryToProject;

// ---- Applying the journal (board side) ----

export type PendingApplyPlan = {
  /** Fresh tasks to save; `task` carries the board-minted id computed at plan time, and stamps its creating entry id (`agentEntryIds`). */
  creates: Array<{ entryId: string; task: Task }>;
  /** Per task (notes folded in sequence), the updated task and the entries that produced it; the fold stamps those entry ids too. */
  notes: Array<{ entryIds: string[]; taskId: string; task: Task }>;
  /** Entry ids ack-worthy without any write: a note naming a task that no longer exists. */
  dropped: string[];
  /**
   * Entry ids ack-worthy without any write because their work is already in
   * storage: another open surface applied this journal moments ago and
   * stamped the entry ids on its task. The apply's idempotency key —
   * reapplying these would duplicate a card or a note, so they are only
   * acknowledged. Same applies to note entries whose task exists but whose
   * stamp is already there.
   */
  alreadyLanded: string[];
};

/**
 * Pure plan of what a journal pull becomes on the board: full `Task` records
 * the caller can save (creates appended at the target column's end, notes
 * folded onto their task), plus the entry ids that are done mattering. Create
 * projects resolve against the board's live project list first (the entry's
 * service-time pick when that is still among them), then the entry's
 * directory, then `null` — the task lands unplaced rather than misplaced.
 * `appliedEntryIds` is the fresh reader's book: entry ids already stamped on
 * a stored task never plan a write, they only ack. Nothing here writes; the
 * caller owns saves, acks, state and toasts.
 */
export const planPendingApply = (
  entries: readonly AgentJournalEntry[],
  tasks: readonly Task[],
  projects: readonly { id: string; directory: string | null }[],
  newId: () => string,
  now: number,
  appliedEntryIds: ReadonlySet<string> = new Set<string>(),
): PendingApplyPlan => {
  const known = new Set(projects.map((project) => project.id));
  const creates: PendingApplyPlan['creates'] = [];
  const noteTargets = new Map<string, { entryIds: string[]; texts: Array<{ at: number; text: string }> }>();
  const dropped: string[] = [];
  const alreadyLanded: string[] = [];
  for (const entry of entries) {
    if (appliedEntryIds.has(entry.id)) { alreadyLanded.push(entry.id); continue; }
    if (entry.kind === 'create') {
      const projectId = typeof entry.projectId === 'string' && known.has(entry.projectId)
        ? entry.projectId
        : resolveDirectoryToProject(projects.map((project) => ({ id: project.id, name: '', directory: project.directory })), entry.directory);
      creates.push({
        entryId: entry.id,
        task: {
          ...createTask(
            { title: entry.title, description: entry.description, projectId, status: entry.status },
            // Appended at the target column's end, the same place a
            // quick-created task lands. Rank is plan-time state; a concurrent
            // user move may have shifted ranks since — the same benign race
            // every adoption already tolerates.
            rankAtEnd(tasks, entry.status),
            now,
            newId(),
          ),
          // The idempotency stamp: whatever surface's record wins the
          // post-save convergence, it says which entry shaped it.
          agentEntryIds: [entry.id],
        },
      });
    } else {
      const task = tasks.find((candidate) => candidate.id === entry.taskId);
      if (!task) { dropped.push(entry.id); continue; }
      const target = noteTargets.get(entry.taskId) ?? { entryIds: [], texts: [] };
      target.entryIds.push(entry.id);
      target.texts.push({ at: Math.min(now, entry.at || now), text: entry.text });
      noteTargets.set(entry.taskId, target);
    }
  }
  const notes: PendingApplyPlan['notes'] = [];
  for (const [taskId, target] of noteTargets) {
    const current = tasks.find((candidate) => candidate.id === taskId)!;
    const merged = target.texts.reduce(
      (existing, note) => appendAgentNote(existing, note.text, note.at),
      current.agentNotes,
    );
    // The fold stamps every entry that landed here, so a replay (the ack
    // lost, the pull repeated) folds nothing twice.
    const stamped = target.entryIds.reduce(
      (existing, entryId) => appendAgentEntryId(existing, entryId),
      current.agentEntryIds,
    );
    notes.push({
      entryIds: target.entryIds,
      taskId,
      task: applyPatch(current, { agentNotes: merged, agentEntryIds: stamped }),
    });
  }
  return { creates, notes, dropped, alreadyLanded };
};
