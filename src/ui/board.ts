import type { GuestProject, HostClient } from '@openchamber/sdk';
import { mountBadge, mountBanner, mountMenu, mountSelect, mountSpinner } from '@openchamber/sdk/ui';
import { applyPatch, createTask, DEFAULT_TASK_TITLE, STATUSES, STATUS_LABELS, type Task, type TaskPatch, type TaskStatus } from '../domain/task.ts';
import { ALL_PROJECTS, NO_PROJECT, planStatusMoves, rankAtEnd, type BoardFilter } from '../domain/board.ts';
import { badgeForCounts, buildBoardView, countOpen, countUnseen, liveStateFor, nextLooksDoneTickAt, type BoardSections } from '../domain/boardView.ts';
import { createBacklogTask, deleteTaskWithDismissal, deleteTasksWithDismissal, patchTask, planMove, saveMove, statusMove } from '../store/taskOps.ts';
import { deleteTask, loadTasks, saveTask, saveTaskRetrying } from '../store/taskStore.ts';
import { loadPrefs, savePrefs, type Prefs } from '../store/prefs.ts';
import { loadOrphanWatermark, saveOrphanWatermark } from '../store/orphanWatermark.ts';
import { loadDismissedSessions, saveDismissedSessions } from '../store/dismissedSessions.ts';
import { describeHostError, fetchProjects, fetchSessions, fetchWorktrees, watchProjects } from '../host/workspace.ts';
import { createSessionSync } from '../host/sessionSync.ts';
import { createWorktreeSync } from '../host/worktreeSync.ts';
import { watchOrphanSessions } from '../host/orphanSessions.ts';
import { fillComposerAfterOpen } from '../host/promptFill.ts';
import { DEFAULT_SYNC_OPTIONS } from '../domain/sync.ts';
import { sessionLinkState, worktreeLinkState, type SessionGoneReason, type SessionsView, type WorktreesView } from '../domain/unlink.ts';
import { EXTENSION_ID, chatPromptForTask, taskUrl } from '../domain/chatLink.ts';
import { sessionTitleForTask, titleForOrphanSession } from '../domain/autoTask.ts';
import { resolveTaskWorktree } from '../domain/worktree.ts';
import { planPendingApply } from '../domain/agentChannel.ts';
import { newTaskId } from '../domain/task.ts';
import { ackPendingEntries, fetchPendingEntries, pushMirror } from '../host/agentChannel.ts';
import { mountTaskDetail } from './detail.ts';
import { createDictation } from '../host/dictation.ts';
import { mountKanbanView } from './kanbanView.ts';
import { injectStyles } from './styles.ts';
import { el } from './dom.ts';

export type BoardHost = Pick<
  HostClient,
  'storage' | 'onProjects' | 'onSessions' | 'onWorktrees' | 'openSession' | 'startSession' | 'prompt' | 'serviceRequest' | 'toast' | 'openMicrophone' | 'onServiceEvent'
>;

/**
 * Agent state drives task status, one direction only: the agent working
 * moves a task to In Progress, and the agent finishing, asking a question,
 * hitting a permission prompt, or failing moves it to Review — never to
 * Done. A task the user marked Done stays there regardless of what its
 * session does afterwards; only the user's own Mark Done ever sets it.
 */
const SYNC_OPTIONS = DEFAULT_SYNC_OPTIONS;

/**
 * The full-screen board is the same kanban view as the rail panel, across
 * all projects (with a project filter and search), with the editing depth:
 * the detail popup, Start Agent, link/unlink, and the machinery that has no
 * place in a rail surface — the agent-status writer, adoption, and link
 * reconciliation. Rendering and shared mutations come from `kanbanView` and
 * `taskOps`, so the two surfaces can never disagree on look or ordering.
 */
export const mountKanbanBoard = (host: BoardHost, root: Element, options?: { microphoneSupported?: boolean }) => {
  injectStyles();
  root.replaceChildren();

  // Voice dictation for the description field (mic feature gate comes from the
  // host's ready context passed by page.ts; no microphone offer, no mic
  // button). One controller per board mount; it closes the microphone whenever
  // its detail dialog unmounts, which keeps the capture scoped to one open
  // popup.
  const dictation = createDictation(host, { supported: options?.microphoneSupported === true });

  const page = el('div', 'kb-page');
  root.append(page);

  const toolbar = el('div', 'kb-toolbar'); page.append(toolbar);
  const projectSelectWrap = el('div', 'grow'); toolbar.append(projectSelectWrap);
  const badgeSlot = el('span'); toolbar.append(badgeSlot);
  const badge = mountBadge(badgeSlot, { label: '', tone: 'neutral' });
  // Toolbar icon buttons — the kb-iconbtn idiom drawn at toolbar scale: the
  // reload above the board and the primary plus. `reload()` drives the
  // reload's spin so a snapshot- or interval-triggered reload shows too.
  const toolbarIcon = (paths: string[], label: string) => {
    const button = el('button', 'kb-iconbtn kb-tb-iconbtn');
    button.type = 'button';
    button.title = label;
    button.setAttribute('aria-label', label);
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
    button.append(node);
    return button;
  };
  const reloadButton = toolbarIcon(['M23 4v6h-6', 'M20.49 15a9 9 0 1 1-2.12-9.36L23 10'], 'Refresh');
  reloadButton.addEventListener('click', () => { void reload(); });
  toolbar.append(reloadButton);
  const plusButton = toolbarIcon(['M12 5v14M5 12h14'], 'Add task');
  plusButton.dataset.primary = 'true';
  toolbar.append(plusButton);

  const bannerSlot = el('div'); page.append(bannerSlot);
  bannerSlot.hidden = true;
  const banner = mountBanner(bannerSlot, { tone: 'error', title: '' });
  const showBanner = (title: string, body?: string, tone: 'error' | 'warning' | 'info' = 'error') => {
    bannerSlot.hidden = false; banner.update({ tone, title, body });
  };
  const clearBanner = () => { bannerSlot.hidden = true; };
  const notify = (error: unknown) => showBanner('Something went wrong', describeHostError(error));

  /**
   * The selection bar: visible only while tasks are selected (multi-select
   * is board-page state; the rail panel passes no selection handlers and
   * knows nothing of it). One row — count, Move-to menu, Mark Done, Delete —
   * built once; the menu reads the live selection at click time, so it never
   * needs re-mounting on selection changes.
   */
  const selected = new Set<string>();
  let deleteArmed = false;
  let emptyArmed: TaskStatus | null = null;
  let emptyArmTimer: ReturnType<typeof setTimeout> | null = null;

  const selectionBar = el('div', 'kb-selectionbar');
  selectionBar.hidden = true;
  page.append(selectionBar);
  const selectionCount = el('span', 'kb-selectionbar-count');
  const moveMenuSlot = el('span', 'kb-selectionbar-move');
  const markDoneButton = el('button', 'kb-bar-btn', 'Mark Done');
  markDoneButton.type = 'button';
  markDoneButton.dataset.tone = 'success';
  markDoneButton.title = 'Move every selected task to Done';
  const deleteButton = el('button', 'kb-bar-btn', 'Delete');
  deleteButton.type = 'button';
  deleteButton.dataset.tone = 'danger';
  selectionBar.append(selectionCount, moveMenuSlot, markDoneButton, deleteButton);
  const selectionMoveMenu = mountMenu(moveMenuSlot, {
    label: 'Move to ⌄', variant: 'ghost', size: 'xs',
    items: STATUSES.map((status) => ({ id: `move:${status}`, label: `Move to ${STATUS_LABELS[status]}` })),
    onSelect: (menuId: string) => {
      if (!menuId.startsWith('move:')) return;
      const status = menuId.slice(5);
      if ((STATUSES as readonly string[]).includes(status)) void moveSelectedTo(status as TaskStatus);
    },
  });
  markDoneButton.addEventListener('click', () => { void moveSelectedTo('done'); });
  deleteButton.addEventListener('click', () => {
    const list = selectedTasks();
    if (list.length === 0) return;
    // The detail dialog's two-press destructive confirm, in bar form: the
    // first press arms (label + destructive fill), the second deletes.
    if (!deleteArmed) {
      deleteArmed = true;
      deleteButton.textContent = 'Click again to delete';
      deleteButton.dataset.armed = 'true';
      return;
    }
    resetDeleteButton();
    void deleteTasksForIds(list);
  });

  const columnsWrap = el('div'); page.append(columnsWrap);
  const spinnerSlot = el('div'); page.append(spinnerSlot);

  let tasks: Task[] = [];
  let projects: GuestProject[] = [];
  let prefs: Prefs = { projectId: ALL_PROJECTS, openTaskId: null };
  let filter: BoardFilter = { projectId: ALL_PROJECTS };
  let detail: { dispose: () => void } | null = null;
  let disposed = false;
  let currentSections: BoardSections | null = null;

  const board = mountKanbanView(columnsWrap, 'page', {
    onActivate: (task) => { openDetail(task.id); },
    onEdit: (task) => { openDetail(task.id); },
    onDelete: (task) => { void deleteTaskForTask(task); },
    onDrop: (id, status, beforeId) => { void dropTask(id, status, beforeId); },
    onMoveStatus: (task, status) => { void moveTaskByMenu(task, status); },
    // The ✓ in the looks-done affordance is the user's own click and so a
    // deliberate Done — exactly the ⋯ menu's Move-to Done path: kept rank,
    // attention marker cleared, persisted with the shared rollback.
    onLooksDone: (task) => { void moveTaskByMenu(task, 'done'); },
    // Multi-select lives in the page's own state; the renderer only asks.
    onToggleSelect: (task) => { toggleSelect(task); },
    isSelected: (task) => selected.has(task.id),
    // The column head's Trash: first press arms, the second empties. Arming
    // survives re-renders (this every-render rebuild re-asks the flag).
    onEmptyColumn: (status) => { emptyColumn(status); },
    isColumnEmptyArmed: (status) => emptyArmed === status,
    projectName: (task) => (task.projectId ? projects.find((p) => p.id === task.projectId)?.name ?? task.projectId : null),
  });

  // No title field here on purpose: a click creates a real, persisted task right
  // away (title "New task", editable immediately in the popup that opens for it),
  // instead of asking for a title before there's anything to attach it to.
  plusButton.addEventListener('click', () => {
    void (async () => {
      try {
        plusButton.dataset.busy = 'true';
        plusButton.disabled = true;
        const task = await createBacklogTask(
          host,
          { tasks, title: DEFAULT_TASK_TITLE, projectId: filter.projectId === ALL_PROJECTS || filter.projectId === NO_PROJECT ? null : filter.projectId },
        );
        setTasks([...tasks, task]);
        clearBanner();
        render();
        openDetail(task.id);
      } catch (error) { notify(error); }
      finally { plusButton.disabled = false; delete plusButton.dataset.busy; }
    })();
  });

  /**
   * The one place `tasks` changes, so the session/worktree watchers always see the current set.
   */
  const setTasks = (next: Task[]) => {
    tasks = next;
    sessionSync.sync(tasks);
    worktreeSync.sync(tasks);
    scheduleMirrorPush();
  };

  /**
   * The status this mount last attempted to write for a task via the live
   * sync, whether it succeeded or not. A session's `onSessions` snapshot
   * fires continuously while it runs, so without this a single persistent
   * save failure would retry the identical write (and re-show the error)
   * on every tick. Only a genuinely different target status — the agent
   * moving to a new activity — is allowed to try again.
   */
  let lastAttemptedStatus = new Map<string, TaskStatus>();

  const applyAgentStatusChange = (taskId: string, next: TaskStatus) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === next) return;
    if (lastAttemptedStatus.get(taskId) === next) return;
    lastAttemptedStatus.set(taskId, next);
    // Landing in Review this way is a change you didn't make yourself, so it's flagged until you look at it.
    // Moving anywhere else (e.g. back to In Progress) clears a stale flag that's no longer about this status.
    const updated = applyPatch(task, { status: next, needsAttentionSince: next === 'review' ? Date.now() : null });
    setTasks(tasks.map((t) => (t.id === taskId ? updated : t)));
    render();
    void saveTask(host, updated).catch((error) => { notify(error); void reload(); });
  };

  /**
   * Clears one link on a task (its session, or its worktree) after the thing
   * it points at was deleted or archived on the host. Session deletion uses
   * deleteTaskForGoneSession instead. The state and save are unconditional —
   * the caller checked the guard — but every caller updates its own state
   * synchronously first, so a repeated report is a no-op.
   * `message` null means stay quiet (reconciliation reports one summary
   * instead of one toast per task).
   */
  const clearTaskLink = (taskId: string, patch: TaskPatch, message: string | null): boolean => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return false;
    const updated = applyPatch(task, patch);
    setTasks(tasks.map((t) => (t.id === taskId ? updated : t)));
    render();
    void saveTask(host, updated)
      .then(() => { if (message) void host.toast({ kind: 'info', message }).catch(() => undefined); })
      .catch((error) => { notify(error); void reload(); });
    return true;
  };

  /**
   * A task's linked session was deleted or archived from the sidebar. A
   * deleted session removes the task; an archived session only clears the
   * link, so the card no longer claims a session that "Open Chat" cannot open.
   */
  const deleteTaskForGoneSession = (taskId: string, message: string | null): boolean => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return false;
    void deleteTask(host, task.id)
      .then(() => {
        if (prefs.openTaskId === task.id) void persistOpenTask(null);
        if (message) void host.toast({ kind: 'info', message }).catch(() => undefined);
      })
      .catch((error) => { notify(error); void reload(); });
    setTasks(tasks.filter((candidate) => candidate.id !== task.id));
    if (prefs.openTaskId === task.id) { detail?.dispose(); detail = null; }
    render();
    return true;
  };

  const onSessionGone = (taskId: string, sessionId: string, reason: SessionGoneReason) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.sessionId !== sessionId) return;
    if (reason === 'deleted') {
      deleteTaskForGoneSession(taskId, `Deleted "${task.title}" — its session was deleted.`);
    } else {
      clearTaskLink(taskId, { sessionId: null }, `Unlinked "${task.title}" — its session was archived.`);
    }
  };

  /** A task's worktree was deleted from the sidebar; the recorded worktree no longer points anywhere. */
  const onWorktreeGone = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || !task.worktree) return;
    clearTaskLink(taskId, { worktree: null }, `Cleared the worktree link on "${task.title}" — that worktree was deleted.`);
  };

  const sessionSync = createSessionSync(host, SYNC_OPTIONS, applyAgentStatusChange, onSessionGone);
  const worktreeSync = createWorktreeSync(host, onWorktreeGone);

  // ---- The agent channel: mirror push + journal apply ----
  // How an OpenCode agent in one of this board's projects reads tasks and
  // queues changes (see domain/agentChannel.ts). The service has no
  // host.storage access and the board is the only writer, so the channel is
  // two directions of best-effort sync: the mirror (reads, pushed debounced
  // after every change) and the journal (writes, pulled on every load and on
  // the service's live emit). Everything here degrades silently — the
  // extension may run without a service at all.

  /**
   * The mirror push is debounced (a burst of saves is one push) and skipped
   * while the live project list is empty: its value is mostly the per-task
   * project name and directory an agent maps its own working directory
   * against, so pushing before the first project snapshot lands is pushing
   * a map-less mirror. The next change, load, or event re-tries it.
   */
  let mirrorTimer: ReturnType<typeof setTimeout> | null = null;
  let mirrorInFlight = false;
  const pushMirrorNow = () => {
    if (disposed) return;
    mirrorInFlight = true;
    void pushMirror(host, tasks, projects).finally(() => { mirrorInFlight = false; });
  };
  const scheduleMirrorPush = () => {
    if (disposed || mirrorTimer !== null) return;
    mirrorTimer = setTimeout(() => {
      mirrorTimer = null;
      if (disposed) return;
      if (mirrorInFlight) { scheduleMirrorPush(); return; }
      if (projects.length === 0) return;
      pushMirrorNow();
    }, 500);
  };

  /**
   * Applies what agents queued while the board was closed — or just now, live
   * (the service's `emit` lands here when a frame is open). One pure plan,
   * then exactly the changed records saved with per-entry independence (one
   * failure keeps only its own entry pending, retried by the next pull —
   * the id acks remove only what provably landed, so a replay can never
   * duplicate). A total service failure is silent: the channel is optional
   * and the board's next load re-pulls.
   */
  let applyingAgentPending = false;
  const applyAgentPending = async (): Promise<void> => {
    if (applyingAgentPending || disposed) return;
    applyingAgentPending = true;
    try {
      const entries = await fetchPendingEntries(host);
      if (entries === null || entries.length === 0) return;
      // The live list is the resolver of record for agent-created projects;
      // before the watcher's first snapshot lands, ask once (same
      // resolve/release pattern as the other one-off fetches).
      const knownProjects = projects.length > 0
        ? projects
        : (await fetchProjects(host).catch(() => ({ projects: [] as GuestProject[] }))).projects;
      // A plan failure (a stale journal can hold what today's validation
      // refuses) must not kill an event-driven pull unhandled: stay quiet,
      // keep the entries pending, let the next Refresh — which answers
      // through its own error surface — retry them.
      let plan;
      try { plan = planPendingApply(entries, tasks, knownProjects, newTaskId, Date.now()); }
      catch {
        showBanner('An agent change could not be read', 'The queued entries stay pending — Refresh retries them.', 'warning');
        return;
      }
      const createResults = await Promise.allSettled(plan.creates.map((entry) => saveTask(host, entry.task)));
      const noteResults = await Promise.allSettled(plan.notes.map((note) => saveTask(host, note.task)));
      const okCreates = plan.creates.filter((_, index) => createResults[index]?.status === 'fulfilled');
      const okNotes = plan.notes.filter((_, index) => noteResults[index]?.status === 'fulfilled');
      const failedCount = createResults.length + noteResults.length - okCreates.length - okNotes.length;
      if (okCreates.length > 0 || okNotes.length > 0 || plan.dropped.length > 0) {
        const acked = await ackPendingEntries(host, [
          ...okCreates.map((entry) => entry.entryId),
          ...okNotes.flatMap((note) => note.entryIds),
          ...plan.dropped,
        ]);
        if (!acked) {
          // The entries stay pending, so the next pull re-plans them — the
          // creates would then be applied twice. Re-plan-time dedupe cannot
          // know which ids landed, so treat a failed ack as a failed apply:
          // reload from storage, which holds the truth.
          void reload();
          return;
        }
      }
      if (okCreates.length > 0 || okNotes.length > 0) {
        const createdIds = new Set(okCreates.map((entry) => entry.task.id));
        const noteById = new Map(okNotes.map((note) => [note.taskId, note.task]));
        const stillUnknown = (id: string) => !tasks.some((t) => t.id === id);
        setTasks(
          tasks
            .map((task) => noteById.get(task.id) ?? task)
            .concat(okCreates.filter((entry) => stillUnknown(entry.task.id)).map((entry) => entry.task)),
        );
        render();
      }
      const parts: string[] = [];
      if (okCreates.length === 1) parts.push(`added "${okCreates[0]!.task.title}" (${STATUS_LABELS[okCreates[0]!.task.status]})`);
      else if (okCreates.length > 1) parts.push(`added ${okCreates.length} tasks`);
      if (okNotes.length === 1) {
        const title = tasks.find((t) => t.id === okNotes[0]!.taskId)?.title ?? okNotes[0]!.taskId;
        parts.push(`an agent left a note on "${title}"`);
      } else if (okNotes.length > 1) parts.push(`agent notes landed on ${okNotes.length} tasks`);
      if (parts.length > 0) {
        void host.toast({ kind: 'info', message: `From an agent: ${parts.join(', ')}.` }).catch(() => undefined);
      }
      if (failedCount > 0) {
        showBanner('Some agent changes could not be applied', `${failedCount} of ${plan.creates.length + plan.notes.length} stayed queued — Refresh retries them.`, 'warning');
      }
    } finally {
      applyingAgentPending = false;
    }
  };
  let agentPullTimer: ReturnType<typeof setTimeout> | null = null;
  const scheduleAgentPull = () => {
    if (disposed || agentPullTimer !== null) return;
    agentPullTimer = setTimeout(() => { agentPullTimer = null; void applyAgentPending(); }, 300);
  };
  const stopAgentEvents = host.onServiceEvent((event) => {
    if (event.topic !== 'kanban-agent-change') return;
    scheduleAgentPull();
  });

  /** A deleted task's session stays out of automatic adoption, even after a reload. */
  let dismissedSessionIds = new Set<string>();
  const excludedSessionIds = () => new Set([
    ...dismissedSessionIds,
    ...tasks.flatMap((task) => task.sessionId ? [task.sessionId] : []),
  ]);
  /**
   * Every session id this mount has ever tried to adopt, success or
   * failure. A live session's `onSessions` snapshot fires continuously
   * while it runs, so this must be a permanent-for-this-mount guard, not
   * cleared on failure — otherwise a single persistent storage error turns
   * into a retry-and-error-toast storm on every snapshot tick. A fresh
   * `Refresh`/reopen gets a clean slate via `reload()` below.
   */
  let attemptedSessions = new Set<string>();

  /**
   * How many `startSession` calls (for any task) are currently in flight.
   * While this is above zero, adoption is paused — not just guarded by
   * `attemptedSessions`, which can only be populated *after* `startSession`
   * resolves with the session's id. The host can report the new session it is
   * in the middle of creating to this mount's own live orphan watcher
   * before that promise resolves, so without this, a session this very
   * call is about to claim as its own task's link can be adopted as a
   * second, duplicate task first. Decremented the moment the id is known
   * and claimed in `attemptedSessions`, not held for the whole call, so a
   * genuinely unrelated orphan elsewhere is paused for as little as
   * possible.
   */
  let startingAgents = 0;
  // Critical link-saves below retry through `saveTaskRetrying` (taskStore):
  // a session created or deliberately linked must not lose its link to a
  // transient storage failure — a lost link sits on neither path.
  /**
   * The persisted "going forward" cutoff (see `store/orphanWatermark.ts`):
   * a session is only adoptable if it was created at or after this time.
   * `Infinity` until `reload()` has actually loaded or set it, so nothing
   * is adopted on a race before we know the real value.
   */
  let orphanWatermark = Infinity;

  /**
   * A session with no task yet, created at or after the persisted
   * watermark, gets adopted as a new task — In Progress while it's
   * running, Review once it needs you (a question, a permission prompt, or
   * it already finished). Sessions older than the watermark (pre-dating
   * this feature's first use) are left alone, by design.
   */
  const adoptRunningSession = (projectId: string, session: { id: string; title: string; createdAt: number }, status: TaskStatus) => {
    if (disposed || startingAgents > 0 || attemptedSessions.has(session.id) || excludedSessionIds().has(session.id)) return;
    if (session.createdAt < orphanWatermark) return;
    attemptedSessions.add(session.id);
    void (async () => {
      try {
        const task: Task = {
          ...createTask({ title: titleForOrphanSession(session, projects.find((p) => p.id === projectId)?.name ?? null), projectId, status }, rankAtEnd(tasks, status)),
          sessionId: session.id,
          // Landing straight in Review (already finished, or needs you) is just as unseen as any other automatic move there.
          needsAttentionSince: status === 'review' ? Date.now() : null,
        };
        await saveTask(host, task);
        setTasks([...tasks, task]);
        render();
        void host.toast({ kind: 'info', message: `Added "${task.title}" to the board (${STATUS_LABELS[status]}) — found a session running with no task.` }).catch(() => undefined);
      } catch (error) { notify(error); }
    })();
  };
  let orphanWatcher: { dispose: () => void } | null = null;

  const projectOptions = () => [
    { id: ALL_PROJECTS, label: 'All projects' },
    { id: NO_PROJECT, label: 'No project' },
    ...projects.map((p) => ({ id: p.id, label: p.name })),
  ];
  const projectSelect = mountSelect(projectSelectWrap, {
    label: 'Project', value: ALL_PROJECTS, options: projectOptions(), searchable: true,
    onChange: (value) => {
      filter = { projectId: value }; projectSelect.update({ value });
      void savePrefs(host, { ...prefs, projectId: value }).catch(() => undefined);
      prefs = { ...prefs, projectId: value };
      render();
    },
  });

  /**
   * Returns the save's promise — most callers fire-and-forget it (`void`),
   * but the two navigate-away paths below must await it: `host.openSession`
   * can tear this page down as part of the same call, before a
   * fire-and-forget write to storage has actually reached the host, which
   * would leave the old value persisted and this task reopening the next
   * time the board loads.
   */
  const persistOpenTask = (id: string | null): Promise<void> => {
    prefs = { ...prefs, openTaskId: id };
    return savePrefs(host, prefs).catch(() => undefined);
  };

  const closeDetail = () => {
    detail?.dispose(); detail = null;
    void persistOpenTask(null);
  };

  /** Opening a task — its chat or its detail popup — is what "reviewed" means; clear any unseen marker. */
  const markReviewed = (task: Task) => {
    if (task.needsAttentionSince === null) return;
    const updated = applyPatch(task, { needsAttentionSince: null });
    setTasks(tasks.map((t) => (t.id === task.id ? updated : t)));
    render();
    void saveTask(host, updated).catch((error) => notify(error));
  };

  // ---- Shared mutations (page + rail): create, move, delete ----

  const dropTask = async (id: string, status: TaskStatus, beforeId: string | null) => {
    const visible = (currentSections?.[status] ?? []).map((item) => item.task);
    const planned = planMove(tasks, id, status, beforeId, visible);
    if (!planned) return;
    setTasks(planned.next);
    render();
    try {
      await saveMove(host, planned.next, id, planned.plan);
    } catch (error) {
      notify(error);
      void reload();
    }
  };

  /** The ⋯ menu's Move-to: a status change that keeps its rank, marker cleared — as on the rail. */
  const moveTaskByMenu = async (task: Task, status: TaskStatus) => {
    const moved = statusMove(task, status);
    if (!moved) return;
    try { await saveTask(host, moved); }
    catch (error) { notify(error); void reload(); return; }
    setTasks(tasks.map((t) => (t.id === task.id ? moved : t)));
    render();
  };

  /** The shared delete protocol: dismiss the linked session first, roll back on failure. */
  const deleteTaskForTask = async (task: Task) => {
    try {
      await deleteTaskWithDismissal(host, task, dismissedSessionIds);
    } catch (error) { notify(error); return; }
    if (prefs.openTaskId === task.id) closeDetail();
    setTasks(tasks.filter((t) => t.id !== task.id));
    render();
    void host.toast({ kind: 'info', message: `Deleted "${task.title}".` }).catch(() => undefined);
  };

  // ---- Multi-select (page only): the selection bar, bulk move/delete, column cleanup ----

  const selectedTasks = () => tasks.filter((task) => selected.has(task.id));

  const toggleSelect = (task: Task) => {
    if (selected.has(task.id)) selected.delete(task.id);
    else selected.add(task.id);
    render();
  };

  /**
   * The bulk Move-to / Mark Done: one pure plan for the whole selection
   * (the group appended at the target column's end in rank order, attention
   * markers cleared, tasks already in the target left in place), then exactly
   * the changed records saved. A failure anywhere falls back to a full
   * reload — the same discipline a single move follows.
   */
  const moveSelectedTo = async (status: TaskStatus) => {
    const planned = planStatusMoves(tasks, [...selected], status);
    if (!planned) return;
    setTasks(planned.next);
    render();
    try {
      await Promise.all(planned.changed.map((task) => saveTask(host, task)));
    } catch (error) {
      notify(error);
      void reload();
    }
  };

  /**
   * The one batch-delete path behind both the selection bar's Delete and a
   * column head's emptied trash: the shared dismissal-first protocol, per-key
   * isolation, one toast. Tasks whose delete failed stay on the board behind
   * a warning; the failed ones can be retried once the cause is fixed.
   */
  const deleteTasksForIds = async (list: readonly Task[]) => {
    try {
      const { deletedIds, failed } = await deleteTasksWithDismissal(host, list, dismissedSessionIds);
      const deleted = new Set(deletedIds);
      if (deleted.size > 0) {
        if (prefs.openTaskId && deleted.has(prefs.openTaskId)) closeDetail();
        for (const id of deleted) selected.delete(id);
        setTasks(tasks.filter((task) => !deleted.has(task.id)));
        render();
        const titles = list.filter((task) => deleted.has(task.id)).map((task) => task.title);
        void host.toast({
          kind: 'info',
          message: titles.length === 1 ? `Deleted "${titles[0]}".` : `Deleted ${titles.length} tasks.`,
        }).catch(() => undefined);
      }
      if (failed.length > 0) {
        const unit = failed.length === 1 ? 'deletion did' : 'deletions did';
        showBanner('Some tasks could not be deleted', `${failed.length} of ${list.length} ${unit} not go through. Refresh and try again.`, 'warning');
      } else clearBanner();
    } catch (error) { notify(error); }
  };

  /**
   * The column trash's two-press confirm: the first press arms (the head
   * button turns destructive, its tooltip becomes "Click again …"), with a
   * short timeout so a stray tap never leaves a column primed for deletion.
   * Arming lives across renders as this surface's state; the trash on an
   * empty column never arms at all.
   */
  const disarmEmpty = () => {
    emptyArmed = null;
    if (emptyArmTimer !== null) { clearTimeout(emptyArmTimer); emptyArmTimer = null; }
  };
  const emptyColumn = (status: TaskStatus) => {
    if (emptyArmed !== status) {
      const shown = currentSections?.[status] ?? [];
      if (shown.length === 0) return;
      // Any arming from another column is cancelled here — the old timer
      // belongs to the old status and must never clear this one's arming.
      disarmEmpty();
      emptyArmed = status;
      render();
      emptyArmTimer = setTimeout(() => {
        emptyArmTimer = null;
        if (emptyArmed !== null) { emptyArmed = null; render(); }
      }, 3500);
      return;
    }
    disarmEmpty();
    const list = (currentSections?.[status] ?? []).map((item) => item.task);
    if (list.length === 0) return;
    void deleteTasksForIds(list);
  };

  const resetDeleteButton = () => {
    deleteArmed = false;
    deleteButton.textContent = 'Delete';
    deleteButton.removeAttribute('data-armed');
  };

  const updateSelectionBar = () => {
    const count = selected.size;
    selectionBar.hidden = count === 0;
    selectionCount.textContent = count === 1 ? '1 selected' : `${count} selected`;
    if (count === 0) resetDeleteButton();
  };

  /**
   * Escape drops the selection (and an armed column trash) — but only while
   * no detail dialog is open: the dialog owns Escape first, being modal and
   * trapping focus, so clearing waits for a second press there.
   */
  const onSelectionKeydown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || event.defaultPrevented) return;
    if (detail) return;
    if (selected.size === 0 && emptyArmed === null) return;
    selected.clear();
    resetDeleteButton();
    disarmEmpty();
    render();
  };
  document.addEventListener('keydown', onSelectionKeydown);

  const updateBadge = (sections: BoardSections) => {
    // The mounted badge describes what is on screen. The extension-tab rail
    // icon carries no number on purpose: the panel is display-only and no
    // surface should make it look like a counter (host.setBadge unused).
    const open = countOpen(sections);
    const unseen = countUnseen(sections);
    const counts = badgeForCounts(open, unseen);
    badge.update({ label: counts.label, tone: counts.tone });
  };

  /**
   * The board's one time-driven re-render: a quiet window crossing (the ✓
   * appears) or a tooltip minute while it still counts — the earliest such
   * instant across the tasks on the board. Everything else re-renders
   * through snapshots and saves; nothing here ever writes.
   */
  let looksDoneTimer: ReturnType<typeof setTimeout> | null = null;
  const clearLooksDoneTick = () => {
    if (looksDoneTimer !== null) { clearTimeout(looksDoneTimer); looksDoneTimer = null; }
  };
  const scheduleLooksDoneTick = () => {
    clearLooksDoneTick();
    if (disposed) return;
    const now = Date.now();
    let next: number | null = null;
    for (const task of tasks) {
      const at = nextLooksDoneTickAt(task, liveStateFor(task, sessionSync.live()), now);
      if (at !== null && (next === null || at < next)) next = at;
    }
    if (next === null) return;
    looksDoneTimer = setTimeout(() => { looksDoneTimer = null; if (!disposed) render(); }, Math.max(0, next - Date.now()));
  };

  const render = () => {
    updateSelectionBar();
    const sections = buildBoardView(tasks, sessionSync.live(), filter);
    currentSections = sections;
    updateBadge(sections);
    board.render(sections);
    scheduleLooksDoneTick();
  };

  const openDetail = (id: string) => {
    const found = tasks.find((t) => t.id === id);
    if (!found) return;
    markReviewed(found);
    const task = tasks.find((t) => t.id === id) ?? found;
    detail?.dispose();
    void persistOpenTask(id);
    detail = mountTaskDetail(root, {
      task,
      projects: projects.map((p) => ({ id: p.id, name: p.name })),
      compact: false,
      // The head pill reads this live, so a dialog held open across a state
      // change still shows the pill that re-rendering the board would show.
      liveSession: () => (task.sessionId ? sessionSync.live().get(task.sessionId) ?? null : null),
      onClose: closeDetail,
      // Voice dictation for the description field; absent when the host did
      // not offer the microphone feature (the mic button then never renders).
      dictation: options?.microphoneSupported ? dictation : null,
      onToast: (message, kind) => { void host.toast({ kind, message }).catch(() => undefined); },
      onSave: async (patch) => {
        const patched = patchTask(tasks, task.id, patch);
        if (!patched) return;
        await saveTask(host, patched.task);
        setTasks(patched.next);
        render();
        closeDetail();
        openDetail(task.id);
      },
      onDelete: async () => {
        await deleteTaskWithDismissal(host, task, dismissedSessionIds);
        setTasks(tasks.filter((t) => t.id !== task.id));
        closeDetail();
        render();
      },
      onOpenChat: async (sessionId) => {
        // Awaited, not fire-and-forget, and before navigating away — `host.openSession`
        // can tear this page down as part of the same call, before a fire-and-forget
        // write actually reaches the host, which would leave the old value persisted
        // and this task reopening the next time the board loads. The marker was
        // already cleared when the dialog opened (see `openDetail`).
        await persistOpenTask(null);
        await host.openSession(sessionId);
        closeDetail();
      },
      onLinkSession: async (sessionId, sessionProjectId) => {
        // Claimed immediately, before the save, so the orphan watcher never adopts this
        // session as a second task even if the save below is slow or ultimately fails.
        // The project is stored too: without it, neither the live status/unlink watchers
        // nor reconciliation can cover a task linked this way.
        attemptedSessions.add(sessionId);
        const current = tasks.find((t) => t.id === task.id) ?? task;
        const updated = applyPatch(current, {
          sessionId,
          ...(sessionProjectId ? { projectId: sessionProjectId } : {}),
          status: current.status === 'backlog' ? 'todo' : current.status,
        });
        await saveTaskRetrying(host, updated);
        if (dismissedSessionIds.delete(sessionId)) {
          // Explicitly linking a dismissed session brings it back by choice.
          // If cleanup fails, retain the in-memory dismissal; the new task
          // link still prevents adoption, and a later delete will keep it out.
          try { await saveDismissedSessions(host, dismissedSessionIds); }
          catch { dismissedSessionIds.add(sessionId); }
        }
        setTasks(tasks.map((t) => (t.id === current.id ? updated : t)));
        render();
        closeDetail();
        openDetail(task.id);
      },
      onUnlinkSession: async () => {
        const patched = patchTask(tasks, task.id, { sessionId: null });
        if (!patched) return;
        await saveTask(host, patched.task);
        setTasks(patched.next);
        render();
        closeDetail();
        openDetail(task.id);
      },
      loadSessionsForProject: async (projectId) => {
        const result = await fetchSessions(host, projectId);
        return result.sessions.map((s) => ({ id: s.id, title: s.title, activity: s.activity }));
      },
      onStartAgent: async ({ projectId, title, description }) => {
        let result;
        // Paused for exactly this long: the host can report the session it is in the
        // middle of creating to this mount's own live orphan watcher before this very
        // call resolves with its id — before the code below gets a chance to claim it
        // as this task's own link, not a second, unrelated one. See `startingAgents`.
        startingAgents += 1;
        try {
          // The detail dialog starts agents from the project root only — the
          // SDK's `false` worktree, no branch or worktree to pass through.
          // The base-branch error rewrite the old "New branch" picker needed
          // (OpenChamber collapsing its real reason to a generic failure)
          // never fires for a root start. No `text` either: the description
          // is populated into the chat's composer after it opens (below),
          // nothing is sent until the user presses send.
          result = await host.startSession({
            providerId: EXTENSION_ID,
            id: task.id,
            title: sessionTitleForTask({ title, description }),
            url: taskUrl(task.id),
            projectId,
            worktree: false,
            // Not 'open': that asks the host to navigate as part of resolving this
            // very call, which could tear this page down before any of the code
            // below — claiming the session, saving the link — ever runs.
            // `host.openSession` below, called only once everything here is safely
            // saved, is this extension's one and only navigation trigger.
            navigation: 'preserve',
          });
        } finally {
          startingAgents -= 1;
        }
        if (result.sessionId === null) {
          throw new Error(`Could not start the agent (${result.failure}). Its worktree at ${result.directory} was kept so you can recover it by hand.`);
        }
        // A real session now exists. Claim it right away — the one-id-specific
        // guard that protects it from here on, now that the id is actually
        // known, same as `startingAgents` did for the window before it.
        attemptedSessions.add(result.sessionId);
        // Self-healing for whatever gap remains: if some other task already points at
        // this exact session — the race above, caught too late, or a second window —
        // that other task is a duplicate born of it, not a real second task. Removed,
        // not left to confuse the board, with its own title named so it's recognizable.
        const duplicate = tasks.find((t) => t.id !== task.id && t.sessionId === result.sessionId);
        if (duplicate) {
          void deleteTask(host, duplicate.id)
            .then(() => host.toast({ kind: 'info', message: `Removed a duplicate card for the same chat: "${duplicate.title}".` }))
            .catch(() => undefined);
        }
        const updated = applyPatch(task, {
          title,
          description,
          sessionId: result.sessionId,
          projectId,
          status: 'in_progress',
          worktree: resolveTaskWorktree(false, result),
        });
        await saveTaskRetrying(host, updated);
        // Awaited before navigating away — see the matching comment in `onOpenChat`.
        await persistOpenTask(null);
        // The duplicate (if any) is dropped from in-memory state here, not just
        // deleted from storage above — `tasks` was read before that delete settled.
        setTasks(tasks.filter((t) => t.id !== duplicate?.id).map((t) => (t.id === task.id ? updated : t)));
        render();
        // The explicit navigation, deliberately deferred until everything above is
        // safely saved — see the comment on `navigation: 'preserve'` above.
        try {
          await host.openSession(result.sessionId);
        } catch (error) {
          // The chat exists, is linked, and opens again from its card's
          // detail: tell plainly and stop. Populating a composer that was
          // never the new chat's would write the description into some
          // other chat.
          void host.toast({ kind: 'error', message: `Started the chat, but it could not be opened — ${describeHostError(error)}.` }).catch(() => undefined);
          closeDetail();
          return;
        }
        // The prompt: populate, never send — `prompt` with `send` omitted
        // replace-composes on the current session (the one just opened) with
        // the description on screen (else its title), waiting for the user's
        // own send. Issued before `closeDetail`, in the same task the open
        // resolved in — the tail order the rail mirror's working path keeps.
        // The write itself races the host's switch commit for the composer's
        // one pending-input slot, which is how the expanded panel could lose
        // the fill while the rail always won; `fillComposerAfterOpen` writes
        // now and once more once the switch has settled. A fill provably
        // gone says so; the text stays safe on the task either way.
        fillComposerAfterOpen(host, chatPromptForTask({ title, description }), {
          onLost: () => {
            void host.toast({ kind: 'info', message: `The chat was created but its composer wasn't filled — the description is still on the task "${title}".` }).catch(() => undefined);
          },
        });
        // Closed only after the fill is dispatched: the dialog teardown must
        // not precede the last write this flow makes from this surface.
        closeDetail();
      },
    });
  };

  /**
   * Deletions and archives usually happen in the sidebar while this board is
   * closed, where no live watcher is running — so link health is re-checked
   * freshly on every load, not only live. For each project holding linked
   * tasks, fetches the current sessions and worktrees once, and clears
   * every link that provably no longer resolves. Incomplete or failed
   * fetches clear nothing — same "unknown is not gone" rule the live
   * watchers follow.
   */
  const reconcileLinks = async () => {
    const byProject = new Map<string, Task[]>();
    for (const task of tasks) {
      if (!task.projectId) continue;
      if (!task.sessionId && !task.worktree) continue;
      const list = byProject.get(task.projectId) ?? [];
      list.push(task);
      byProject.set(task.projectId, list);
    }
    if (byProject.size === 0) return;
    const results = await Promise.allSettled([...byProject.keys()].map(async (projectId) => {
      const [sessions, worktrees] = await Promise.all([fetchSessions(host, projectId), fetchWorktrees(host, projectId)]);
      return { projectId, sessions, worktrees };
    }));
    if (disposed) return;
    let cleared = 0;
    let deleted = 0;
    for (const result of results) {
      if (disposed) return;
      if (result.status !== 'fulfilled') continue;
      const { projectId, sessions, worktrees } = result.value;
      // The full session list distinguishes archived sessions from deleted ones;
      // `complete` false means the list can't be trusted.
      const sessionsView: SessionsView = { state: sessions.complete ? 'ready' : 'error', coverage: [], sessions: sessions.allSessions };
      const worktreesView: WorktreesView = { state: worktrees.complete ? 'ready' : 'error', worktrees: worktrees.worktrees };
      for (const task of byProject.get(projectId) ?? []) {
        // Re-read from `tasks` — a live watcher may have unlinked this task while the fetches were in flight.
        const current = tasks.find((t) => t.id === task.id);
        if (!current || current.projectId !== projectId) continue;
        if (current.sessionId) {
          const sessionState = sessionLinkState(current.sessionId, null, sessionsView);
          if (sessionState === 'deleted') {
            if (deleteTaskForGoneSession(current.id, null)) deleted += 1;
          } else if (sessionState === 'archived') {
            if (clearTaskLink(current.id, { sessionId: null }, null)) cleared += 1;
          }
        }
        if (current.worktree && worktreeLinkState(current.worktree.directory, worktreesView) === 'gone') {
          if (clearTaskLink(current.id, { worktree: null }, null)) cleared += 1;
        }
      }
    }
    if (cleared > 0 || deleted > 0) {
      const parts = [];
      if (deleted > 0) parts.push(`deleted ${deleted} task${deleted === 1 ? '' : 's'}`);
      if (cleared > 0) parts.push(`cleared ${cleared} stale link${cleared === 1 ? '' : 's'}`);
      void host.toast({ kind: 'info', message: `${parts.join(' and ')} — the session or worktree behind ${parts.length === 1 && deleted > 0 ? 'it' : 'them'} no longer exists.` }).catch(() => undefined);
    }
  };

  const reload = async () => {
    reloadButton.classList.add('kb-spinning');
    try {
      const [{ tasks: loaded, failedKeys }, loadedPrefs, watermark, dismissed] = await Promise.all([
        loadTasks(host), loadPrefs(host), loadOrphanWatermark(host), loadDismissedSessions(host),
      ]);
      // A manual/initial reload is a clean slate for the retry guards above.
      attemptedSessions = new Set();
      lastAttemptedStatus = new Map();
      dismissedSessionIds = dismissed;
      if (watermark === null) {
        // First time this feature has ever run: nothing that already exists right now is "going forward".
        orphanWatermark = Date.now();
        void saveOrphanWatermark(host, orphanWatermark).catch(() => undefined);
      } else {
        orphanWatermark = watermark;
      }
      setTasks(loaded);
      // A fresh load is the truth: selection entries whose task no longer
      // exists (deleted elsewhere, or its record failed to load) drop out,
      // and an armed column trash never survives a reload.
      const loadedIds = new Set(loaded.map((task) => task.id));
      for (const id of selected) if (!loadedIds.has(id)) selected.delete(id);
      disarmEmpty();
      prefs = loadedPrefs;
      filter = { projectId: prefs.projectId };
      projectSelect.update({ value: filter.projectId, options: projectOptions() });
      if (failedKeys.length) showBanner('Some tasks could not be loaded', `${failedKeys.length} record(s) were skipped. Other tasks are safe; Refresh retries.`, 'warning');
      else clearBanner();
      render();
      // Stale links (a session or worktree deleted while this board was closed)
      // are cleared before the orphan watcher starts, so a session whose link
      // is about to be dropped can never also be re-adopted as a duplicate.
      await reconcileLinks();
      // Agent journal next, same reasoning: what lands here saves through the
      // same task records the adoption watcher reads, and any pending creates
      // are real cards the adoption guard must not mistake for orphans.
      await applyAgentPending();
      if (prefs.openTaskId && tasks.some((t) => t.id === prefs.openTaskId)) openDetail(prefs.openTaskId);
    } catch (error) { notify(error); }
    finally { reloadButton.classList.remove('kb-spinning'); }
  };

  let stopProjects: (() => void) | null = null;
  void watchProjects(host, (state) => {
    if (disposed) return;
    if (state.state === 'error') { showBanner('Projects unavailable', 'Showing tasks without live project data.', 'warning'); return; }
    projects = state.projects;
    projectSelect.update({ options: projectOptions() });
    render();
    // The first snapshot is what makes a mirror worth pushing (it carries the
    // per-task project name and directory an agent maps itself against) — the
    // tasks themselves may not have changed since the last debounced push.
    scheduleMirrorPush();
  }).then((stop) => { if (disposed) stop(); else stopProjects = stop; }, (error) => { if (!disposed) notify(error); });

  const spinner = mountSpinner(spinnerSlot, { label: 'Loading board…' });
  void reload().finally(() => {
    spinner.dispose(); spinnerSlot.hidden = true;
    // Wait for the first load so a session already linked to a persisted task is never mistaken for an orphan.
    if (!disposed) orphanWatcher = watchOrphanSessions(host, excludedSessionIds, (found) => adoptRunningSession(found.projectId, found.session, found.status));
  });

  return {
    dispose: () => {
      disposed = true;
      clearLooksDoneTick();
      if (mirrorTimer !== null) { clearTimeout(mirrorTimer); mirrorTimer = null; }
      if (agentPullTimer !== null) { clearTimeout(agentPullTimer); agentPullTimer = null; }
      stopAgentEvents();
      stopProjects?.();
      sessionSync.dispose();
      worktreeSync.dispose();
      orphanWatcher?.dispose();
      detail?.dispose();
      board.dispose();
      selectionMoveMenu.dispose();
      document.removeEventListener('keydown', onSelectionKeydown);
    },
  };
};
