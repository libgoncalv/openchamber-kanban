/**
 * Which view the panel frame mounts: the compact quick-actions mirror, or the
 * full interactive board. The host already carries the user-facing affordance
 * — a context panel's expand toggle folds the sidebar and hands the surface
 * almost the whole window — and the frame's iframe resizes with it, so the
 * rule below is all the entry needs. Pure, so the choice is unit-tested and
 * the entry file stays a thin shell around it.
 */
export type PanelViewMode = 'mirror' | 'board';
/** The host's `ready.device.formFactor`: `desktop` is everything but a touch layout. */
export type PanelFormFactor = 'phone' | 'tablet' | 'desktop';

/** Frame width (CSS px) at which the panel first mounts the full board. */
export const PANEL_BOARD_WIDTH = 640;
/**
 * Dead band around the threshold: once the board is up the panel may lose
 * some width (the host's resize, a wider chat sliver the user drags) without
 * collapsing back, and once the mirror is up it takes a clear step beyond the
 * threshold to swap to the board — a drag that hovers near the line never
 * flip-flops the view. A swap disposes the mounted view (both surfaces
 * release every subscription they hold), which also resets its transient
 * state — selection, an armed confirm, an open dialog; the band keeps that
 * rare and always the user's own deliberate resize.
 */
export const PANEL_HYSTERESIS = 128;

export const viewModeFor = (
  current: PanelViewMode | null,
  width: number,
  formFactor: PanelFormFactor,
): PanelViewMode => {
  // Touch layouts mount only the mirror, however wide their panel draws: the
  // host's phone and tablet layouts are the touch reality the mirror's rows
  // and 44px targets are tuned for (and a landscape phone could otherwise
  // cross the width threshold); a touch host's full board is the page.
  if (formFactor !== 'desktop') return 'mirror';
  if (current === 'board') return width >= PANEL_BOARD_WIDTH - PANEL_HYSTERESIS ? 'board' : 'mirror';
  return width >= PANEL_BOARD_WIDTH + (current === 'mirror' ? PANEL_HYSTERESIS : 0) ? 'board' : 'mirror';
};
