import { connectHost } from '@openchamber/sdk';
import type { GuestProject } from '@openchamber/sdk';
import { applyHostReady, mountBadge } from '@openchamber/sdk/ui';
import { loadTasks, saveTask, saveTaskRetrying } from './store/taskStore.ts';
import { statusMove } from './store/taskOps.ts';
import { buildLinkPatch, buildStartSessionRequest } from './domain/chatLink.ts';
import { ALL_PROJECTS, matchesFilter } from './domain/board.ts';
import { badgeForCounts, buildBoardView, countOpen, countUnseen } from './domain/boardView.ts';
import { applyPatch, type Task } from './domain/task.ts';
import { DEFAULT_SYNC_OPTIONS } from './domain/sync.ts';
import { createSessionSync } from './host/sessionSync.ts';
import { describeHostError, projectForDirectory } from './host/workspace.ts';
import { mountKanbanView } from './ui/kanbanView.ts';
import { injectStyles } from './ui/styles.ts';
import { el } from './ui/dom.ts';

/**
 * The rail panel is a display mirror of the board, project-locked: the same
 * kanban view the full screen page renders (`kanbanView` rail mode), showing
 * whichever project OpenChamber currently has open. It performs exactly two
 * deliberate actions, both explicit user clicks: the ✓ a row carries marks
 * the task Done, through the same kept-rank status move the ⋯ menu takes;
 * and the chat button beside it opens the card's linked chat — or, when the
 * card has none, starts one attached to the card (no first message, the user
 * writes it) and links it here before navigating. It writes no status of its
 * own beyond those two: agent-driven moves stay display-only until the board
 * page — still the only writer of those, and the only surface for opening,
 * editing, moving, creating or deleting tasks — opens. What the panel does
 * update by itself is what it shows: live agent state per linked session,
 * regrouped for display only — where a row sits marks the move the board
 * page will persist the next time it opens.
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
  all.filter((task) => matchesFilter(task, { projectId: currentProjectId ?? ALL_PROJECTS }));

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

  // The handlers are display data, plus the panel's two deliberate actions
  // (`onMarkDone`, `onChat` — see below). No activation, no menu, no drops,
  // no folding: the renderer draws everything else with no affordance at all.
  board = mountKanbanView(wrap, 'rail', {
    // Per-row project names matter only in show-all mode; scoped to one
    // project the header line names it once and the row line stays purely
    // about the agent.
    projectName: (task) =>
      (!currentProject && task.projectId ? projects.find((p) => p.id === task.projectId)?.name ?? null : null),
    onMarkDone: async (task) => {
      // The rail's Done write: a deliberate Done the same way the ⋯ menu's
      // Move-to and the status strip take it — rank kept, attention marker
      // cleared (`statusMove`), `null` when this would change nothing. The
      // closed-over list is re-read first so a write racing another surface's
      // save lands on the task's newest stored shape.
      const current = tasks.find((t) => t.id === task.id) ?? task;
      const moved = statusMove(current, 'done');
      if (!moved) return;
      try { await saveTask(host, moved); }
      catch (error) {
        void host.toast({ kind: 'error', message: `Could not mark "${current.title}" done — ${describeHostError(error)}` }).catch(() => undefined);
        void reload();
        return;
      }
      applyTasks(tasks.map((t) => (t.id === current.id ? moved : t)));
      render();
    },
    onChat: async (task) => {
      // The rail's second carve-out. A linked card: open its chat — and
      // since opening the chat is what "reviewed" means everywhere, an
      // attention marker is cleared first, the save awaited, because
      // `openSession` may tear this frame down as part of resolving and a
      // fire-and-forget write would never reach storage (the page's
      // onOpenChat learned the same lesson). An unlinked card: start a chat
      // attached to it — `startSession` with no `text`, the rail starts an
      // empty chat the user writes into — and save the link before opening.
      const current = tasks.find((t) => t.id === task.id) ?? task;
      if (current.sessionId) {
        if (current.needsAttentionSince !== null) {
          const cleared = applyPatch(current, { needsAttentionSince: null });
          try {
            await saveTaskRetrying(host, cleared);
            applyTasks(tasks.map((t) => (t.id === current.id ? cleared : t)));
            render();
          } catch (error) {
            // The open itself is still what was asked for; the toast plus a
            // later reload reconcile the marker.
            void host.toast({ kind: 'error', message: `Opened the chat, but marking "${current.title}" reviewed failed — ${describeHostError(error)}` }).catch(() => undefined);
          }
        }
        try {
          await host.openSession(current.sessionId);
        } catch (error) {
          // A link that provably no longer resolves is the board's to
          // unlink; opening a dead one fails here with the reason, plainly.
          void host.toast({ kind: 'error', message: `Could not open the chat of "${current.title}" — ${describeHostError(error)}` }).catch(() => undefined);
        }
        return;
      }
      // The renderer only offers the new-chat glyph on rows with a project; a
      // stale row whose project vanished meanwhile gets a quiet no-op, not a
      // guess about where the chat should run.
      if (!current.projectId) return;
      const request = buildStartSessionRequest(current);
      let result;
      try {
        result = await host.startSession(request);
      } catch (error) {
        void host.toast({ kind: 'error', message: `Could not start the chat for "${current.title}" — ${describeHostError(error)}` }).catch(() => undefined);
        return;
      }
      if (result.sessionId === null) {
        void host.toast({ kind: 'error', message: `Could not start the chat (${result.failure}). Its worktree at ${result.directory} was kept so you can recover it by hand.` }).catch(() => undefined);
        return;
      }
      // A real session exists — claim the link immediately and save it with
      // retries: a lost link here leaves the session on neither path (not on
      // this task, never adopted). Same pattern, and same tiny window, as
      // the page's own Start Agent: a board open in another surface could
      // adopt it in the moment between creation and this save — the board's
      // own duplicate handling is the corrective, the panel deletes nothing.
      const linked = applyPatch(current, buildLinkPatch(request, result));
      try {
        await saveTaskRetrying(host, linked);
      } catch (error) {
        // The chat exists but the link never landed: do not navigate away.
        // The board's orphan adoption will surface it as its own card, to
        // link from there.
        void host.toast({ kind: 'error', message: `Started a chat for "${current.title}", but the link could not be saved — ${describeHostError(error)}. Open the full board to link it.` }).catch(() => undefined);
        void reload();
        return;
      }
      applyTasks(tasks.map((t) => (t.id === current.id ? linked : t)));
      render();
      // Explicit navigation, deliberately last: the panel may go down as
      // part of resolving `openSession` — everything above (link, marker)
      // is already saved, the same ordering the page's navigation paths keep.
      await host.openSession(result.sessionId);
    },
  });

  const foot = el('div', 'kb-rail-foot');
  foot.append(el('p', 'kb-muted', 'Two quick actions live here — the ✓ marks a task Done, and the chat button opens the linked chat of a card (starting one attached to it when there is none). Everything else (open, move, edit, delete) is the full board, from the Extension pages menu.'));
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
  const sections = buildBoardView(tasks, sessionSync.live(), { projectId: currentProject?.id ?? ALL_PROJECTS });
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
