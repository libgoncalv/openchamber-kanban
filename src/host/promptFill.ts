import type { HostClient } from '@openchamber/sdk';

export type PromptFillHost = Pick<HostClient, 'prompt'>;

/**
 * How long the settled re-write waits after the chat opened: long enough for
 * the host's session-switch commit to have flushed, short enough that the
 * composer is filled before the user has finished noticing the new chat.
 */
export const PROMPT_FILL_SETTLED_MS = 700;

export type FillComposerOptions = {
  /** Override the settle delay (tests pass a few ms to run on real timers). */
  settledMs?: number;
  /** Called at most once: the write that failed was the last one this flow could make. */
  onLost?: () => void;
};

/**
 * Fill the composer of a chat that was just opened — never send anything.
 *
 * The text goes in with `host.prompt` and `send` omitted, which the host
 * answers `{ sent: 'skipped' }` for whatever happens. The fill has no
 * per-session targeting (verified against the installed host's own guest
 * bridge): `prompt` without `send` writes the host's single pending composer
 * slot (`setPendingInputText(text, 'replace')`), and only the editor showing
 * the session that is *current when the consuming effect runs* picks it up.
 * `openSession` resolves before the host's switch commit lands, so a write
 * issued right after it races that commit — an editor still showing the old
 * session, or the switch's own cleanup writers, can consume or clear the
 * slot first. The new chat's composer then mounts against an empty slot.
 * Whether that race is lost depends on the surface's layout: at rail width
 * the single always-mounted editor wins every time (the quick-open's fill
 * has always landed), in the expanded panel the reflow could eat it. The
 * host never signals the difference, so the loss is silent.
 *
 * This module's answer is two writes of the same text:
 *
 * 1. **now** — the write that wins whenever the surface survives the open,
 *    which every panel surface does, and which the full-screen page
 *    dispatches in the same task the `openSession` resolved in;
 *
 * 2. **settled** — one more write once the switch commit has flushed, when
 *    the new chat's editor is the mounted, current-session consumer. When
 *    the first write already landed, this is a re-set of the same text (and
 *    re-focuses the composer, which suits the review-or-edit-then-send
 *    flow); when the first was eaten by the switch, this is the only thing
 *    that fills the composer. A user who typed into the composer inside the
 *    settle window would have that typing replaced — the window is short on
 *    purpose.
 *
 * A surface that died in flight never runs the second write — nothing can
 * toast from a dead context, and the text stays safe on the task for the
 * board to surface. `onLost` fires once, only in the case where the fill is
 * provably gone: the immediate write never reached the host *and* the
 * settled write did not either — after that nothing will ever be attempted
 * again. A write the host did process can still lose the consume race,
 * which no RPC result can distinguish; the settled write is what makes that
 * case land.
 */
export const fillComposerAfterOpen = (
  host: PromptFillHost,
  text: string,
  { settledMs = PROMPT_FILL_SETTLED_MS, onLost }: FillComposerOptions = {},
): void => {
  // Attempt one — land immediately (see the module note for what it may
  // lose). Nothing is reported for this write: the loss it can cause is
  // recoverable by the settled one, or unknowable.
  let firstWriteReachedHost: boolean | null = null;
  void host
    .prompt({ text })
    .then(
      () => { firstWriteReachedHost = true; },
      () => { firstWriteReachedHost = false; },
    );
  // Attempt two — recovers whatever the first lost: the consume race, or a
  // write that never left the guest at all. When this one also never
  // reaches the host, no write will ever be attempted again — the moment
  // `onLost` exists for.
  setTimeout(() => {
    void host
      .prompt({ text })
      .catch(() => {
        if (firstWriteReachedHost === false) onLost?.();
      });
  }, settledMs);
};
