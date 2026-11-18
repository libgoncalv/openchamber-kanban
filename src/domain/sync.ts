import type { GuestSessionActivity } from '@openchamber/sdk';
import type { TaskStatus } from './task.ts';

export type AgentOutcome = 'completed' | 'failed' | null;

/**
 * The agent a linked session runs as, as the live record reports it —
 * `build` for the doer OpenChamber starts and dispatches, `plan` and others
 * for conversational agents, `null` or `undefined` on hosts predating the
 * field or when the host knows nothing.
 */
export type SessionAgent = string | null | undefined;

export type SyncOptions = {
  /** Agent is blocked on a tool-permission prompt. Treated like a question by default. */
  waitingPermissionMeansReview: boolean;
  /** The agent's turn ended in an error. */
  failedMeansReview: boolean;
};

export const DEFAULT_SYNC_OPTIONS: SyncOptions = {
  waitingPermissionMeansReview: true,
  failedMeansReview: true,
};

/**
 * Whether an agent's turns may auto-land its task in Review. Only the build
 * agent is a known doer: anything else (plan, brainstorm, a custom agent) is
 * a conversation, not a work product, and its turns — finished, failed or
 * waiting on the user — must not shuffle the card anywhere on their own.
 * The agent field is optional in the host contract, and the agent the
 * session was started with is exactly what "today's behavior" meant, so an
 * absent or empty value keeps the old (ungated) move. Matched
 * case-insensitively: the host's own agent picker case is its business.
 */
export const reviewEligibleAgent = (agent: SessionAgent): boolean => {
  const name = agent?.trim().toLowerCase() ?? '';
  return name === '' || name === 'build';
};

/**
 * Maps a linked session's live state to the task status it implies, or
 * `null` when nothing should change. A task the user marked Done is never
 * moved by this: Done stays a deliberate, user-only action (see board
 * requirements — an agent finishing a turn must not mark a task Done).
 *
 * Rules (as directed): the agent actively working moves the task to
 * In Progress from anywhere, whatever agent the session runs as; the agent
 * finishing, asking a question, or (per `options`) hitting a permission
 * prompt or a failure moves it to Review, so the user notices without the
 * agent ever claiming "done" itself — but only when the session runs as
 * the build agent (`reviewEligibleAgent`): a plan or discussion session's
 * turn, a question included, leaves the card where it ran, and the user
 * moves it themselves. The gate blocks only the move into Review; a card
 * already there stays there, and Done of course never moves either way.
 *
 * `agent` is the linked session record's field as the snapshot carries it
 * (`session.agent ?? null` — see `sessionSync.ts` and `autoTask.ts`).
 */
export const statusForSession = (
  current: TaskStatus,
  activity: GuestSessionActivity,
  outcome: AgentOutcome,
  agent: SessionAgent,
  options: SyncOptions = DEFAULT_SYNC_OPTIONS,
): TaskStatus | null => {
  if (current === 'done') return null;
  const toReview = (): TaskStatus | null => {
    if (!reviewEligibleAgent(agent)) return null;
    return current === 'review' ? null : 'review';
  };
  const toInProgress = () => (current === 'in_progress' ? null : 'in_progress');
  switch (activity) {
    case 'running':
    case 'retrying':
      return toInProgress();
    case 'waiting-question':
      return toReview();
    case 'waiting-permission':
      return options.waitingPermissionMeansReview ? toReview() : null;
    case 'idle':
      if (outcome === 'completed') return toReview();
      if (outcome === 'failed') return options.failedMeansReview ? toReview() : null;
      return null;
    default:
      return null;
  }
};
