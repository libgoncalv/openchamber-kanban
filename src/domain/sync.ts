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
 * `null` when nothing should change.
 *
 * Rules (as directed): the agent actively working moves the task to
 * In Progress from anywhere — Done and Archive included, so rework in the
 * same session pulls the card back out, whatever agent the session runs as
 * (and re-entering Done after the rework starts the archive window fresh);
 * the agent finishing, asking a question, or (per `options`) hitting a
 * permission prompt or a failure moves it to Review, so the user notices
 * without the agent ever claiming "done" itself — but only when the session
 * runs as the build agent (`reviewEligibleAgent`): a plan or discussion
 * session's turn, a question included, leaves the card where it ran, and
 * the user moves it themselves. The gate blocks only the move into Review;
 * a card already there stays there.
 *
 * Done is deliberately one-way in the other moves: only a *running* session
 * ever lifts a card out of Done (the rework pull-back above). A waiting or
 * idle snapshot never rewrote Done — the board's auto-done rule
 * (`autoDoneReady` in `boardView.ts`) is the only other writer of Done, and
 * it is the user's own observed read plus commits, not the session's
 * outcome. Archived holds the same way, one step further retired: a linked
 * session finishing again must not drag a two-week-old card back out of the
 * Archive column, and the user's own click is the only way back. Before the
 * pull-back existed this mapping refused to touch Done at all; that
 * refusal now covers exactly the paths that would land the card back in
 * Review.
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
  const toReview = (): TaskStatus | null => {
    if (current === 'done' || current === 'archived') return null;
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
