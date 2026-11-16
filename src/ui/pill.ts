import type { ActivityKey, ActivityLine } from '../domain/boardView.ts';
import { el } from './dom.ts';

/**
 * The agent-state pill both surfaces render in the item meta line and the
 * task dialog's head. One look, one place: the tint language of the host's
 * own toned badges — the CSS in ui/styles.ts keys off `data-tone` and
 * resolves it through the `--oc-*` status tokens `applyHostReady` paints on
 * the frame root, for whatever theme the frame currently runs — plus a
 * glyph per state so "needs your answer" and "needs permission" separate at
 * a glance, not just by text. The label is the mapped text from
 * `describeActivity` (sentence-cased for display). Neutral states take no
 * `data-tone`, the same convention the kit's badge follows.
 */

const NS = 'http://www.w3.org/2000/svg';

const TINTS: Record<ActivityKey, 'info' | 'warning' | 'error' | 'success' | null> = {
  running: 'info',
  'waiting-question': 'warning',
  'waiting-permission': 'warning',
  failed: 'error',
  finished: 'success',
  idle: null,
  linked: null,
};

const svg = (build: (node: SVGElement) => void): SVGElement => {
  const node = document.createElementNS(NS, 'svg');
  node.setAttribute('viewBox', '0 0 24 24');
  node.setAttribute('aria-hidden', 'true');
  build(node);
  return node;
};

const SPINNER = (): SVGElement =>
  svg((node) => {
    node.classList.add('kb-agent-spin');
    node.setAttribute('fill', 'none');
    const style = node.style;
    style.stroke = 'currentColor';
    style.strokeWidth = '3';
    style.strokeLinecap = 'round';
    const back = document.createElementNS(NS, 'circle');
    back.setAttribute('cx', '12');
    back.setAttribute('cy', '12');
    back.setAttribute('r', '9');
    back.setAttribute('opacity', '.25');
    const arc = document.createElementNS(NS, 'path');
    arc.setAttribute('d', 'M21 12a9 9 0 0 0-9-9');
    node.append(back, arc);
  });

const SHIELD = (): SVGElement =>
  svg((node) => {
    node.setAttribute('fill', 'currentColor');
    const shape = document.createElementNS(NS, 'path');
    shape.setAttribute('d', 'M12 2l8 3v6c0 5-3.4 8.7-8 11-4.6-2.3-8-6-8-11V5z');
    node.append(shape);
  });

/** "?" / "!" sit in a 1px-bordered circle, drawn with text so both scale with the pill. */
const circled = (glyph: string): HTMLElement => {
  const node = el('span', 'kb-agent-glyph');
  node.textContent = glyph;
  node.setAttribute('aria-hidden', 'true');
  return node;
};

const DOT = (): HTMLElement => {
  const node = el('span', 'kb-agent-dotg');
  node.setAttribute('aria-hidden', 'true');
  return node;
};

const GLYPH: Record<ActivityKey, () => (HTMLElement | SVGElement)> = {
  running: SPINNER,
  'waiting-question': () => circled('?'),
  'waiting-permission': SHIELD,
  failed: () => circled('!'),
  finished: () => circled('✓'),
  idle: DOT,
  linked: DOT,
};

export const agentPill = (line: ActivityLine): HTMLElement => {
  const pill = el('span', 'kb-agent-pill');
  const tint = TINTS[line.key];
  if (tint) pill.dataset.tone = tint;
  pill.append(GLYPH[line.key]());
  pill.append(el('span', 'kb-agent-label', line.text.charAt(0).toUpperCase() + line.text.slice(1)));
  return pill;
};
