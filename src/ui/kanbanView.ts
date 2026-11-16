import type { MenuItem } from '@openchamber/sdk/ui';
import { mountMenu } from '@openchamber/sdk/ui';
import { describeActivity, type BoardItem, type BoardSections } from '../domain/boardView.ts';
import { STATUSES, STATUS_LABELS, type Task, type TaskStatus } from '../domain/task.ts';
import { insertionTarget } from './dnd.ts';
import { el } from './dom.ts';

/**
 * The one renderer behind both surfaces. The full-screen page mounts it in
 * `page` mode: five columns side by side, cards, a tap opens the task's
 * detail view. The rail panel mounts it in `rail` mode: the same five views
 * stacked as collapsible sections, slim rows, a tap opens the task's chat.
 * Everything the two surfaces must never disagree on lives here: the item
 * body (title, project line, live agent line, → chip), the ⋯ menu
 * structure, the drop math, keyboard activation, and the attention flag.
 * Only the layout differs, because the width does.
 */

export type KanbanSurface = 'page' | 'rail';

export type KanbanHandlers = {
  /** The surface's primary tap: the page opens the detail view, the rail opens the linked chat. */
  onActivate: (task: Task) => void;
  /** ⋯ → Edit task: the page reopens its detail, the rail opens the same dialog inside the rail frame. */
  onEdit: (task: Task) => void;
  /** ⋯ → Move to …: a status change that keeps its rank — the detail popup's Move-to semantics. */
  onMoveStatus: (task: Task, status: TaskStatus) => void;
  /** ⋯ → Delete task: the shared dismissal-before-delete protocol sits behind this. */
  onDelete: (task: Task) => void;
  /** Drop into `status` before `beforeId` (null = end of what the user can see). */
  onDrop: (id: string, status: TaskStatus, beforeId: string | null) => void;
  /** Rail only — a drop on a section header (included for a folded one) appends at the column's end. */
  onDropEnd?: (id: string, status: TaskStatus) => void;
  /** Rail attention rows: open the linked chat without opening any dialog. */
  onOpenChat?: (task: Task) => void;
  /** Rail attention rows: a deliberate Done — the only way a row tap ever sets it. */
  onMarkDone?: (task: Task) => void;
  /** The project's display name to show on a row, or null to show none (the rail in scoped mode). */
  projectName: (task: Task) => string | null;
  /** Rail only: whether a section starts folded, and toggling it. */
  isCollapsed?: (status: TaskStatus) => boolean;
  onToggleSection?: (status: TaskStatus) => void;
};

export type KanbanView = {
  render: (sections: BoardSections) => void;
  dispose: () => void;
};

/** Move-and-edit affordance for one item: every other column, then Edit, then delete. */
const itemMenuItems = (item: BoardItem): MenuItem[] => [
  ...STATUSES
    .filter((status) => status !== item.displayStatus)
    .map((status) => ({ id: `move:${status}`, label: `Move to ${STATUS_LABELS[status]}` })),
  { separator: true },
  { id: 'edit', label: 'Edit task' },
  { separator: true },
  { id: 'delete', label: 'Delete task', destructive: true },
];

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

  const wireDropZone = (zone: HTMLElement, body: HTMLElement, status: TaskStatus) => {
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
      handlers.onDrop(id, status, beforeId);
    });
  };

  const renderItem = (item: BoardItem) => {
    const { task } = item;
    const item_ = el('div', item.attention ? 'kb-item kb-attn' : 'kb-item');
    if (rail) item_.classList.add('kb-panel-row'); else item_.classList.add('kb-card');
    item_.classList.add('kb-draggable-item');
    item_.dataset.id = task.id;
    item_.draggable = true;

    const main = el('div', 'kb-panel-main');
    item_.append(main);
    const top = el('div', 'kb-item-top');
    top.append(el('div', 'kb-panel-title', task.title));
    const menuSlot = el('span', 'kb-panel-menu');
    top.append(menuSlot);
    main.append(top);

    // Per-item project names matter only in show-all mode or on the page; scoped
    // to one project the header line names it once and the row line stays purely
    // about the agent.
    const project = handlers.projectName(task);
    const sub = el('div', 'kb-panel-sub');
    if (project) sub.append(el('span', 'kb-panel-project', project));
    // A chat with no trusted live state has nothing observable to say; say only
    // that it exists rather than inventing an activity.
    const line = item.live
      ? describeActivity(item.live)
      : task.sessionId
        ? ({ text: 'chat linked', tone: 'idle' }) as const
        : null;
    if (line) {
      if (project) sub.append(el('span', 'kb-panel-sep', '·'));
      const dot = el('span', 'kb-panel-dot');
      dot.dataset.state = line.tone;
      sub.append(dot, el('span', 'kb-panel-live', line.text));
    }
    main.append(sub);

    // Attention actions are a rail affordance: the width is gone on a page
    // whose card click opens the full detail view with the same actions.
    if (rail && item.attention) {
      const actions = el('div', 'kb-panel-actions');
      if (task.sessionId && handlers.onOpenChat) {
        const chat = el('button', 'kb-panel-btn kb-panel-btn-primary', 'Open chat');
        chat.type = 'button';
        chat.addEventListener('click', (event) => { event.stopPropagation(); handlers.onOpenChat!(task); });
        actions.append(chat);
      }
      if (item.displayStatus !== 'done' && handlers.onMarkDone) {
        const onMarkDone = handlers.onMarkDone;
        const done = el('button', 'kb-panel-btn', 'Mark done');
        done.type = 'button';
        done.addEventListener('click', (event) => { event.stopPropagation(); onMarkDone(task); });
        actions.append(done);
      }
      if (actions.childElementCount > 0) main.append(actions);
    }

    if (item.movedByAgent) item_.append(el('span', 'kb-panel-chip', `→ ${STATUS_LABELS[item.displayStatus]}`));

    const menu = mountMenu(menuSlot, {
      label: '⋯', variant: 'ghost', size: 'xs',
      items: itemMenuItems(item),
      onSelect: (menuId: string) => {
        if (menuId === 'delete') { handlers.onDelete(task); return; }
        if (menuId === 'edit') { handlers.onEdit(task); return; }
        if (menuId.startsWith('move:')) {
          const status = menuId.slice(5);
          if ((STATUSES as readonly string[]).includes(status)) handlers.onMoveStatus(task, status as TaskStatus);
        }
      },
    });
    menuHandles.push(menu);

    const activate = () => handlers.onActivate(task);
    // The menu trigger (and its popup) live inside the item: a click there is
    // the menu's to handle, never item navigation.
    item_.addEventListener('click', (event) => {
      if ((event.target as HTMLElement)?.closest('.kb-panel-menu')) return;
      activate();
    });
    item_.tabIndex = 0;
    item_.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); activate(); }
    });
    item_.addEventListener('dragstart', (event) => {
      draggingId = task.id;
      item_.classList.add('kb-dragging');
      event.dataTransfer?.setData('text/plain', task.id);
      if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
    });
    item_.addEventListener('dragend', () => { draggingId = null; item_.classList.remove('kb-dragging'); });
    return item_;
  };

  const renderColumn = (status: TaskStatus, items: BoardItem[]) => {
    const column = el('div', 'kb-column');
    column.dataset.status = status;
    const head = el('div', 'kb-column-head');
    head.append(el('span', 'kb-column-title', STATUS_LABELS[status]));
    const count = el('span', 'kb-column-count', String(items.length));
    if (items.some((entry) => entry.attention && entry.displayStatus !== 'done')) count.dataset.attn = 'true';
    head.append(count);
    const body = el('div', 'kb-column-body');
    column.append(head, body);
    if (items.length === 0) body.append(el('div', 'kb-column-empty', 'No tasks'));
    for (const item of items) body.append(renderItem(item));
    wireDropZone(column, body, status);
    return column;
  };

  const renderSection = (status: TaskStatus, items: BoardItem[]) => {
    const section = el('div', 'kb-psec');
    const collapsed = handlers.isCollapsed?.(status) ?? false;
    const headBtn = document.createElement('button');
    headBtn.type = 'button';
    headBtn.className = 'kb-psec-head';
    headBtn.append(el('span', 'kb-psec-name', STATUS_LABELS[status]));
    const count = el('span', 'kb-psec-count', '0');
    if (items.some((entry) => entry.attention && entry.displayStatus !== 'done')) count.dataset.attn = 'true';
    const chev = el('span', 'kb-psec-chevron', collapsed ? '▸' : '▾');
    headBtn.append(count, chev);
    const body = el('div', 'kb-psec-body');
    body.hidden = collapsed;
    section.append(headBtn, body);
    headBtn.addEventListener('click', () => handlers.onToggleSection?.(status));
    if (!collapsed) {
      if (items.length === 0) body.append(el('div', 'kb-panel-empty', 'No tasks'));
      for (const item of items) body.append(renderItem(item));
    }
    // Rows drag between sections and reorder within them with the board's own
    // math; a drop on the header — included for a collapsed section — appends
    // at the end, so every column stays reachable while folded.
    wireDropZone(section, body, status);
    return section;
  };

  const render = (sections: BoardSections) => {
    for (const handle of menuHandles.splice(0)) handle.dispose();
    container.replaceChildren();
    for (const status of STATUSES) {
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
