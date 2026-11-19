import { ARCHIVE_AFTER_MS, byRank, doneAnchor } from '../domain/board.ts';
import type { BoardItem } from '../domain/boardView.ts';
import type { Task } from '../domain/task.ts';
import { el } from './dom.ts';

/**
 * The archive dialog: the one door to the board's retired work. The toolbar's
 * Archive button opens it on the page and on the expanded panel's board (the
 * rail never renders a door: there, the retirement is simply a row leaving).
 * The board's render loop calls `refresh()`, so the list always reads through
 * the same pure view model the columns use — the exact contents the hidden
 * Archive column would have shown, oldest retired first, filter respected.
 *
 * Rows carry the recommended affordances: a tap (or Enter) opens the task's
 * detail dialog for full power, a quick Restore returns the card to Done —
 * `applyPatch` stamps a fresh `doneAt`, so a restored card re-earns its two
 * weeks — and a two-press arming Delete runs the board's shared
 * dismissal-before-delete protocol. The header's Empty is the old
 * column-head purge, armed the same way and disabled while the list is
 * empty. The board closes this dialog before it opens the detail popup, so
 * the two never stack.
 */

export type ArchiveDialogProps = {
  /** The retired cards as the board's view groups them; read fresh on every refresh. */
  getItems: () => readonly BoardItem[];
  /** The card's project display name, or null to show none. */
  projectName: (task: Task) => string | null;
  /** The scope the board is filtered to, named once under the head. */
  scopeLabel: string;
  /** Restore: back to Done, the clock restarted (the board wires the shared save path). */
  onRestore: (task: Task) => void;
  /** One card's delete: the shared dismissal-before-delete protocol. */
  onDelete: (task: Task) => void;
  /** Purge: every card currently listed, one batch delete. */
  onPurge: (items: readonly Task[]) => void;
  /** The focused row opens its detail dialog; the board closes this dialog first. */
  onOpenDetail: (task: Task) => void;
  onClose: () => void;
};

export type ArchiveDialog = { refresh: () => void; dispose: () => void };

/** "Archived <date>" comes from the anchor alone: `doneAt` plus the 14-day window. */
const archivedOn = (task: Task): string => {
  const date = new Date(doneAnchor(task) + ARCHIVE_AFTER_MS);
  const includeYear = date.getFullYear() !== new Date().getFullYear();
  return date.toLocaleDateString(undefined, includeYear
    ? { month: 'short', day: 'numeric', year: 'numeric' }
    : { month: 'short', day: 'numeric' });
};

const GLYPH_RESTORE = ['M9 14l-4-4 4-4M5 10h9a5 5 0 0 1 5 5v1'];
const GLYPH_TRASH = 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z';
const GLYPH_CLOSE = 'M6 6l12 12M18 6L6 18';

/** A small stroke-glyph svg in the toolbarIcon idiom (`board.ts`). */
const strokeSvg = (paths: string[]): SVGElement => {
  const node = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  node.setAttribute('viewBox', '0 0 24 24');
  node.setAttribute('fill', 'none');
  node.setAttribute('stroke', 'currentColor');
  node.setAttribute('stroke-width', '2');
  node.setAttribute('stroke-linecap', 'round');
  node.setAttribute('stroke-linejoin', 'round');
  node.setAttribute('aria-hidden', 'true');
  for (const d of paths) {
    const shape = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    shape.setAttribute('d', d);
    node.append(shape);
  }
  return node;
};

/** The trash glyph is a fill path, exactly as `kanbanView.ts` draws it. */
const fillSvg = (d: string): SVGElement => {
  const node = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  node.setAttribute('viewBox', '0 0 24 24');
  node.setAttribute('fill', 'currentColor');
  node.setAttribute('aria-hidden', 'true');
  const shape = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  shape.setAttribute('d', d);
  node.append(shape);
  return node;
};

export const mountArchiveDialog = (root: Element, props: ArchiveDialogProps): ArchiveDialog => {
  const overlay = el('div', 'kb-overlay');
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  const dialog = el('div', 'kb-dialog');
  // Initial focus on the dialog itself, the detail popup's exact pattern.
  dialog.tabIndex = -1;
  overlay.append(dialog);
  root.append(overlay);

  // The armed two-press confirm behind both destructive actions — one slot
  // at a time (a new arm disarms the old), and a short timeout so a stray
  // tap never leaves the dialog primed, exactly like the old column head.
  // The state lives here, across refreshes: the list rebuilds, the arming
  // survives.
  let armed: { kind: 'purge' } | { kind: 'row'; id: string } | null = null;
  let armedTimer: ReturnType<typeof setTimeout> | null = null;
  const arm = (next: typeof armed) => {
    armed = next;
    if (armedTimer !== null) clearTimeout(armedTimer);
    armedTimer = setTimeout(() => { armed = null; armedTimer = null; refresh(); }, 3500);
    refresh();
  };
  const disarm = () => {
    armed = null;
    if (armedTimer !== null) { clearTimeout(armedTimer); armedTimer = null; }
    refresh();
  };

  // Head: title + live count, the scope named once, the armed purge, ✕ close.
  const head = el('div', 'kb-dialog-head kb-archive-head');
  const headMain = el('div', 'kb-dialog-head-main');
  const heading = el('span', 'kb-archive-title', 'Archive');
  const countPill = el('span', 'kb-dialog-count', '0');
  headMain.append(heading, countPill, el('div', 'kb-dialog-sub', props.scopeLabel + ' · oldest first'));
  head.append(headMain);
  const purgeButton = el('button', 'kb-bar-btn');
  purgeButton.type = 'button';
  purgeButton.dataset.tone = 'danger';
  const closeButton = el('button', 'kb-dialog-close');
  closeButton.type = 'button';
  closeButton.title = 'Close';
  closeButton.setAttribute('aria-label', 'Close');
  closeButton.append(strokeSvg([GLYPH_CLOSE]));
  head.append(purgeButton, closeButton);
  dialog.append(head);

  const listContainer = el('div', 'kb-archive-list');
  dialog.append(listContainer);
  dialog.append(el('div', 'kb-archive-foot', 'Esc closes · Enter opens the focused row'));

  purgeButton.addEventListener('click', () => {
    if (purgeButton.disabled) return;
    if (armed?.kind === 'purge') {
      disarm();
      props.onPurge([...props.getItems()].map((item) => item.task));
    } else arm({ kind: 'purge' });
  });

  const onKeydown = (event: KeyboardEvent) => {
    // An SDK select or menu popup that was open just consumed Escape (it
    // preventDefaults before bubbling here): this dialog stays, as in detail.
    if (event.defaultPrevented) return;
    if (event.key === 'Escape') { props.onClose(); return; }
    if (event.key === 'Tab') trapTab(event);
  };
  const trapTab = (event: KeyboardEvent) => {
    const focusables = [...dialog.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), ' +
      'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )].filter((node) => node.offsetParent !== null || node === document.activeElement);
    if (focusables.length === 0) return;
    const first = focusables[0]!;
    const last = focusables[focusables.length - 1]!;
    if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
  document.addEventListener('keydown', onKeydown);
  overlay.addEventListener('click', (event) => { if (event.target === overlay) props.onClose(); });
  closeButton.addEventListener('click', () => props.onClose());

  const refresh = () => {
    const items = [...props.getItems()].sort((a, b) => doneAnchor(a.task) - doneAnchor(b.task) || byRank(a.task, b.task));
    countPill.textContent = String(items.length);
    purgeButton.textContent = armed?.kind === 'purge' ? 'Empty — click again' : 'Empty';
    if (armed?.kind === 'purge') purgeButton.dataset.armed = 'true'; else delete purgeButton.dataset.armed;
    purgeButton.title = armed?.kind === 'purge'
      ? `Click again to delete ${items.length === 1 ? 'this task' : `all ${items.length} tasks`}`
      : `Delete every task in the archive`;
    purgeButton.disabled = items.length === 0;
    listContainer.replaceChildren();
    if (items.length === 0) listContainer.append(el('div', 'kb-archive-empty', 'No tasks'));
    for (const item of items) {
      const { task } = item;
      const row = el('div', 'kb-archive-row');
      row.tabIndex = 0;
      row.setAttribute('aria-label', `${task.title} — archived ${archivedOn(task)}. Enter opens the task.`);
      const main = el('div', 'kb-archive-main');
      main.append(el('div', 'kb-card-title', task.title));
      const meta = el('div', 'kb-archive-meta');
      const project = props.projectName(task);
      if (project) meta.append(el('span', '', project));
      meta.append(el('span', 'kb-archive-when', `archived ${archivedOn(task)}`));
      main.append(meta);
      row.append(main);
      const restore = el('button', 'kb-iconbtn');
      restore.type = 'button';
      restore.append(strokeSvg(GLYPH_RESTORE));
      restore.title = 'Restore — back to Done, a fresh two weeks';
      restore.setAttribute('aria-label', 'Restore task to Done');
      restore.addEventListener('click', (event) => { event.stopPropagation(); props.onRestore(task); });
      row.append(restore);
      const del = el('button', 'kb-iconbtn');
      del.type = 'button';
      del.append(fillSvg(GLYPH_TRASH));
      const rowArmed = armed?.kind === 'row' && armed.id === task.id;
      del.title = rowArmed ? `Click again to delete "${task.title}"` : 'Delete task';
      del.setAttribute('aria-label', del.title);
      if (rowArmed) del.dataset.armed = 'true';
      del.addEventListener('click', (event) => {
        event.stopPropagation();
        if (rowArmed) { disarm(); props.onDelete(task); }
        else arm({ kind: 'row', id: task.id });
      });
      row.append(del);
      // The row body's tap opens the detail dialog; its edge buttons belong
      // to themselves, exactly like a board card's menu and ✓.
      const activate = () => props.onOpenDetail(task);
      row.addEventListener('click', (event) => {
        if ((event.target as HTMLElement)?.closest('.kb-iconbtn')) return;
        activate();
      });
      row.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); activate(); }
      });
      listContainer.append(row);
    }
  };
  refresh();
  dialog.focus();

  return {
    refresh,
    dispose: () => {
      if (armedTimer !== null) clearTimeout(armedTimer);
      document.removeEventListener('keydown', onKeydown);
      overlay.remove();
    },
  };
};
