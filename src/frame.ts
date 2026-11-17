import { connectHost } from '@openchamber/sdk';
import { applyHostReady } from '@openchamber/sdk/ui';
import { mountKanbanBoard } from './ui/board.ts';
import { mountKanbanMirror } from './panelMirror.ts';
import { viewModeFor, type PanelViewMode } from './domain/viewMode.ts';

/**
 * The panel entry behind the rail icon: one frame that is the quick-actions
 * mirror at rail widths, and the interactive board when the host's context
 * panel expands (or is dragged) wide — on a desktop only. The host already
 * carries the user-facing affordance: its per-tab expand toggle folds the
 * sidebar and hands the surface almost the whole window (a drag-resizable
 * chat sliver beside it), and the frame's iframe resizes with every step, so
 * this needs no host change and no reload. `viewModeFor` derives the view
 * from the device shape (`ready.device` — touch layouts never mount the
 * board, whatever their width) and the frame's own width, with hysteresis so
 * a drag near the threshold never flip-flops the view.
 *
 * A swap disposes the mounted view before the other mounts: both surfaces
 * release every subscription they hold, so the frame's subscription cap is
 * respected whichever mode is live, and only one surface's writes are ever in
 * play. The swap is a re-mount, so the board's transient state (selection,
 * an armed confirm, an open dialog) resets — deliberate, rare,
 * user-resized. Persistence is untouched: filter and prefs live in
 * `host.storage` behind both surfaces, so the board here is the same board
 * the Extension pages menu opens, filters included.
 */
const host = connectHost();
const root = document.querySelector('#root');
if (!root) throw new Error('Missing #root');

let current: { mode: PanelViewMode; dispose: () => void } | null = null;
let formFactor: 'phone' | 'tablet' | 'desktop' = 'desktop';
let directory: string | null = null;
let microphoneSupported = false;
let swapTimer: number | undefined;

/** The frame's own width — the iframe is the context panel, so this is the panel's width. */
const measure = () => document.documentElement.clientWidth;

const mountFor = (mode: PanelViewMode) =>
  mode === 'board'
    // The interactive board mounts the page's own factory unchanged: same
    // persisted filter, writes, dialogs, drag-and-drop, agent-status writer
    // and adoption; the mic gate rides the host's `ready` context the same
    // way the page entry passes it.
    ? { mode, dispose: mountKanbanBoard(host, root, { microphoneSupported: microphoneSupported }).dispose }
    : { mode, dispose: mountKanbanMirror(host, root, { directory: directory }).dispose };

const swapTo = (mode: PanelViewMode) => {
  current?.dispose();
  current = mountFor(mode);
};

host.onReady((ctx) => {
  applyHostReady(ctx, document.documentElement);
  formFactor = ctx.device?.formFactor ?? 'desktop';
  microphoneSupported = ctx.features?.microphone === true;
  directory = ctx.directory;
  const mode = viewModeFor(current?.mode ?? null, measure(), formFactor);
  if (current && current.mode === mode) return;
  swapTo(mode);
});

// The host may resize the surface continuously (a drag) or in one step (the
// expand toggle); either way one trailing pass evaluates the rule, the
// hysteresis decides whether the crossing is far enough, and the swap runs
// once. Debounced per resize storm, not per decision.
window.addEventListener('resize', () => {
  if (!current) return;
  if (swapTimer !== undefined) window.clearTimeout(swapTimer);
  swapTimer = window.setTimeout(() => {
    swapTimer = undefined;
    if (!current) return;
    const next = viewModeFor(current.mode, measure(), formFactor);
    if (next === current.mode) return;
    swapTo(next);
  }, 150);
});

window.addEventListener('pagehide', () => {
  if (swapTimer !== undefined) window.clearTimeout(swapTimer);
  swapTimer = undefined;
  current?.dispose();
  current = null;
  host.dispose();
});
