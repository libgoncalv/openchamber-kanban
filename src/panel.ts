import { connectHost } from '@openchamber/sdk';
import type { GuestProject } from '@openchamber/sdk';
import { applyHostReady, mountBadge, mountButton } from '@openchamber/sdk/ui';
import { loadTasks, saveTask } from './store/taskStore.ts';
import {
  createBacklogTask,
  deleteTaskWithDismissal,
  moveTaskToEnd,
  patchTask,
  planMove,
  saveMove,
  statusMove,
} from './store/taskOps.ts';
import { loadDismissedSessions, saveDismissedSessions } from './store/dismissedSessions.ts';
import { DEFAULT_PANEL_PREFS, loadPanelPrefs, savePanelPrefs } from './store/panelPrefs.ts';
import { applyPatch, type Task, type TaskStatus } from './domain/task.ts';
import { ALL_PROJECTS, matchesFilter } from './domain/board.ts';
import { badgeForCounts, buildBoardView, countOpen, countUnseen, type BoardItem } from './domain/boardView.ts';
import { DEFAULT_SYNC_OPTIONS } from './domain/sync.ts';
import { createSessionSync } from './host/sessionSync.ts';
import { describeHostError, fetchSessions, fetchWorktrees, projectForDirectory } from './host/workspace.ts';
import { fetchServiceBranches } from './host/branchService.ts';
import { buildBaseBranchOptions, describeWorktreeOption, hasKnownBranches } from './domain/worktree.ts';
import { createDictation } from './host/dictation.ts';
import { mountTaskDetail } from './ui/detail.ts';
import { mountKanbanView } from './ui/kanbanView.ts';
import { injectStyles } from './ui/styles.ts';
import { el } from './ui/dom.ts';

/**
 * The rail panel IS the board, filtered to whichever project OpenChamber
 * currently has open — the same sections, rows, menus and drop math as the
 * page, rendered for a narrow rail (`kanbanView` rail mode). The page stays
 * the only writer of agent-driven status changes; this panel regroups rows
 * by the live agent state for display only (the → chip) and persists only
 * deliberate user actions: quick-added tasks, drag/menu moves and deletes,
 * Mark done, and clearing the unseen marker when a chat opens. What the
 * panel now also carries is the page's own detail dialog (Edit task in the
 * ⋯ menu) minus Start Agent — that stays board-only, where the width for
 * the worktree pickers exists.
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
/** The sections as the last render drew them — what a drop plan is computed against. */
let currentSections: Record<string, BoardItem[]> | null = null;
let intervalId: number | undefined;
let reloadTimer: number | undefined;
let reloading = false;
let everLoaded = false;
let detail: { dispose: () => void } | null = null;
let board: ReturnType<typeof mountKanbanView> | null = null;
let dictation: ReturnType<typeof createDictation> | null = null;

let badge: ReturnType<typeof mountBadge>;
let statusEl: HTMLElement;
let scopeLine: HTMLElement;
let unseenLine: HTMLElement;

/**
 * The tasks a rail surface may show: the current project's tasks when
 * OpenChamber has one open — every task when not (or when the open directory
 * matches no registered project).
 */
const visibleTasksForProject = (all: readonly Task[], currentProjectId: string | null): readonly Task[] =>
  all.filter((task) => matchesFilter(task, { projectId: currentProjectId ?? ALL_PROJECTS, query: '' }));

/** The one place `tasks` changes that also refreshes the live watch: only visible projects are subscribed. */
const applyTasks = (next: Task[]) => {
  tasks = [...next];
  sessionSync.sync(visibleTasksForProject(tasks, currentProject?.id ?? null));
};

/**
 * The shared live-state provider: one `onSessions` subscription per visible
 * project holding linked sessions (same per-project pattern as always,
 * inside the frame's subscription cap), rebuilt on every trusted snapshot.
 * The panel passes no `onStatusChange`: the single-writer invariant puts all
 * agent-driven status writes on the board page.
 */
const sessionSync = createSessionSync(host, DEFAULT_SYNC_OPTIONS, null, undefined, {
  onLiveChange: () => { if (everLoaded && !disposed) render(); },
  onSnapshot: () => {
    // Storage has no change push: outside writes (the board page saving a
    // drag, a move, an edit) arrive on the next session snapshot tick, on
    // this low-cadence pass, or via Refresh.
    scheduleReload();
  },
});

const resolveCurrentProject = () => {
  currentProject = projectForDirectory(projects, currentDirectory);
};

host.onReady((ctx) => {
  if (mounted) return;
  mounted = true;
  applyHostReady(ctx, document.documentElement);
  currentDirectory = ctx.directory;
  injectStyles();
  // Voice dictation for the detail dialog's description field (mic feature
  // gate comes from the host's ready context; no microphone offer, no mic
  // button). One controller per panel mount.
  dictation = createDictation(host, { supported: ctx.features?.microphone === true });
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

  board = mountKanbanView(wrap, 'rail', {
    onActivate: (task) => { void openChat(task); },
    onEdit: (task) => { openDetail(task.id); },
    onMoveStatus: (task, status) => { void moveTaskByMenu(task, status); },
    onDelete: (task) => { void removeTask(task); },
    onDrop: (id, status, beforeId) => { void dropTask(id, status, beforeId); },
    onDropEnd: (id, status) => { void dropTaskEnd(id, status); },
    onOpenChat: (task) => { void openChat(task); },
    onMarkDone: (task) => { void markDone(task); },
    // Per-row project names matter only in show-all mode; scoped to one
    // project the header line names it once and the row line stays purely
    // about the agent.
    projectName: (task) =>
      (!currentProject && task.projectId ? projects.find((p) => p.id === task.projectId)?.name ?? null : null),
    isCollapsed: (status) => collapsed.has(status),
    onToggleSection: (status) => {
      if (collapsed.has(status)) collapsed.delete(status); else collapsed.add(status);
      void savePanelPrefs(host, { collapsed: [...collapsed] }).catch(() => undefined);
      if (everLoaded) render();
    },
  });

  const foot = el('div', 'kb-rail-foot');
  foot.append(el('p', 'kb-muted', 'Full board: Extension pages menu'));
  mountButton(foot, { label: 'Refresh', variant: 'ghost', onClick: () => { void reload(); } });
  wrap.append(foot);
  root.append(wrap);

  badge = mountBadge(badgeSlot, { label: '', tone: 'neutral' });
  // Storage has no change push outside the session snapshots: this low
  // cadence pass and Refresh cover the idle case.
  intervalId = window.setInterval(() => { void reload(); }, 30_000);

  void host.onProjects((snapshot) => {
    if (disposed || snapshot.state !== 'ready') return;
    projects = snapshot.projects;
    resolveCurrentProject();
    applyTasks(tasks);
    if (everLoaded) render();
  }).then(() => {}, () => undefined);

  void host.onDirectory((directory) => {
    if (disposed) return;
    currentDirectory = directory;
    resolveCurrentProject();
    applyTasks(tasks);
    if (everLoaded) render();
  });

  void start();
});

const start = async () => {
  try {
    const [prefs, loaded, dismissed] = await Promise.all([loadPanelPrefs(host), loadTasks(host), loadDismissedSessions(host)]);
    if (disposed) return;
    collapsed = new Set(prefs.collapsed);
    applyTasks(loaded.tasks);
    dismissedSessionIds = dismissed;
    everLoaded = true;
    statusEl.hidden = true;
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
    applyTasks(loaded);
    dismissedSessionIds = dismissed;
    if (!everLoaded) { everLoaded = true; statusEl.hidden = true; }
    render();
  } catch (error) {
    // Transient storage failures keep the last view on screen; only a first
    // load that never succeeded has nothing better to show than the reason.
    if (!everLoaded) statusEl.textContent = `Could not load tasks — ${describeHostError(error)}`;
  } finally {
    reloading = false;
  }
};

const scheduleReload = () => {
  if (reloadTimer !== undefined || disposed || !mounted) return;
  reloadTimer = window.setTimeout(() => { reloadTimer = undefined; void reload(); }, 500);
};

const render = () => {
  const sections = buildBoardView(tasks, sessionSync.live(), { projectId: currentProject?.id ?? ALL_PROJECTS, query: '' });
  currentSections = sections;
  const open = countOpen(sections);
  const unseen = countUnseen(sections);
  if (currentProject) {
    scopeLine.textContent = `Project: ${currentProject.name}`;
    scopeLine.hidden = false;
  } else {
    scopeLine.hidden = true;
  }
  const badgeCounts = badgeForCounts(open, unseen);
  badge.update({ label: badgeCounts.label, tone: badgeCounts.tone });
  // The extension-tab badge counts open tasks board-wide — one stable
  // meaning from either surface. The badge above describes what is on
  // screen (this view's open count and unseen flags).
  const openAll = tasks.filter((task) => task.status !== 'done').length;
  void host.setBadge(openAll || null).catch(() => undefined);
  if (unseen > 0) {
    unseenLine.textContent = `${unseen} task${unseen === 1 ? '' : 's'} need${unseen === 1 ? 's' : ''} your review`;
    unseenLine.hidden = false;
  } else {
    unseenLine.hidden = true;
  }
  board?.render(sections);
};

/**
 * "Reviewed" means the marker is cleared — opening the task's chat has
 * always been that on the rail, and the page's Open Chat path does the
 * same, because `openSession` can tear this frame down as part of the call,
 * before a fire-and-forget write would reach storage.
 */
const markReviewed = (task: Task) => {
  if (task.needsAttentionSince === null) return;
  const patched = patchTask(tasks, task.id, { needsAttentionSince: null });
  if (!patched) return;
  applyTasks(patched.next);
  render();
  void saveTask(host, patched.task).catch(() => void reload());
};

const openChat = async (task: Task) => {
  if (disposed) return;
  const current = tasks.find((t) => t.id === task.id) ?? task;
  if (!current.sessionId) {
    void host.toast({
      kind: 'info',
      message: `"${current.title}" has no chat linked yet — open it via ⋯ → Edit task, or use the full board (Extension pages menu) to start an agent.`,
    }).catch(() => undefined);
    return;
  }
  if (current.needsAttentionSince !== null) {
    // Awaiting the marker clear is the same discipline as the board's Open
    // Chat path: `openSession` can tear this frame down as part of the call,
    // before a fire-and-forget write would reach the host.
    const patched = patchTask(tasks, current.id, { needsAttentionSince: null });
    if (patched) {
      applyTasks(patched.next);
      render();
      try { await saveTask(host, patched.task); }
      catch { void reload(); }
    }
  }
  await host.openSession(current.sessionId);
};

/** A deliberate user action — the only way a panel tap ever sets Done. */
const markDone = async (task: Task) => {
  if (disposed) return;
  const patched = patchTask(tasks, task.id, { status: 'done', needsAttentionSince: null });
  if (!patched) return;
  applyTasks(patched.next);
  render();
  try { await saveTask(host, patched.task); }
  catch { void reload(); }
};

/**
 * Enter on the quick-add field: a real, persisted task, named right here,
 * appended to Backlog in the current project (unassigned in show-all mode —
 * the same thing the board's Add task does in All-projects mode).
 */
const quickCommit = async (title: string) => {
  if (disposed || !title) return;
  try {
    const task = await createBacklogTask(host, { tasks, title, projectId: currentProject?.id ?? null });
    applyTasks([...tasks, task]);
    render();
    void host.toast({
      kind: 'info',
      message: `Added "${task.title}" to Backlog${currentProject ? ` — project ${currentProject.name}` : ''}.`,
    }).catch(() => undefined);
  } catch (error) {
    void host.toast({ kind: 'error', message: `Could not add the task — ${describeHostError(error)}` }).catch(() => undefined);
  }
};

/**
 * Drop between rows (or into a section body): the board's exact rank math
 * (`planMove`), computed against the sections as the last render drew them,
 * so panel and page orderings never diverge.
 */
const dropTask = async (id: string, status: TaskStatus, beforeId: string | null) => {
  const visible = (currentSections?.[status] ?? []).map((entry: BoardItem) => entry.task);
  const planned = planMove(tasks, id, status, beforeId, visible);
  if (!planned) return;
  applyTasks(planned.next);
  render();
  try { await saveMove(host, planned.next, id, planned.plan); }
  catch (error) {
    void host.toast({ kind: 'error', message: `Could not save the move — ${describeHostError(error)}` }).catch(() => undefined);
    void reload();
  }
};

/** Drop on a section header — included for a collapsed one: append at that column's end. */
const dropTaskEnd = async (id: string, status: TaskStatus) => {
  const moved = moveTaskToEnd(tasks, id, status);
  if (!moved.changed) return;
  applyTasks(moved.next);
  render();
  try {
    const movedTask = moved.next.find((t) => t.id === id);
    if (movedTask) await saveTask(host, movedTask);
  } catch (error) {
    void host.toast({ kind: 'error', message: `Could not save the move — ${describeHostError(error)}` }).catch(() => undefined);
    void reload();
  }
};

/** Menu move: a status change that keeps its rank — the detail popup's Move-to semantics. */
const moveTaskByMenu = async (task: Task, status: TaskStatus) => {
  const patched = statusMove(task, status);
  if (!patched) return;
  applyTasks(tasks.map((t) => (t.id === task.id ? patched : t)));
  render();
  try { await saveTask(host, patched); }
  catch (error) {
    void host.toast({ kind: 'error', message: `Could not save the move — ${describeHostError(error)}` }).catch(() => undefined);
    void reload();
  }
};

/**
 * Deleting a task whose session is linked must not let the board's orphan
 * watcher re-adopt that running session as a fresh card. The panel runs no
 * orphan watcher itself, but the dismissal written here (before the
 * delete, per the shared `deleteTaskWithDismissal` protocol) protects the
 * session across the board's next adoption pass.
 */
const removeTask = async (task: Task) => {
  if (disposed) return;
  const current = tasks.find((t) => t.id === task.id) ?? task;
  try {
    await deleteTaskWithDismissal(host, current, dismissedSessionIds);
  } catch (error) {
    void host.toast({ kind: 'error', message: `Could not delete "${current.title}" — ${describeHostError(error)}` }).catch(() => undefined);
    return;
  }
  applyTasks(tasks.filter((t) => t.id !== current.id));
  render();
  void host.toast({ kind: 'info', message: `Deleted "${current.title}".` }).catch(() => undefined);
};

// --- The detail dialog (⋯ → Edit task): the page's own dialog, compact in
// --- the rail, minus Start Agent (board-only, where the width for the
// --- worktree pickers exists). It does not touch the `openTaskId`
// --- preference; restoring an open popup is a page concept.

const openDetail = (id: string) => {
  const found = tasks.find((t) => t.id === id);
  if (!found) return;
  markReviewed(found);
  const task = tasks.find((t) => t.id === id) ?? found;
  detail?.dispose();
  detail = mountTaskDetail(root, {
    task,
    compact: true,
    projects: projects.map((p) => ({ id: p.id, name: p.name })),
    // No Start Agent here: deliberate scope, not a capability limit.
    onStartAgent: null,
    dictation,
    onClose: closeDetail,
    onToast: (message, kind) => { void host.toast({ kind, message }).catch(() => undefined); },
    onSave: async (patch) => {
      const patched = patchTask(tasks, task.id, patch);
      if (!patched) return;
      await saveTask(host, patched.task);
      applyTasks(patched.next);
      render();
      closeDetail();
      openDetail(task.id);
    },
    onDelete: async () => {
      const current = tasks.find((t) => t.id === task.id) ?? task;
      await deleteTaskWithDismissal(host, current, dismissedSessionIds);
      applyTasks(tasks.filter((t) => t.id !== current.id));
      render();
      closeDetail();
      void host.toast({ kind: 'info', message: `Deleted "${current.title}".` }).catch(() => undefined);
    },
    onOpenChat: async (sessionId) => {
      const current = tasks.find((t) => t.id === task.id) ?? task;
      const linked = current.sessionId === sessionId ? current : { ...current, sessionId };
      markReviewed(linked);
      closeDetail();
      await host.openSession(sessionId);
    },
    onLinkSession: async (sessionId, sessionProjectId) => {
      const current = tasks.find((t) => t.id === task.id) ?? task;
      // Claimed in `dismissedSessions`-cleanup only; an existing-session link
      // needs no adoption guard of its own — the only watcher here belongs
      // to the board page, which reads the saved link at its next reload.
      const updated = applyPatch(current, {
        sessionId,
        ...(sessionProjectId ? { projectId: sessionProjectId } : {}),
        status: current.status === 'backlog' ? 'todo' : current.status,
      });
      await saveTask(host, updated);
      if (dismissedSessionIds.delete(sessionId)) {
        // Explicitly linking a dismissed session brings it back by choice.
        try { await saveDismissedSessions(host, dismissedSessionIds); }
        catch { dismissedSessionIds.add(sessionId); }
      }
      applyTasks(tasks.map((t) => (t.id === current.id ? updated : t)));
      render();
      closeDetail();
      openDetail(current.id);
    },
    onUnlinkSession: async () => {
      const patched = patchTask(tasks, task.id, { sessionId: null });
      if (!patched) return;
      await saveTask(host, patched.task);
      applyTasks(patched.next);
      render();
      closeDetail();
      openDetail(task.id);
    },
    loadSessionsForProject: async (projectId) => {
      const result = await fetchSessions(host, projectId);
      return result.sessions.map((s) => ({ id: s.id, title: s.title, activity: s.activity }));
    },
    loadWorktreeInfo: async (projectId) => {
      // Only used by Start Agent, which the rail dialog does not mount; the
      // dialog never calls this without Start Agent. Kept for the shared
      // prop shape.
      const result = await fetchWorktrees(host, projectId);
      const directory = projects.find((p) => p.id === projectId)?.directory ?? null;
      const serviceBranches = directory ? await fetchServiceBranches(host, directory) : null;
      return {
        destinations: result.worktrees.map(describeWorktreeOption),
        baseBranches: serviceBranches ?? buildBaseBranchOptions(result.worktrees),
        hasKnownBranches: serviceBranches ? serviceBranches.length > 2 : hasKnownBranches(result.worktrees),
      };
    },
  });
};

const closeDetail = () => {
  detail?.dispose();
  detail = null;
};

// --- Teardown

window.addEventListener('pagehide', () => {
  disposed = true;
  if (intervalId !== undefined) window.clearInterval(intervalId);
  if (reloadTimer !== undefined) window.clearTimeout(reloadTimer);
  board?.dispose();
  detail?.dispose();
  host.dispose();
});
