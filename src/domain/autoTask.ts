import type { GuestSessionActivity } from '@openchamber/sdk';
import { DEFAULT_SYNC_OPTIONS, statusForSession, type AgentOutcome, type SyncOptions } from './sync.ts';
import { DEFAULT_TASK_TITLE, TITLE_MAX, type Task, type TaskStatus } from './task.ts';

export type OrphanCandidate = {
  id: string;
  title: string;
  parentId: string | null;
  archivedAt: number | null;
  activity: GuestSessionActivity;
  outcome: AgentOutcome;
  /** The agent the session runs as (`undefined` on hosts older than the field). */
  agent?: string | null;
};

/** Structural eligibility only: a real top-level session, not archived, that no task already points to. */
export const isAdoptable = (session: Pick<OrphanCandidate, 'id' | 'parentId' | 'archivedAt'>, linkedSessionIds: ReadonlySet<string>): boolean =>
  session.parentId === null && session.archivedAt === null && !linkedSessionIds.has(session.id);

/**
 * The column a newly-adopted task should land in, from the session's
 * current activity — reuses the same mapping the live sync uses, just
 * starting from a status ("backlog") no real task has, so the first
 * matching rule always fires. `null` means not active enough yet to adopt
 * (for example, just created with no turn started) — and, with the
 * build-agent Review gate, it also covers a session running as anything
 * else that finished or now waits on the user: for such a session nothing
 * the mapping holds true, so it is not adopted until a new turn of its own
 * starts running.
 */
export const initialStatusForNewSession = (
  session: Pick<OrphanCandidate, 'activity' | 'outcome' | 'agent'>,
  options: SyncOptions = DEFAULT_SYNC_OPTIONS,
): TaskStatus | null => statusForSession('backlog', session.activity, session.outcome, session.agent ?? null, options);

/**
 * The host falls back to the session's own id as its `title` until OpenCode
 * generates a real one from the conversation, so a brand-new session's
 * `title` is rarely empty — it's the id itself. Treating only an *empty*
 * title as "no title yet" let that straight through as a confusing
 * `ses_...`-looking task title. `projectName`, when known, makes a much
 * more useful placeholder than the id ever was.
 */
export const titleForOrphanSession = (session: Pick<OrphanCandidate, 'id' | 'title'>, projectName?: string | null): string => {
  const title = session.title.trim();
  if (title && title !== session.id) return title.slice(0, 200);
  return projectName ? `New session in ${projectName}` : `New session (${session.id.slice(0, 8)})`;
};

/**
 * Whether a snapshot's `title` names the session at all: the host reports
 * the session's own id as the fallback title until OpenCode's title agent
 * writes a real one from the conversation, so the id — or whitespace — means
 * "no name yet". The title promotion (`host/titlePromotion.ts`) acts only
 * on real ones.
 */
export const isRealSessionTitle = (sessionId: string, title: string): boolean => {
  const trimmed = title.trim();
  return trimmed.length > 0 && trimmed !== sessionId;
};

/**
 * The exact placeholder texts adoption (`adoptOrphanSession`) can leave a
 * card titled, rebuilt from the session id and the project name known now:
 * the project-name form, and the id form of an adoption that knew no
 * project. The title promotion overwrites only a stored title matching one
 * of these, so a card the user named is never touched — and a card adopted
 * with the id-form placeholder keeps its eligibility even after the project
 * was registered since. A project renamed between adoption and promotion
 * simply misses (its old name is unrecoverable here); the card keeps the
 * stale placeholder until the user renames it.
 */
export const adoptionPlaceholderTitles = (sessionId: string, projectName: string | null): string[] => [
  ...(projectName ? [`New session in ${projectName}`] : []),
  `New session (${sessionId.slice(0, 8)})`,
];

/**
 * The title given to the session `Start Agent` creates. A task you haven't
 * renamed yet is still titled `DEFAULT_TASK_TITLE` ("New task") — sending
 * that straight through would leave every unrenamed task's session titled
 * identically and unhelpfully, so a real one is derived from the
 * description instead: its first line, the same text the agent is about to
 * read as its own first message. Falls back to the placeholder only when
 * there's truly nothing else to go on (no title, no description).
 */
export const sessionTitleForTask = (task: Pick<Task, 'title' | 'description'>): string => {
  const title = task.title.trim();
  if (title && title !== DEFAULT_TASK_TITLE) return title.slice(0, TITLE_MAX);
  const firstLine = task.description.trim().split('\n')[0]?.trim() ?? '';
  if (firstLine) return firstLine.slice(0, TITLE_MAX);
  return title || DEFAULT_TASK_TITLE;
};
