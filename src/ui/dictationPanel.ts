// The task dialog's dictation UI in OpenChamber's own look, under the
// description field: a compact "Dictate" trigger with the app's mic icon, and
// while a capture runs, a bordered panel with the status text, a pulsing red
// dot, the same level-bar visualizer OpenChamber's composer renders while
// listening, the duration, and small icon actions. Pure presentation — the
// state machine, capture and service calls stay in src/host/dictation.ts.
import type { DictationController, DictationHandlers } from '../host/dictation.ts';
import { el } from './dom.ts';

export type DictationPanelProps = {
  dictation: DictationController;
  /** Recognized text (append/clamp/focus handled by the detail dialog). */
  onText: (text: string) => void;
  onNotice: (body: string, kind: 'info' | 'error') => void;
};

export type DictationPanel = { dispose: () => void };

// Remixicon paths, the app's icon set: the mic is the exact glyph OpenChamber
// renders for its dictation trigger; close and check come from the same set
// (duplicates of the SDK kit's internal ones, which it does not export).
const MIC_PATH =
  'M11.9998 3C10.3429 3 8.99976 4.34315 8.99976 6V10C8.99976 11.6569 10.3429 13 11.9998 13C13.6566 13 14.9998 11.6569 14.9998 10V6C14.9998 4.34315 13.6566 3 11.9998 3ZM11.9998 1C14.7612 1 16.9998 3.23858 16.9998 6V10C16.9998 12.7614 14.7612 15 11.9998 15C9.23833 15 6.99976 12.7614 6.99976 10V6C6.99976 3.23858 9.23833 1 11.9998 1ZM3.05469 11H5.07065C5.55588 14.3923 8.47329 17 11.9998 17C15.5262 17 18.4436 14.3923 18.9289 11H20.9448C20.4837 15.1716 17.1714 18.4839 12.9998 18.9451V23H10.9998V18.9451C6.82814 18.4839 3.51584 15.1716 3.05469 11Z';
const CLOSE_PATH =
  'M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z';
const CHECK_PATH =
  'M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z';

const svgIcon = (path: string): SVGElement => {
  const node = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  node.setAttribute('viewBox', '0 0 24 24');
  node.setAttribute('fill', 'currentColor');
  node.setAttribute('aria-hidden', 'true');
  const shape = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  shape.setAttribute('d', path);
  node.append(shape);
  return node;
};

const formatSeconds = (seconds: number): string =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

// One meter equals one bar + one gap, like each line in a rack: 2px rounded
// bars, 3px apart, exactly OpenChamber's composer visualizer.
const BAR_SPACING = 5;
const MIN_BAR = 2;
const TICK_MS = 60;
/** Perceptual shaping of levels into bar heights (OpenChamber's curve). */
const BAR_EXPONENT = 0.65;

type Meter = {
  canvas: HTMLCanvasElement;
  /** Feed from the capture's level subscription; keeps the peak per tick. */
  push: (level: number) => void;
  /** Re-arm for a fresh recording: clears the history and restarts the loop. */
  start: () => void;
  stop: () => void;
  dispose: () => void;
};

/**
 * The level bars, ported from OpenChamber's dictation overlay: levels arrive
 * per capture buffer and are recorded as the peak since the last tick (60 ms),
 * then drawn right-aligned — the newest bar slides in at the right edge and
 * the shelf scrolls left. Height follows level^0.65; a near-silent tick still
 * draws as a 2px dot. Sized to the element with devicePixelRatio awareness.
 */
const createMeter = (): Meter => {
  const canvas = document.createElement('canvas');
  canvas.className = 'kb-dict-bars';
  canvas.setAttribute('aria-hidden', 'true');
  const context = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let color = 'currentColor';
  const history: number[] = [];
  let peak = 0;
  let frame: number | null = null;
  let lastTick = 0;
  let observer: ResizeObserver | null = null;

  const fit = () => {
    const box = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    width = box.width;
    height = box.height;
    canvas.width = Math.max(1, Math.round(width * ratio));
    canvas.height = Math.max(1, Math.round(height * ratio));
    context?.setTransform(ratio, 0, 0, ratio, 0, 0);
  };
  if (typeof ResizeObserver === 'function') {
    observer = new ResizeObserver(fit);
    observer.observe(canvas);
  }

  const draw = () => {
    if (!context) return;
    const maxBars = Math.max(1, Math.floor(width / BAR_SPACING));
    while (history.length > maxBars) history.shift();
    context.clearRect(0, 0, width, height);
    context.strokeStyle = color;
    context.fillStyle = color;
    context.lineWidth = MIN_BAR;
    context.lineCap = 'round';
    const middle = height / 2;
    const maxBar = Math.max(MIN_BAR, height);
    const right = width - MIN_BAR / 2;
    for (let index = 0; index < history.length; index++) {
      const x = right - (history.length - 1 - index) * BAR_SPACING;
      if (x < MIN_BAR / 2) continue;
      const level = history[index] ?? 0;
      const half = (MIN_BAR + (maxBar - MIN_BAR) * Math.pow(level, BAR_EXPONENT) - MIN_BAR) / 2;
      context.beginPath();
      if (half < 0.25) {
        context.arc(x, middle, MIN_BAR / 2, 0, Math.PI * 2);
        context.fill();
      } else {
        context.moveTo(x, middle - half);
        context.lineTo(x, middle + half);
        context.stroke();
      }
    }
  };

  const step = (time: number) => {
    if (frame === null) return;
    frame = requestAnimationFrame(step);
    if (time - lastTick < TICK_MS) return;
    lastTick = time;
    history.push(peak);
    peak = 0;
    draw();
  };

  return {
    canvas,
    push: (level: number) => {
      peak = Math.max(peak, level);
    },
    start: () => {
      // Colors are theme vars; re-read per session so a theme switch shows up.
      color = getComputedStyle(canvas).color || color;
      peak = 0;
      history.length = 0;
      fit();
      draw();
      if (frame === null) frame = requestAnimationFrame(step);
    },
    stop: () => {
      if (frame !== null) {
        cancelAnimationFrame(frame);
        frame = null;
      }
      history.length = 0;
    },
    dispose: () => {
      if (frame !== null) {
        cancelAnimationFrame(frame);
        frame = null;
      }
      observer?.disconnect();
    },
  };
};

const iconButton = (path: string, label: string, primary = false): HTMLButtonElement => {
  const button = el('button', 'kb-dict-iconbtn');
  button.type = 'button';
  button.title = label;
  button.setAttribute('aria-label', label);
  if (primary) button.dataset.primary = 'true';
  button.append(svgIcon(path));
  return button;
};

/**
 * Builds the panel once per detail-dialog mount; `props.dictation` is the
 * board's shared controller, so two dialogs open at once share one capture and
 * both panels track its state (only the active one owns real actions).
 */
export const mountDictationPanel = (root: Element, props: DictationPanelProps): DictationPanel => {
  const { dictation } = props;
  const wrap = el('div', 'kb-dictation');
  root.append(wrap);

  const trigger = el('button', 'kb-dict-trigger');
  trigger.type = 'button';
  trigger.title = 'Dictate';
  trigger.setAttribute('aria-label', 'Dictate a description with the microphone');
  trigger.append(svgIcon(MIC_PATH), document.createTextNode('Dictate'));
  wrap.append(trigger);

  const panel = el('div', 'kb-dict-panel');
  panel.hidden = true;
  wrap.append(panel);
  const status = el('div', 'kb-dict-status');
  const controls = el('div', 'kb-dict-controls');
  panel.append(status, controls);

  const meter = createMeter();
  const timer = el('span', 'kb-dict-timer');
  const dot = el('span', 'kb-dict-dot');
  const spinner = el('span', 'kb-dict-spin');

  type Kind = 'idle' | 'recording' | 'transcribing';
  let kind: Kind = 'idle';
  let handlers: DictationHandlers | null = null;

  /** Renders the control row for a kind; skipped while it stays the same. */
  const renderKind = (next: Kind, seconds: number) => {
    if (kind === next) {
      if (next === 'recording') timer.textContent = formatSeconds(seconds);
      return;
    }
    kind = next;
    controls.replaceChildren();
    if (next === 'recording') {
      status.textContent = 'Listening…';
      timer.textContent = formatSeconds(seconds);
      const discardButton = iconButton(CLOSE_PATH, 'Discard');
      discardButton.addEventListener('click', () => dictation.discard());
      const insertButton = iconButton(CHECK_PATH, 'Stop and insert', true);
      insertButton.addEventListener('click', () => { if (handlers) dictation.toggle(handlers); });
      const actions = el('span', 'kb-dict-actions');
      actions.append(discardButton, insertButton);
      controls.append(dot, meter.canvas, timer, actions);
      meter.start();
    } else if (next === 'transcribing') {
      status.textContent = 'Transcribing…';
      const cancelButton = iconButton(CLOSE_PATH, 'Cancel');
      cancelButton.addEventListener('click', () => dictation.discard());
      controls.append(spinner, cancelButton);
      meter.stop();
    }
    // `idle` leaves the panel hidden; nothing to build.
  };

  const showIdle = () => {
    meter.stop();
    panel.hidden = true;
    trigger.hidden = false;
    kind = 'idle';
  };

  const onView: DictationHandlers['onView'] = (view) => {
    if (view.state === 'recording') {
      trigger.hidden = true;
      panel.hidden = false;
      renderKind('recording', view.seconds);
      return;
    }
    if (view.state === 'transcribing') {
      trigger.hidden = true;
      panel.hidden = false;
      renderKind('transcribing', view.seconds);
      return;
    }
    showIdle();
  };

  trigger.addEventListener('click', () => {
    if (dictation.state !== 'idle') return;
    handlers = {
      onView,
      onText: (text) => {
        showIdle();
        props.onText(text);
      },
      onNotice: props.onNotice,
    };
    dictation.toggle(handlers);
  });

  // The controller resets levels to 0 when capture closes; the meter only
  // listens while a recording runs so nothing accumulates off-screen.
  const unsubscribe = dictation.subscribeLevel((level) => {
    if (kind !== 'recording') return;
    meter.push(level);
  });

  return {
    dispose: () => {
      unsubscribe();
      meter.dispose();
      wrap.remove();
    },
  };
};
