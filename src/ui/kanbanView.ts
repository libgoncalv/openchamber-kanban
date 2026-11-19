import type { MenuItem } from '@openchamber/sdk/ui';
import { mountMenu } from '@openchamber/sdk/ui';
import { describeActivity, type ActivityKey, type ActivityLine, type BoardItem, type BoardSections } from '../domain/boardView.ts';
import { STATUSES, STATUS_LABELS, type Task, type TaskStatus } from '../domain/task.ts';
import { agentPill } from './pill.ts';
import { insertionTarget } from './dnd.ts';
import { el } from './dom.ts';

/**
 * The one renderer behind both surfaces. The full-screen page mounts it in
 * `page` mode: six columns side by side, cards, a tap opens the task's
 * detail view. The rail panel mounts it in `rail` mode: the five live views
 * stacked as sections, slim rows — the Archive section is the full board's
 * alone there, so a card the archive rule retires simply leaves the panel.
 * Every interactive affordance — the primary
 * tap, the ✓ mark-done shortcut, the rail's chat button, the ⋯ menu, dragging,
 * folding, selection, column cleanup — renders only when the surface supplies
 * the matching handler, so a surface that passes none renders the identical
 * layout with nothing to click.
 * Everything the two surfaces must never disagree on lives here: the item
 * body (title, project line, agent pill), the ⋯ menu
 * structure, the drop math, keyboard activation, and the attention flag.
 * Only the layout differs, because the width does.
 */

export type KanbanSurface = 'page' | 'rail';

export type KanbanHandlers = {
  /** The surface's primary tap: the page opens the detail view. Absent on a purely displaying surface. */
  onActivate?: (task: Task) => void;
  /** ⋯ → Edit task: the page reopens its detail, the rail opens the same dialog inside the rail frame. Absent — no menu. */
  onEdit?: (task: Task) => void;
  /** ⋯ → Move to …: a status change that keeps its rank — the detail popup's Move-to semantics. Absent — no move items. */
  onMoveStatus?: (task: Task, status: TaskStatus) => void;
  /** ⋯ → Delete task: the shared dismissal-before-delete protocol sits behind this. Absent — no delete item. */
  onDelete?: (task: Task) => void;  /** Drop into `status` before `beforeId` (null = end of what the user can see). Absent — items do not drag and nothing accepts a drop. */
  onDrop?: (id: string, status: TaskStatus, beforeId: string | null) => void;
  /** Rail only — a drop on a section header appends at the column's end. */
  onDropEnd?: (id: string, status: TaskStatus) => void;
  /** Rail rows: the chat button beside the ✓ — the linked card's chat, or, when there is none, a chat started attached to the card (see the panel's wiring). */
  onChat?: (task: Task) => void;
  /** Rail rows: a deliberate Done — the rail's Done write, through the same kept-rank path as the ⋯ menu. */
  onMarkDone?: (task: Task) => void;
  /**
   * Page cards only: the ✓ inside the "looks done" affordance — a deliberate
   * Done through the same kept-rank path as the ⋯ menu. The rail carries no
   * looks-done signal and writes Done through `onMarkDone`.
   */
  onLooksDone?: (task: Task) => void;
  /** Toggling one card's selection (checkbox click, or Ctrl/⌘-click on the card body). Absent — no checkbox renders and the card never selects. */
  onToggleSelect?: (task: Task) => void;
  /** Whether the card's checkbox is checked; the selection state lives in the surface. Absent — nothing renders selected. */
  isSelected?: (task: Task) => boolean;
  /** Page columns only: the head's trash icon empties that column (first press arms it, second deletes). Absent — no trash button. */
  onEmptyColumn?: (status: TaskStatus) => void;
  /** Whether the head trash for this status is armed — the arming state and its timeout live in the surface. */
  isColumnEmptyArmed?: (status: TaskStatus) => boolean;
  /** The project's display name to show on a row, or null to show none (the rail in scoped mode). */
  projectName: (task: Task) => string | null;
  /** Only when a surface folds its sections: whether one starts folded, and toggling it. */
  isCollapsed?: (status: TaskStatus) => boolean;
  onToggleSection?: (status: TaskStatus) => void;
};

export type KanbanView = {
  render: (sections: BoardSections) => void;
  dispose: () => void;
};

/**
 * The icon set for the small square buttons (the same 24-viewBox style the
 * dictation panel uses — `.kb-dict-iconbtn`'s idiom, reused by `.kb-iconbtn`):
 * a check for "mark done", a speech bubble for "open chat", the same bubble
 * with a plus cut out for "new chat", and a trash can for the column head's
 * "empty column".
 */
const CHECK_DONE_PATH = 'M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z';
const CHAT_PATH =
  'M20 2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4l4 4 3-4h5a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z';
/** The start-of-a-chat glyph: the bubble with a plus punched out of its fill ("evenodd"). */
const NEW_CHAT_PATH = `${CHAT_PATH} M9.25 5.75h1.5v6.5H9.25z M6.75 8.25h6.5v1.5H6.75z`;
const TRASH_PATH =
  'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z';
const svgGlyph = (path: string): SVGElement => {
  const node = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  node.setAttribute('viewBox', '0 0 24 24');
  node.setAttribute('fill', 'currentColor');
  // evenodd is what makes the new-chat glyph's plus a hole in the bubble
  // fill; for plain single-loop glyphs it matches nonzero exactly.
  node.setAttribute('fill-rule', 'evenodd');
  node.setAttribute('aria-hidden', 'true');
  const shape = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  shape.setAttribute('d', path);
  node.append(shape);
  return node;
};

/** A small square icon button `.kb-iconbtn` with its own tooltip/label; taps do not count as item activation. */
const iconButton = (
  path: string,
  label: string,
  onTap: () => void,
  attrs: { primary?: boolean; hint?: boolean; quiet?: boolean; info?: boolean } = {},
): HTMLButtonElement => {
  const button = el('button', 'kb-iconbtn');
  button.type = 'button';
  button.title = label;
  button.setAttribute('aria-label', label);
  if (attrs.primary) button.dataset.primary = 'true';
  if (attrs.hint) button.dataset.hint = 'true';
  if (attrs.quiet) button.dataset.quiet = 'true';
  if (attrs.info) button.dataset.info = 'true';
  button.append(svgGlyph(path));
  button.addEventListener('click', (event) => { event.stopPropagation(); onTap(); });
  return button;
};

/** Move-and-edit affordance for one item — only the parts the surface handles, `null` when it handles none. */
const itemMenuItems = (item: BoardItem, handlers: KanbanHandlers): MenuItem[] | null => {
  const items: MenuItem[] = [];
  if (handlers.onMoveStatus) {
    items.push(...STATUSES
      .filter((status) => status !== item.displayStatus)
      .map((status) => ({ id: `move:${status}`, label: `Move to ${STATUS_LABELS[status]}` })));
  }
  if (handlers.onEdit) {
    if (items.length > 0) items.push({ separator: true });
    items.push({ id: 'edit', label: 'Edit task' });
  }
  if (handlers.onDelete) {
    if (items.length > 0) items.push({ separator: true });
    items.push({ id: 'delete', label: 'Delete task', destructive: true });
  }
  return items.length > 0 ? items : null;
};

export const mountKanbanView = (root: Element, surface: KanbanSurface, handlers: KanbanHandlers): KanbanView => {
  const rail = surface === 'rail';
  const container = el('div', rail ? 'kb-panel-sections' : 'kb-columns');
  root.append(container);

  /** Menu handles are re-mounted on every render; dispose the old ones first so no popup survives. */
  const menuHandles: Array<{ dispose: () => void }> = [];
  let draggingId: string | null = null;

  /** The rows or cards of one container body, top to bottom, for `insertionTarget`. */
  const collectRects = (body: HTMLElement, movingId: string) =>
    [...body.querySelectorAll<HTMLElement>('.kb-draggable-item')]
      .filter((node) => node.dataset.id !== movingId)
      .map((node) => ({
        id: node.dataset.id ?? '',
        top: node.getBoundingClientRect().top,
        height: node.getBoundingClientRect().height,
      }));

  /** Drops are wired only for surfaces that supply `onDrop`; the callback arrives narrowed. */
  const wireDropZone = (
    zone: HTMLElement,
    body: HTMLElement,
    status: TaskStatus,
    onDrop: NonNullable<KanbanHandlers['onDrop']>,
  ) => {
    zone.addEventListener('dragover', (event) => {
      if (!draggingId) return;
      event.preventDefault();
      zone.classList.add('kb-dragover');
    });
    zone.addEventListener('dragleave', (event) => {
      if (event.target === zone) zone.classList.remove('kb-dragover');
    });
    zone.addEventListener('drop', (event) => {
      event.preventDefault();
      zone.classList.remove('kb-dragover');
      const id = draggingId ?? event.dataTransfer?.getData('text/plain') ?? null;
      draggingId = null;
      if (!id) return;
      if (rail && (event.target as HTMLElement | null)?.closest?.('.kb-psec-head')) {
        handlers.onDropEnd?.(id, status);
        return;
      }
      const beforeId = insertionTarget(collectRects(body, id), event.clientY);
      onDrop(id, status, beforeId);
    });
  };

  const renderItem = (item: BoardItem) => {
    const { task } = item;
    const item_ = el('div', item.attention ? 'kb-item kb-attn' : 'kb-item');
    if (rail) item_.classList.add('kb-panel-row'); else item_.classList.add('kb-card');
    const draggable = handlers.onDrop !== undefined;
    if (draggable) {
      item_.classList.add('kb-draggable-item');
      item_.draggable = true;
    } else {
      item_.draggable = false;
    }
    item_.dataset.id = task.id;
    // Selection state the surface owns, read fresh on every render: the
    // checkbox is the touch-safe primary idiom (always visible), Ctrl/⌘-click
    // on the card body the desktop shortcut. Nothing renders on a surface
    // that passes no selection handlers — the rail stays a plain mirror.
    const selected = handlers.isSelected?.(task) ?? false;
    if (selected) item_.dataset.selected = 'true';

    const main = el('div', 'kb-panel-main');
    item_.append(main);
    const top = el('div', 'kb-item-top');
    if (handlers.onToggleSelect) {
      const onToggle = handlers.onToggleSelect;
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'kb-check';
      checkbox.checked = selected;
      const verb = selected ? 'Deselect' : 'Select';
      checkbox.title = `${verb} "${task.title}"`;
      checkbox.setAttribute('aria-label', `${verb} task: ${task.title}`);
      // A checkbox press is the checkbox's: never item activation.
      // Toggling is read off the change event, where the native state is final.
      checkbox.addEventListener('click', (event) => event.stopPropagation());
      checkbox.addEventListener('change', () => onToggle(task));
      top.append(checkbox);
    }
    top.append(el('div', 'kb-panel-title', task.title));
    main.append(top);

    // Per-item project names matter only in show-all mode or on the page; scoped
    // to one project the header line names it once and the row line stays purely
    // about the agent.
    const project = handlers.projectName(task);
    const sub = el('div', 'kb-panel-sub');
    if (project) sub.append(el('span', 'kb-panel-project', project));
    // A chat with no trusted live state has nothing observable to say; say only
    // that it exists rather than inventing an activity.
    const line: ActivityLine | null = item.live
      ? describeActivity(item.live)
      : task.sessionId
        ? { key: 'linked' as ActivityKey, text: 'chat linked', tone: 'idle' }
        : null;
    if (line) sub.append(agentPill(line));
    main.append(sub);

    // The rail's chat affordance, beside the ✓: on a linked card it opens
    // that chat (any status — its history is worth opening; a Done or
    // archived card carries none of the other affordances but keeps this
    // one); on an unlinked card that could receive one (a project to run in,
    // not Done or Archive) the plus-cut glyph starts a chat attached to the
    // card instead. Always visible like the ✓ (a finger has no hover); on an
    // attention row the button wears the filled primary tint so the way in
    // to the waiting chat is unmistakable.
    if (rail && handlers.onChat && (task.sessionId || (task.projectId && item.displayStatus !== 'done' && item.displayStatus !== 'archived'))) {
      const onChat = handlers.onChat;
      top.append(iconButton(
        task.sessionId ? CHAT_PATH : NEW_CHAT_PATH,
        task.sessionId ? 'Open chat' : 'New chat',
        () => onChat(task),
        task.sessionId && item.attention ? { primary: true } : {},
      ));
    }

    // Every non-done, non-archived rail row carries a mark-done ✓ at its
    // right edge — always visible, tinted with the app's info tone. This is
    // the rail's Done write: Done stays a user-only click on every surface;
    // Done and archived rows show no affordance because they need none. The
    // chat button appended just before it is the rail's other carve-out.
    if (rail && item.displayStatus !== 'done' && item.displayStatus !== 'archived' && handlers.onMarkDone) {
      const onMarkDone = handlers.onMarkDone;
      top.append(iconButton(CHECK_DONE_PATH, 'Mark done', () => onMarkDone(task), { info: true }));
    }

    // No rail chips: the pill is the one status signal an item wears — a
    // display-only agent move shows as the row's position under the section
    // head, never as a → chip.

    const menuItems = itemMenuItems(item, handlers);
    // The "looks done" ✓ beside the ⋯ menu — page cards only. 'hint' (unseen)
    // is success-tinted and always visible: it IS the suggestion. 'quiet'
    // (seen) goes muted and reveals on hover/focus, the same reveal rule the
    // ⋯ menu follows below. The click is the user's own Done click; the
    // agent never gets here.
    if (!rail && item.looksDone && handlers.onLooksDone) {
      const onLooksDone = handlers.onLooksDone;
      top.append(iconButton(
        CHECK_DONE_PATH,
        item.looksDoneNote ?? 'Looks done — click to mark Done',
        () => onLooksDone(task),
        item.looksDone === 'hint' ? { hint: true } : { quiet: true },
      ));
    }
    if (menuItems) {
      const menuSlot = el('span', 'kb-panel-menu');
      top.append(menuSlot);
      menuHandles.push(mountMenu(menuSlot, {
        label: '⋯', variant: 'ghost', size: 'xs',
        items: menuItems,
        onSelect: (menuId: string) => {
          if (menuId === 'delete' && handlers.onDelete) { handlers.onDelete(task); return; }
          if (menuId === 'edit' && handlers.onEdit) { handlers.onEdit(task); return; }
          if (menuId.startsWith('move:')) {
            const status = menuId.slice(5);
            if ((STATUSES as readonly string[]).includes(status) && handlers.onMoveStatus) {
              handlers.onMoveStatus(task, status as TaskStatus);
            }
          }
        },
      }));
    }

    if (handlers.onActivate) {
      const activate = () => handlers.onActivate!(task);
      // The menu trigger (and its popup) live inside the item: a click there is
      // the menu's to handle, never item navigation.
      item_.addEventListener('click', (event) => {
        if ((event.target as HTMLElement)?.closest('.kb-panel-menu')) return;
        // Ctrl/⌘-click is the desktop shortcut for the checkbox: it toggles
        // the selection instead of opening the task, exactly when a selection
        // handler exists.
        if (handlers.onToggleSelect && (event.metaKey || event.ctrlKey)) {
          handlers.onToggleSelect(task);
          return;
        }
        activate();
      });
      item_.tabIndex = 0;
      item_.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); activate(); }
      });
    }
    if (draggable) {
      item_.addEventListener('dragstart', (event) => {
        draggingId = task.id;
        item_.classList.add('kb-dragging');
        event.dataTransfer?.setData('text/plain', task.id);
        if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
      });
      item_.addEventListener('dragend', () => { draggingId = null; item_.classList.remove('kb-dragging'); });
    }
    return item_;
  };

  const renderColumn = (status: TaskStatus, items: BoardItem[]) => {
    const column = el('div', 'kb-column');
    column.dataset.status = status;
    const head = el('div', 'kb-column-head');
    const count = el('span', 'kb-column-count', String(items.length));
    if (items.some((entry) => entry.attention && entry.displayStatus !== 'done' && entry.displayStatus !== 'archived')) count.dataset.attn = 'true';
    // The tools group keeps the head reading title left, actions right: the
    // count pill and, when the surface handles it, the column's trash. The
    // arming state (first press of the two-press confirm) lives in the
    // surface, so the flag survives this every-render rebuild.
    const tools = el('span', 'kb-column-tools');
    tools.append(count);
    if (handlers.onEmptyColumn) {
      const onEmpty = handlers.onEmptyColumn;
      const armed = handlers.isColumnEmptyArmed?.(status) ?? false;
      const trash = iconButton(
        TRASH_PATH,
        armed ? `Click again to empty ${STATUS_LABELS[status]}` : `Empty ${STATUS_LABELS[status]}`,
        () => onEmpty(status),
      );
      if (armed) trash.dataset.armed = 'true';
      tools.append(trash);
    }
    head.append(el('span', 'kb-column-title', STATUS_LABELS[status]), tools);
    const body = el('div', 'kb-column-body');
    column.append(head, body);
    if (items.length === 0) body.append(el('div', 'kb-column-empty', 'No tasks'));
    for (const item of items) body.append(renderItem(item));
    if (handlers.onDrop) wireDropZone(column, body, status, handlers.onDrop);
    return column;
  };

  const renderSection = (status: TaskStatus, items: BoardItem[]) => {
    const section = el('div', 'kb-psec');
    // Same dataset the page's columns carry: the column-color CSS keys both
    // surfaces off it, so they can never drift apart on the tints.
    section.dataset.status = status;
    // A surface that folds (the interactive page/rail pair until now) renders
    // the head as a toggle button; one that passes no toggle renders a plain
    // label — and never hides rows it cannot bring back.
    const collapsible = handlers.onToggleSection !== undefined;
    const collapsed = collapsible && (handlers.isCollapsed?.(status) ?? false);
    const head: HTMLElement = collapsible ? document.createElement('button') : el('div', 'kb-psec-head');
    head.className = 'kb-psec-head';
    if (head instanceof HTMLButtonElement) head.type = 'button';
    head.append(el('span', 'kb-psec-name', STATUS_LABELS[status]));
    const count = el('span', 'kb-psec-count', '0');
    if (items.some((entry) => entry.attention && entry.displayStatus !== 'done' && entry.displayStatus !== 'archived')) count.dataset.attn = 'true';
    head.append(count);
    if (collapsible) {
      head.append(el('span', 'kb-psec-chevron', collapsed ? '▸' : '▾'));
      head.addEventListener('click', () => handlers.onToggleSection?.(status));
    }
    const body = el('div', 'kb-psec-body');
    body.hidden = collapsed;
    section.append(head, body);
    if (!collapsed) {
      if (items.length === 0) body.append(el('div', 'kb-panel-empty', 'No tasks'));
      for (const item of items) body.append(renderItem(item));
    }
    if (handlers.onDrop) wireDropZone(section, body, status, handlers.onDrop);
    return section;
  };

  const render = (sections: BoardSections) => {
    for (const handle of menuHandles.splice(0)) handle.dispose();
    container.replaceChildren();
    for (const status of STATUSES) {
      // The rail's one full-layout cut: Archive never renders there. The
      // mirror is "what the agents are up to" — a card the archive rule
      // retires simply leaves the panel at its two-week boundary; the full
      // board (the page, or the expanded panel on a desktop, which is that
      // page's factory) carries the column. The counts were already blind
      // to it (`countOpen`/`countUnseen` exclude `archived`).
      if (rail && status === 'archived') continue;
      container.append(rail ? renderSection(status, sections[status]) : renderColumn(status, sections[status]));
    }
  };

  return {
    render,
    dispose: () => {
      for (const handle of menuHandles.splice(0)) handle.dispose();
      container.replaceChildren();
    },
  };
};
