import { connectHost } from '@openchamber/sdk';
import type { GuestProject } from '@openchamber/sdk';
import { applyHostReady, mountBadge } from '@openchamber/sdk/ui';
import { loadTasks } from './store/taskStore.ts';
import { ALL_PROJECTS, matchesFilter } from './domain/board.ts';
import { badgeForCounts, buildBoardView, countOpen, countUnseen } from './domain/boardView.ts';
import type { Task } from './domain/task.ts';
import { DEFAULT_SYNC_OPTIONS } from './domain/sync.ts';
import { createSessionSync } from './host/sessionSync.ts';
import { describeHostError, projectForDirectory } from './host/workspace.ts';
import { mountKanbanView } from './ui/kanbanView.ts';
import { injectStyles } from './ui/styles.ts';
import { el } from './ui/dom.ts';

/**
 * The rail panel is a pure display mirror of the board, project-locked: the
 * same kanban view the full screen page renders (`kanbanView` rail mode
 * with no action handlers — nothing there clicks, edits, moves, or deletes),
 * showing whichever project OpenChamber currently has open. It writes
 * nothing and opens nothing: the full screen page (Extension pages menu) is
 * the only surface where tasks are opened, edited, moved, created, or
 * deleted. What it does update by itself is what it shows: live agent state
 * per linked session, regrouped for display only — the → chip marks a move
 * the board page will persist the next time it opens.
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
let intervalId: number | undefined;
let reloadTimer: number | undefined;
let reloading = false;
let everLoaded = false;
let board: ReturnType<typeof mountKanbanView> | null = null;

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
 * agent-driven status writes on the board page, and no handler the panel
 * passes here could ever save anything.
 */
const sessionSync = createSessionSync(host, DEFAULT_SYNC_OPTIONS, null, undefined, {
  onLiveChange: () => { if (everLoaded && !disposed) render(); },
  onSnapshot: () => {
    // Storage has no change push: outside writes (the board page saving a
    // drag, a move, an edit) arrive on the next session snapshot tick or on
    // this low-cadence pass.
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

  // The only handler is display data. No onActivate, no menu, no drops, no
  // folding: the renderer draws rows with no affordance at all
  // (kanbanView's presence-based handlers).
  board = mountKanbanView(wrap, 'rail', {
    // Per-row project names matter only in show-all mode; scoped to one
    // project the header line names it once and the row line stays purely
    // about the agent.
    projectName: (task) =>
      (!currentProject && task.projectId ? projects.find((p) => p.id === task.projectId)?.name ?? null : null),
  });

  const foot = el('div', 'kb-rail-foot');
  foot.append(el('p', 'kb-muted', 'Tracking only — the full board (Extension pages menu) is where tasks are opened and changed.'));
  wrap.append(foot);
  root.append(wrap);

  badge = mountBadge(badgeSlot, { label: '', tone: 'neutral' });
  // Storage has no change push outside the session snapshots: this low
  // cadence pass covers the idle case, so a display-only surface never goes
  // stale either.
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
    const loaded = await loadTasks(host);
    if (disposed) return;
    applyTasks(loaded.tasks);
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
    const { tasks: loaded } = await loadTasks(host);
    if (disposed) return;
    applyTasks(loaded);
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
  if (unseen > 0) {
    unseenLine.textContent = `${unseen} task${unseen === 1 ? '' : 's'} need${unseen === 1 ? 's' : ''} your review`;
    unseenLine.hidden = false;
  } else {
    unseenLine.hidden = true;
  }
  board?.render(sections);
};

// --- Teardown

window.addEventListener('pagehide', () => {
  disposed = true;
  if (intervalId !== undefined) window.clearInterval(intervalId);
  if (reloadTimer !== undefined) window.clearTimeout(reloadTimer);
  board?.dispose();
  host.dispose();
});
