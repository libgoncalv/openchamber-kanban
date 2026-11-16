import { connectHost } from '@openchamber/sdk';
import type { GuestProject } from '@openchamber/sdk';
import { applyHostReady, mountBadge, mountButton, mountMenu } from '@openchamber/sdk/ui';
import type { MenuItem } from '@openchamber/sdk/ui';
import { deleteTask as deleteStoredTask, loadTasks, saveTask } from './store/taskStore.ts';
import { loadDismissedSessions, saveDismissedSessions } from './store/dismissedSessions.ts';
import { DEFAULT_PANEL_PREFS, loadPanelPrefs, savePanelPrefs } from './store/panelPrefs.ts';
import { applyPatch, createTask, isStatus, STATUSES, STATUS_LABELS, type Task, type TaskStatus } from './domain/task.ts';
import { planDrop, rankAtEnd } from './domain/board.ts';
import { buildSections, countUnseen, describeActivity, visibleTasks, type PanelItem, type SessionLiveState } from './domain/panelView.ts';
import { DEFAULT_SYNC_OPTIONS } from './domain/sync.ts';
import { describeHostError, projectForDirectory } from './host/workspace.ts';
import { insertionTarget } from './ui/dnd.ts';
import { injectStyles } from './ui/styles.ts';
import { el } from './ui/dom.ts';

/**
 * The rail panel is narrow, so the board's five views are stacked as
 * collapsible sections instead of a second horizontal board; the full board
 * lives on the full-screen page (Extension pages menu) and stays the only
 * writer of agent-driven status changes. This panel re-groups rows by the
 * live agent state for display only; what it does write are deliberate user
 * actions — quick-added tasks, drag/menu moves and deletes, Mark done, and
 * clearing the unseen marker when a chat opens.
 */
const host = connectHost();
const root = document.querySelector('#root');
if (!root) throw new Error('Missing #root');

let mounted = false;
let disposed = false;
let tasks: Task[] = [];
let projects: GuestProject[] = [];
/** OpenChamber's open project: seeded from `ready`, kept current by `onDirectory`. `null` → show every task. */
let currentDirectory: string | null = null;
let currentProject: GuestProject | null = null;
let collapsed = new Set<TaskStatus>(DEFAULT_PANEL_PREFS.collapsed);
/**
 * Session ids whose task was deliberately deleted — here or on the board.
 * Loaded fresh on every load: saving this set after a delete without the
 * persisted entries would silently un-dismiss sessions the board meant to
 * keep out of auto-adoption.
 */
let dismissedSessionIds = new Set<string>();
let draggingId: string | null = null;
/** The sections as the last render drew them — what a drop plan is computed against. */
let currentSections: Record<TaskStatus, PanelItem[]>;
const live = new Map<string, SessionLiveState>();
const subs = new Map<string, Promise<() => void>>();
let intervalId: number | undefined;
let reloadTimer: number | undefined;
let reloading = false;
let everLoaded = false;

type SectionUi = { count: HTMLElement; chev: HTMLElement; body: HTMLElement };
type BadgeHandle = ReturnType<typeof mountBadge>;

let badge: BadgeHandle;
let statusEl: HTMLElement;
let scopeLine: HTMLElement;
let unseenLine: HTMLElement;
let sectionEls: Record<TaskStatus, SectionUi>;

/** The project OpenChamber currently has open, resolved from its directory (nested paths included). */
const resolveCurrentProject = () => {
  currentProject = projectForDirectory(projects, currentDirectory);
};

host.onReady((ctx) => {
  if (mounted) return;
  mounted = true;
  applyHostReady(ctx, document.documentElement);
  currentDirectory = ctx.directory;
  injectStyles();
  root.replaceChildren();

  const wrap = el('div', 'kb-page kb-rail');
  const head = el('div', 'kb-row between');
  head.append(el('h2', '', 'Kanban'));
  const badgeSlot = el('span');
  head.append(badgeSlot);
  wrap.append(head);
  statusEl = el('p', 'kb-muted', 'Loading…');
  wrap.append(statusEl);
  scopeLine = el('p', 'kb-rail-scope');
  wrap.append(scopeLine);
  unseenLine = el('p', 'kb-panel-unseen');
  wrap.append(unseenLine);
  const quickAdd = document.createElement('input');
  quickAdd.type = 'text';
  quickAdd.className = 'kb-quickadd';
  quickAdd.placeholder = 'Quick add…';
  quickAdd.setAttribute('aria-label', 'Quick add a task to Backlog');
  quickAdd.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { quickAdd.value = ''; quickAdd.blur(); return; }
    if (event.key !== 'Enter') return;
    const title = quickAdd.value.trim();
    if (!title) return;
    quickAdd.value = '';
    void quickCommit(title);
  });
  wrap.append(quickAdd);
  const sectionsRoot = el('div', 'kb-panel-sections');
  wrap.append(sectionsRoot);
  const foot = el('div', 'kb-rail-foot');
  foot.append(el('p', 'kb-muted', 'Full board: Extension pages menu'));
  mountButton(foot, { label: 'Refresh', variant: 'ghost', onClick: () => { void reload(); } });
  wrap.append(foot);
  root.append(wrap);

  badge = mountBadge(badgeSlot, { label: '', tone: 'neutral' });
  sectionEls = {} as Record<TaskStatus, SectionUi>;
  for (const status of STATUSES) {
    const section = el('div', 'kb-psec');
    const headBtn = document.createElement('button');
    headBtn.type = 'button';
    headBtn.className = 'kb-psec-head';
    headBtn.append(el('span', 'kb-psec-name', STATUS_LABELS[status]));
    const count = el('span', 'kb-psec-count', '0');
    const chev = el('span', 'kb-psec-chevron', '▾');
    headBtn.append(count, chev);
    const body = el('div', 'kb-psec-body');
    section.append(headBtn, body);
    sectionsRoot.append(section);
    sectionEls[status] = { count, chev, body };
    headBtn.addEventListener('click', () => {
      if (collapsed.has(status)) collapsed.delete(status); else collapsed.add(status);
      void savePanelPrefs(host, { collapsed: [...collapsed] }).catch(() => undefined);
      if (everLoaded) render();
    });
    // Rows drag between sections and reorder within them with the board's own
    // math; a drop on the header — included for a collapsed section — appends
    // at the end, so every column stays reachable while folded.
    section.addEventListener('dragover', (event) => {
      if (!draggingId) return;
      event.preventDefault();
      section.classList.add('kb-dragover');
    });
    section.addEventListener('dragleave', (event) => {
      if (event.target === section) section.classList.remove('kb-dragover');
    });
    section.addEventListener('drop', (event) => {
      event.preventDefault();
      section.classList.remove('kb-dragover');
      const id = draggingId ?? event.dataTransfer?.getData('text/plain') ?? null;
      draggingId = null;
      if (!id) return;
      if ((event.target as HTMLElement | null)?.closest?.('.kb-psec-head')) {
        void moveTaskToEnd(id, status);
        return;
      }
      const beforeId = insertionTarget(collectRects(body, id), event.clientY);
      void moveTaskTo(id, status, beforeId, currentSections[status] ?? []);
    });
  }

  // Storage has no change push: outside writes (the board page saving a drag,
  // a move, an edit) arrive on the next session snapshot tick, on this low
  // cadence pass, or via Refresh.
  intervalId = window.setInterval(() => { void reload(); }, 30_000);

  void host.onProjects((snapshot) => {
    if (disposed || snapshot.state !== 'ready') return;
    projects = snapshot.projects;
    resolveCurrentProject();
    if (everLoaded) { render(); syncSubscriptions(); }
  }).then(() => {}, () => undefined);

  void host.onDirectory((directory) => {
    if (disposed) return;
    currentDirectory = directory;
    resolveCurrentProject();
    if (everLoaded) { render(); syncSubscriptions(); }
  });

  void start();
});

const start = async () => {
  try {
    const [prefs, loaded, dismissed] = await Promise.all([loadPanelPrefs(host), loadTasks(host), loadDismissedSessions(host)]);
    if (disposed) return;
    collapsed = new Set(prefs.collapsed);
    tasks = loaded.tasks;
    dismissedSessionIds = dismissed;
    everLoaded = true;
    statusEl.hidden = true;
    syncSubscriptions();
    render();
  } catch (error) {
    statusEl.textContent = `Could not load tasks — ${describeHostError(error)}`;
  }
};

const reload = async () => {
  if (!mounted || disposed || reloading) return;
  reloading = true;
  try {
    const [{ tasks: loaded }, dismissed] = await Promise.all([loadTasks(host), loadDismissedSessions(host)]);
    if (disposed) return;
    tasks = loaded;
    dismissedSessionIds = dismissed;
    if (!everLoaded) { everLoaded = true; statusEl.hidden = true; }
    syncSubscriptions();
    render();
  } catch (error) {
    // Transient storage failures keep the last view on screen; only a first
    // load that never succeeded has nothing better to show than the reason.
    if (!everLoaded) statusEl.textContent = `Could not load tasks — ${describeHostError(error)}`;
  } finally {
    reloading = false;
  }
};

/*
 * Session snapshots tick continuously while an agent runs; each one rebuilds
 * this project's live-state entries from scratch (`ready` lists are complete)
 * and schedules one debounced storage read, so tasks the board page just
 * saved show up here without a manual Refresh.
 */
const scheduleReload = () => {
  if (reloadTimer !== undefined || disposed || !mounted) return;
  reloadTimer = window.setTimeout(() => { reloadTimer = undefined; void reload(); }, 500);
};

const syncSubscriptions = () => {
  const shown = visibleTasks(tasks, currentProject?.id ?? null);
  const needed = new Set<string>();
  for (const task of shown) if (task.sessionId && task.projectId) needed.add(task.projectId);
  for (const projectId of needed) {
    if (subs.has(projectId)) continue;
    let promise: Promise<() => void>;
    promise = host.onSessions(projectId, (snapshot) => {
      if (disposed) return;
      // `loading` keeps the last known state; a `ready` snapshot is a complete
      // list, so rebuild from scratch; an `error` means the truth is unknown —
      // drop this project's entries and let rows fall back to their stored
      // status rather than display stale activity as if it were live.
      if (snapshot.state === 'error') {
        for (const [id, state] of live) if (state.projectId === projectId) live.delete(id);
      } else if (snapshot.state === 'ready') {
        for (const [id, state] of live) if (state.projectId === projectId) live.delete(id);
        for (const session of snapshot.sessions) {
          if (session.parentId !== null) continue; // subagent sessions are never a task's chat
          live.set(session.id, { projectId, activity: session.activity, outcome: session.outcome, updatedAt: session.updatedAt });
        }
      }
      if (everLoaded) render();
      scheduleReload();
    });
    promise.then(() => {}, () => { if (subs.get(projectId) === promise) subs.delete(projectId); });
    subs.set(projectId, promise);
  }
  for (const [projectId, promise] of [...subs]) {
    if (needed.has(projectId)) continue;
    subs.delete(projectId);
    // A project leaving the visible set also leaves its live behind: an
    // unsubscribed project's entries would go stale, and stale activity must
    // never display as if it were live when it comes back into view.
    for (const [id, state] of live) if (state.projectId === projectId) live.delete(id);
    void promise.then((stop) => stop(), () => undefined);
  }
};

const render = () => {
  currentSections = buildSections(visibleTasks(tasks, currentProject?.id ?? null), live, DEFAULT_SYNC_OPTIONS);
  const sections = currentSections;
  const open = STATUSES.reduce((count, status) => count + sections[status].length, 0);
  const unseen = countUnseen(sections);
  if (currentProject) {
    scopeLine.textContent = `Project: ${currentProject.name}`;
    scopeLine.hidden = false;
  } else {
    scopeLine.hidden = true;
  }
  badge.update({
    label: unseen > 0 ? `${open} open · ${unseen} unseen` : `${open} open`,
    tone: unseen > 0 ? 'warning' : 'neutral',
  });
  void host.setBadge(open || null).catch(() => undefined);
  if (unseen > 0) {
    unseenLine.textContent = `${unseen} task${unseen === 1 ? '' : 's'} need${unseen === 1 ? 's' : ''} your review`;
    unseenLine.hidden = false;
  } else {
    unseenLine.hidden = true;
  }

  for (const status of STATUSES) {
    const ui = sectionEls[status];
    const items = sections[status];
    ui.count.textContent = String(items.length);
    if (items.some((item) => item.attention && item.displayStatus !== 'done')) ui.count.dataset.attn = 'true';
    else delete ui.count.dataset.attn;
    const open = !collapsed.has(status);
    ui.chev.textContent = open ? '▾' : '▸';
    ui.body.hidden = !open;
    ui.body.replaceChildren(...items.map(renderRow));
    if (open && items.length === 0) ui.body.append(el('div', 'kb-panel-empty', 'No tasks'));
  }
};

const renderRow = (item: PanelItem) => {
  const row = el('div', item.attention ? 'kb-panel-row kb-attn' : 'kb-panel-row');
  row.dataset.id = item.task.id;
  row.draggable = true;
  const main = el('div', 'kb-panel-main');
  row.append(main);
  main.append(el('div', 'kb-panel-title', item.task.title));

  const sub = el('div', 'kb-panel-sub');
  // Per-row project names matter only in show-all mode; scoped to one project
  // the header line names it once and the row line stays purely about the agent.
  const project = !currentProject && item.task.projectId
    ? projects.find((p) => p.id === item.task.projectId)?.name ?? null
    : null;
  if (project) sub.append(el('span', 'kb-panel-project', project));
  // A chat with no trusted live state has nothing observable to say; say only
  // that it exists rather than inventing an activity.
  const line = item.live
    ? describeActivity(item.live)
    : item.task.sessionId
      ? ({ text: 'chat linked', tone: 'idle' }) as const
      : null;
  if (line) {
    if (project) sub.append(el('span', 'kb-panel-sep', '·'));
    const dot = el('span', 'kb-panel-dot');
    dot.dataset.state = line.tone;
    sub.append(dot, el('span', 'kb-panel-live', line.text));
  }
  main.append(sub);

  if (item.attention) {
    const actions = el('div', 'kb-panel-actions');
    if (item.task.sessionId) {
      const chat = el('button', 'kb-panel-btn kb-panel-btn-primary', 'Open chat');
      chat.type = 'button';
      chat.addEventListener('click', (event) => { event.stopPropagation(); void openChat(item.task); });
      actions.append(chat);
    }
    if (item.displayStatus !== 'done') {
      const done = el('button', 'kb-panel-btn', 'Mark done');
      done.type = 'button';
      done.addEventListener('click', (event) => { event.stopPropagation(); void markDone(item.task); });
      actions.append(done);
    }
    if (actions.childElementCount > 0) main.append(actions);
  }

  if (item.movedByAgent) row.append(el('span', 'kb-panel-chip', `→ ${STATUS_LABELS[item.displayStatus]}`));

  const menuSlot = el('span', 'kb-panel-menu');
  row.append(menuSlot);
  mountMenu(menuSlot, { label: '⋯', variant: 'ghost', size: 'xs', items: rowMenuItems(item), onSelect: onRowMenuSelect(item) });

  const openTask = () => { void openChat(item.task); };
  row.addEventListener('click', (event) => {
    // The menu trigger (and its popup) live inside the row: a click there is
    // the menu's to handle, never row navigation.
    if ((event.target as HTMLElement)?.closest('.kb-panel-menu')) return;
    void openChat(item.task);
  });
  row.tabIndex = 0;
  row.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openTask(); }
  });
  row.addEventListener('dragstart', (event) => {
    draggingId = item.task.id;
    row.classList.add('kb-dragging');
    event.dataTransfer?.setData('text/plain', item.task.id);
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  });
  row.addEventListener('dragend', () => { draggingId = null; row.classList.remove('kb-dragging'); });
  return row;
};

/** Move-and-delete affordance for one row: every other column, then delete. */
const rowMenuItems = (item: PanelItem): MenuItem[] => [
  ...STATUSES
    .filter((status) => status !== item.displayStatus)
    .map((status) => ({ id: `move:${status}`, label: `Move to ${STATUS_LABELS[status]}` })),
  { separator: true },
  { id: 'delete', label: 'Delete task', destructive: true },
];

const onRowMenuSelect = (item: PanelItem) => (menuId: string) => {
  if (menuId === 'delete') { void removeTask(item.task); return; }
  if (menuId.startsWith('move:')) {
    const status = menuId.slice(5);
    if (isStatus(status)) void moveTaskByMenu(item.task, status);
  }
};

/** The rows of one section body, top to bottom, for `insertionTarget`. */
const collectRects = (body: HTMLElement, movingId: string) =>
  [...body.querySelectorAll<HTMLElement>('.kb-panel-row')]
    .filter((node) => node.dataset.id !== movingId)
    .map((node) => ({
      id: node.dataset.id ?? '',
      top: node.getBoundingClientRect().top,
      height: node.getBoundingClientRect().height,
    }));

/**
 * The panel cannot open the full board (extension pages have no open-call),
 * so a row's one navigable destination is its chat. Opening an unseen task's
 * chat is what "reviewed" means — the marker is cleared first, awaited, the
 * same way the board's Open Chat does it before `openSession` can tear this
 * frame down.
 */
const openChat = async (task: Task) => {
  if (disposed) return;
  const current = tasks.find((t) => t.id === task.id) ?? task;
  if (!current.sessionId) {
    void host.toast({
      kind: 'info',
      message: `"${current.title}" has no chat linked yet — use the full board (Extension pages menu) to start an agent.`,
    }).catch(() => undefined);
    return;
  }
  if (current.needsAttentionSince !== null) {
    const updated = applyPatch(current, { needsAttentionSince: null });
    tasks = tasks.map((t) => (t.id === current.id ? updated : t));
    render();
    try { await saveTask(host, updated); }
    catch { void reload(); }
  }
  await host.openSession(current.sessionId);
};

/** A deliberate user action — the only way a panel tap ever sets Done. */
const markDone = async (task: Task) => {
  if (disposed) return;
  const current = tasks.find((t) => t.id === task.id) ?? task;
  const updated = applyPatch(current, { status: 'done', needsAttentionSince: null });
  tasks = tasks.map((t) => (t.id === current.id ? updated : t));
  render();
  try { await saveTask(host, updated); }
  catch { void reload(); }
};

/**
 * Enter on the quick-add field: a real, persisted task, named right here,
 * appended to Backlog in the current project (unassigned when everything
 * shows — the same thing the board's Add task does in All-projects mode).
 */
const quickCommit = async (title: string) => {
  if (disposed || !title) return;
  const projectId = currentProject?.id ?? null;
  try {
    const task = createTask({ title, projectId }, rankAtEnd(tasks, 'backlog'));
    await saveTask(host, task);
    tasks = [...tasks, task];
    // No subscription sync needed: a fresh task carries no session link.
    render();
    void host.toast({
      kind: 'info',
      message: `Added "${task.title}" to Backlog${currentProject ? ` — project ${currentProject.name}` : ''}.`,
    }).catch(() => undefined);
  } catch (error) {
    void host.toast({ kind: 'error', message: `Could not add the task — ${describeHostError(error)}` }).catch(() => undefined);
  }
};

/** The board's exact rank math (`planDrop`), so panel and page orderings never diverge. */
const moveTaskTo = async (id: string, status: TaskStatus, beforeId: string | null, visible: PanelItem[]) => {
  const current = tasks.find((t) => t.id === id);
  if (!current) return;
  const plan = planDrop(visible.map((entry) => entry.task), id, beforeId);
  const rebalanceMap = new Map(plan.rebalance.map((entry) => [entry.id, entry.rank]));
  const next = tasks.map((task) => {
    if (task.id === id) return applyPatch(task, { status, rank: plan.rank, needsAttentionSince: null });
    const newRank = rebalanceMap.get(task.id);
    return newRank === undefined ? task : applyPatch(task, { rank: newRank });
  });
  tasks = next;
  render();
  try {
    await saveTask(host, next.find((t) => t.id === id)!);
    await Promise.all(plan.rebalance.map((entry) => saveTask(host, next.find((t) => t.id === entry.id)!)));
  } catch (error) {
    void host.toast({ kind: 'error', message: `Could not save the move — ${describeHostError(error)}` }).catch(() => undefined);
    void reload();
  }
};

/** A drop on a section header — included for a collapsed one: append at that column's end. */
const moveTaskToEnd = async (id: string, status: TaskStatus) => {
  const current = tasks.find((t) => t.id === id);
  const endRank = rankAtEnd(tasks, status);
  if (!current || (current.status === status && current.needsAttentionSince === null && current.rank === endRank)) return;
  const updated = applyPatch(current, { status, rank: endRank, needsAttentionSince: null });
  tasks = tasks.map((t) => (t.id === current.id ? updated : t));
  render();
  try { await saveTask(host, updated); }
  catch (error) {
    void host.toast({ kind: 'error', message: `Could not save the move — ${describeHostError(error)}` }).catch(() => undefined);
    void reload();
  }
};

/** Menu move: a status change that keeps its rank — same semantics as the board detail popup's Move-to buttons. */
const moveTaskByMenu = async (task: Task, status: TaskStatus) => {
  const current = tasks.find((t) => t.id === task.id);
  if (!current) return;
  if (current.status === status && current.needsAttentionSince === null) return;
  const updated = applyPatch(current, { status, needsAttentionSince: null });
  tasks = tasks.map((t) => (t.id === current.id ? updated : t));
  render();
  try { await saveTask(host, updated); }
  catch (error) {
    void host.toast({ kind: 'error', message: `Could not save the move — ${describeHostError(error)}` }).catch(() => undefined);
    void reload();
  }
};

/**
 * Deleting a task whose session is linked must not let the board's orphan
 * watcher re-adopt that running session as a fresh card. The board's own
 * delete flow records the session in dismissedSessions and saves that list
 * BEFORE deleting, rolling the dismissal back if the delete fails; the panel
 * runs no orphan watcher itself, but the dismissal written here protects the
 * session across the board's next adoption pass. This is the only reason
 * `dismissedSessionIds` is loaded on every panel load.
 */
const removeTask = async (task: Task) => {
  if (disposed) return;
  const current = tasks.find((t) => t.id === task.id) ?? task;
  const sessionId = current.sessionId;
  const alreadyDismissed = sessionId !== null && dismissedSessionIds.has(sessionId);
  if (sessionId && !alreadyDismissed) {
    dismissedSessionIds.add(sessionId);
    try { await saveDismissedSessions(host, dismissedSessionIds); }
    catch (error) {
      dismissedSessionIds.delete(sessionId);
      void host.toast({ kind: 'error', message: `Could not delete "${current.title}" — ${describeHostError(error)}` }).catch(() => undefined);
      return;
    }
  }
  try {
    await deleteStoredTask(host, current.id);
  } catch (error) {
    if (sessionId && !alreadyDismissed) {
      dismissedSessionIds.delete(sessionId);
      void saveDismissedSessions(host, dismissedSessionIds).catch(() => undefined);
    }
    void host.toast({ kind: 'error', message: `Could not delete "${current.title}" — ${describeHostError(error)}` }).catch(() => undefined);
    return;
  }
  tasks = tasks.filter((t) => t.id !== current.id);
  syncSubscriptions();
  render();
  void host.toast({ kind: 'info', message: `Deleted "${current.title}".` }).catch(() => undefined);
};

window.addEventListener('pagehide', () => {
  disposed = true;
  if (intervalId !== undefined) window.clearInterval(intervalId);
  if (reloadTimer !== undefined) window.clearTimeout(reloadTimer);
  host.dispose();
});
