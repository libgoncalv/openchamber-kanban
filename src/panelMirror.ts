import type { GuestProject, HostClient } from '@openchamber/sdk';
import { mountBadge } from '@openchamber/sdk/ui';
import { loadTasks, saveTask, saveTaskRetrying } from './store/taskStore.ts';
import { statusMove } from './store/taskOps.ts';
import { adoptOrphanSession } from './store/adoptOps.ts';
import { applyAgentJournal } from './store/agentApply.ts';
import { applyAutoDone, applyObservedRead } from './store/autoDoneOps.ts';
import { createTitlePromotion } from './host/titlePromotion.ts';
import { loadOrphanWatermark, saveOrphanWatermark } from './store/orphanWatermark.ts';
import { loadDismissedSessions } from './store/dismissedSessions.ts';
import { buildLinkPatch, buildStartSessionRequest, chatPromptForTask } from './domain/chatLink.ts';
import { ALL_PROJECTS, matchesFilter } from './domain/board.ts';
import { badgeForCounts, buildBoardView, countOpen, countUnseen } from './domain/boardView.ts';
import { applyPatch, STATUS_LABELS, newTaskId, type Task, type TaskStatus } from './domain/task.ts';
import { DEFAULT_SYNC_OPTIONS } from './domain/sync.ts';
import { createSessionSync } from './host/sessionSync.ts';
import { createAutoDoneSync } from './host/autoDoneSync.ts';
import { watchOrphanSessions } from './host/orphanSessions.ts';
import { pushMirror } from './host/agentChannel.ts';
import { describeHostError, projectForDirectory } from './host/workspace.ts';
import { fillComposerAfterOpen } from './host/promptFill.ts';
import { mountKanbanView } from './ui/kanbanView.ts';
import { injectStyles } from './ui/styles.ts';
import { el } from './ui/dom.ts';

export type MirrorHost = Pick<
  HostClient,
  'storage' | 'onProjects' | 'onSessions' | 'onDirectory' | 'onServiceEvent' | 'serviceRequest' | 'openSession' | 'startSession' | 'prompt' | 'toast'
>;

/**
 * The rail panel is a display mirror of the board, project-locked: the same
 * kanban view the full.screen page renders (`kanbanView` rail mode), showing
 * whichever project OpenChamber currently has open. It performs exactly two
 * deliberate actions, both explicit user clicks: the ✓ a row carries marks
 * the task Done, through the same kept-rank status move the ⋯ menu takes;
 * and the chat button beside it opens the card's linked chat — or, when the
 * card has none, starts one attached to the card (no first message, the user
 * writes it) and links it here before navigating. Its automatic writes are
 * the session adoption the page also runs (`store/adoptOps.ts`, its own
 * orphan watcher below): importing a running session with no task as a card
 * here, without the board ever opening — it is an import, never a regroup —
 * and the title promotion that follows it (`host/titlePromotion.ts`): a
 * card the adoption titled with a placeholder takes the session's
 * agent-generated name the moment the live map carries one. The agent
 * channel joined them (`store/agentApply.ts`): the mirror pulls and applies
 * the queued journal on the service's emit, on its idle pass, and once after
 * its first load — agent-queued tasks and wrap-up notes land while only the
 * rail is open; an import, never a regroup. It also pushes the mirror doc
 * (`host/agentChannel.ts`'s `pushMirror`) after the writes that changed its
 * list, so an agent reading `GET /agent/tasks` sees the board as it is, and
 * the service's `kanban-board-change` emit reaches it, so a write from any
 * board surface (a drag, the auto-done rule) re-reads storage within the
 * debounce instead of waiting for the low-cadence pass.
 * What the mirror does update by itself is what it shows: live agent state
 * per linked session, regrouped for display only — where a row sits marks
 * the move the board will persist the next time it opens.
 *
 * Mountable, not a script that runs on import: the rail entry mounts it once
 * for its frame's lifetime, and the adaptive frame entry (`src/frame.ts`)
 * mounts and disposes it as the panel width crosses the board threshold, so
 * every subscription it holds is released on dispose and nothing of an
 * unmounted mirror keeps ticking.
 */
export const mountKanbanMirror = (host: MirrorHost, root: Element, options?: { directory?: string | null }) => {
  injectStyles();
  root.replaceChildren();

  let disposed = false;
  let tasks: Task[] = [];
  let projects: GuestProject[] = [];
  /** OpenChamber's open project: seeded from the entry's `ready` context, kept current by `onDirectory`. `null` → show every task. */
  let currentDirectory: string | null = options?.directory ?? null;
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
    const visible = visibleTasksForProject(tasks, currentProject?.id ?? null);
    sessionSync.sync(visible);
    autoDoneSync.sync(visible);
    titlePromotion.sync(visible);
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
    onLiveChange: () => { if (everLoaded && !disposed) { autoDoneSync.evaluate(); titlePromotion.evaluate(); render(); } },
    onSnapshot: () => {
      // Storage has no change push: outside writes (the board saving a drag,
      // a move, an edit) arrive on the next session snapshot tick or on this
      // low-cadence pass.
      scheduleReload();
    },
  });

  /**
   * The page's own auto-done rule and its observed-read write, run here
   * through the same shared ops (`store/autoDoneOps.ts`): a Review card the
   * host reports as read elsewhere clears its marker, and a visited,
   * committed, quiet one lands Done — while only this rail is open, the
   * same conclusion the page draws when it is. The watcher's inputs are the
   * same two channels the board's are: this surface's visible tasks and
   * the shared live map (fed on every `applyTasks` and on every trusted
   * snapshot, plus the idle pass's reload), so nothing of the rule is a
   * board-only sweep anymore. The commit check is best-effort exactly as
   * on the page — the service may be unapproved or absent, a failed check
   * just waits behind the retry floor — and Done keeps its guard: the same
   * HEAD never fires the rule twice.
   */
  const autoDoneSync = createAutoDoneSync(
    host,
    () => sessionSync.live(),
    (projectId) => (projectId === null ? null : projects.find((p) => p.id === projectId)?.directory ?? null),
    {
      onAutoDone: (taskId, commitSha) => {
        void (async () => {
          const moved = await applyAutoDone(host, taskId, commitSha);
          if (!moved || disposed) return;
          applyTasks(tasks.map((t) => (t.id === taskId ? moved : t)));
          if (everLoaded) render();
          // This surface's write: the mirror doc goes up so agents read the
          // card's Done.
          scheduleMirrorPush();
        })().catch(() => undefined); // the watcher's retry floor spaces the next attempt; silent like the page's failed checks
      },
      onObservedRead: (taskId) => {
        void (async () => {
          const updated = await applyObservedRead(host, taskId);
          if (!updated || disposed) return;
          applyTasks(tasks.map((t) => (t.id === taskId ? updated : t)));
          if (everLoaded) render();
        })().catch(() => undefined);
      },
    },
  );

  /**
   * The page's title promotion, run here so a card adopted while only this
   * panel is open still takes its session's agent-generated name without the
   * board ever opening (see `host/titlePromotion.ts`). Scoped the way this
   * panel displays — the visible tasks only, the shares it could ever write.
   * The shared op (`store/titleOps.ts`) re-reads storage, so a rename
   * another surface saved a moment ago is never clobbered, and both surfaces
   * promoting the same card write the same title. Silent: the card simply
   * gains its name.
   */
  const titlePromotion = createTitlePromotion(
    host,
    () => sessionSync.live(),
    (projectId) => (projectId === null ? null : projects.find((p) => p.id === projectId)?.name ?? null),
    {
      onPromoted: (task) => {
        applyTasks(tasks.map((t) => (t.id === task.id ? task : t)));
        if (everLoaded) render();
        // This surface's write (the promotion was this mount's): the mirror
        // doc goes up so agents read the real name.
        scheduleMirrorPush();
      },
      onStale: (task) => {
        const shown = tasks.find((t) => t.id === task.id);
        if (!shown || shown.title === task.title) return;
        applyTasks(tasks.map((t) => (t.id === task.id ? task : t)));
        if (everLoaded) render();
      },
    },
  );

  // ---- Orphan adoption (the page's own, run here too) ----

  /** A deleted task's session stays out of automatic adoption, even after a reload. */
  let dismissedSessionIds = new Set<string>();
  const excludedSessionIds = () => new Set([
    ...dismissedSessionIds,
    ...tasks.flatMap((task) => (task.sessionId ? [task.sessionId] : [])),
  ]);
  /**
   * Every session id this mount has ever tried to adopt, success or failure.
   * A live session's `onSessions` snapshot fires continuously while it runs,
   * so this must be a permanent-for-this-mount guard, not cleared on failure
   * — otherwise a single persistent storage error turns into a
   * retry-and-error-toast storm on every snapshot tick.
   */
  const attemptedSessions = new Set<string>();
  /**
   * How many `startSession` calls (the mirror's chat starts) are currently in
   * flight. While this is above zero, adoption is paused: the host can report
   * the new session it is in the middle of creating to this mount's own
   * orphan watcher before that promise resolves, and the pause is what keeps
   * that session off the adopter until the link below claims it. The same
   * rule the page keeps around its Start Agent.
   */
  let startingAgents = 0;
  /**
   * The persisted "going forward" cutoff (`store/orphanWatermark.ts`), loaded
   * with the first task load and first-run initialized there if this panel is
   * the feature's first surface ever — `Infinity` until then, so nothing is
   * adopted on a race before the real value is known.
   */
  let orphanWatermark = Infinity;
  /** Started only after the first load; stopped with the mirror's dispose. */
  let orphanWatcher: { dispose: () => void } | null = null;

  /**
   * The page's adoption, run here so a session that comes alive while only
   * this narrow panel is open gets its card without a board ever being
   * opened. Scoped the way this panel displays: the locked project only —
   * every registered project in show-all mode, exactly the cards this view
   * could show, so the mirror never writes a board it cannot display. The
   * shared write (`store/adoptOps.ts`) re-reads storage, so a session
   * another surface adopted moments ago returns `null` here, and a twin born
   * inside the same instant is converged away by that op's id tie-break; the
   * loser stays silent, the winner's toast being the one that tells the
   * story.
   */
  const adoptRunningSession = (projectId: string, session: { id: string; title: string; createdAt: number }, status: TaskStatus) => {
    if (currentProject && projectId !== currentProject.id) return;
    if (disposed || startingAgents > 0 || attemptedSessions.has(session.id) || excludedSessionIds().has(session.id)) return;
    if (session.createdAt < orphanWatermark) return;
    attemptedSessions.add(session.id);
    void (async () => {
      try {
        const result = await adoptOrphanSession(host, {
          projectId,
          session,
          status,
          projectName: projects.find((p) => p.id === projectId)?.name ?? null,
        });
        if (result === null || disposed) return;
        applyTasks(tasks.filter((t) => t.id !== result.task.id).concat(result.task));
        if (everLoaded) render();
        // This surface's import write: the mirror doc goes up so agents see
        // the card they may be about to look for.
        scheduleMirrorPush();
        if (result.adopted) {
          void host.toast({ kind: 'info', message: `Added "${result.task.title}" to the board (${STATUS_LABELS[status]}) — found a session running with no task.` }).catch(() => undefined);
        }
      } catch (error) {
        // Reported once: the per-mount guard above keeps the
        // continuously-firing snapshots from echoing a persistent failure.
        void host.toast({ kind: 'error', message: `Could not add the task for a found session — ${describeHostError(error)}` }).catch(() => undefined);
      }
    })();
  };

  const resolveCurrentProject = () => {
    currentProject = projectForDirectory(projects, currentDirectory);
  };

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
      // attached to it — `startSession` with no `text` — open it, and fill
      // its composer with the card's description (the steps at the bottom).
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
      // Adoption paused while this mount's own start is in flight — the host
      // can publish the new session to this watcher before the request
      // resolves, and without the pause that session would be adopted as a
      // second task before the link below claims it. Claimed inside the try
      // (below), before the pause lifts: no instant is left open between
      // the two.
      startingAgents += 1;
      let result;
      try {
        result = await host.startSession(request);
        if (result.sessionId !== null) attemptedSessions.add(result.sessionId);
      } catch (error) {
        void host.toast({ kind: 'error', message: `Could not start the chat for "${current.title}" — ${describeHostError(error)}` }).catch(() => undefined);
        return;
      } finally {
        startingAgents -= 1;
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
      try {
        await host.openSession(result.sessionId);
      } catch (error) {
        // The chat exists, is linked, and opens again from this card's
        // button: stop here. Populating a composer that was never the new
        // chat's would write the description into some other chat.
        void host.toast({ kind: 'error', message: `Started the chat, but it could not be opened — ${describeHostError(error)}.` }).catch(() => undefined);
        return;
      }
      // The prompt: populate, never send — `prompt` with `send` omitted
      // replace-composes on the current session (the one just opened) with
      // the card's description, else its title, waiting for the user's own
      // send. This is the tail order that always won at rail width: the
      // write goes out in the same task the open resolved in, nothing
      // between. Behind it, `fillComposerAfterOpen` repeats the write once
      // the host's switch commit has settled — the race documented on the
      // module — so the same path stays right as the frame's surfaces grow.
      fillComposerAfterOpen(host, chatPromptForTask(current), {
        onLost: () => {
          void host.toast({ kind: 'info', message: `The chat was created but its composer wasn't filled — the description is still on the card "${current.title}".` }).catch(() => undefined);
        },
      });
    },
  });

  const foot = el('div', 'kb-rail-foot');
  foot.append(el('p', 'kb-muted', 'Two quick actions live here — the ✓ marks a task Done, and the chat button opens the linked chat of a card; on a card with none it shows a plain plus and starts one attached to it. Everything else (open, move, edit, delete) is the full board, one click away: pull this panel wider, or the Extension pages menu.'));
  wrap.append(foot);
  root.append(wrap);

  badge = mountBadge(badgeSlot, { label: '', tone: 'neutral' });

  // ---- The agent channel, the mirror's side ----
  // The board's channel, shared ops and all (`store/agentApply.ts`): the
  // journal's queue applies whenever this surface is open — on the service's
  // emit, on the low-cadence pass below, and once right after the first
  // load — so agent-queued tasks and wrap-up notes land with no board ever
  // opened; an import, never a regroup. This surface's presentations: the
  // toast when something lands (the same "From an agent" wording the board
  // uses), a quiet standing line when entries keep failing instead of a
  // toast per retried pass, and the mirror doc push below after its own
  // writes landed.
  let channelBusy = false;
  const channelPass = async () => {
    if (disposed || channelBusy) return;
    channelBusy = true;
    try {
      const result = await applyAgentJournal(host, { projects, newId: newTaskId, now: Date.now() });
      if (result === null) {
        // The service is down or the journal empty — the storage poll below
        // still runs either way: this pass is the idle refresh too.
      } else {
        // A landing pass says so in a toast (the board's own wording), then
        // pushes the mirror doc it just changed. Persistent failures draw a
        // quiet standing line under the header instead of a toast per retried
        // pass; a failure-free pass clears it.
        if (result.applied) {
          const parts: string[] = [];
          if (result.created.length === 1) parts.push(`added "${result.created[0]!.task.title}" (${STATUS_LABELS[result.created[0]!.task.status]})`);
          else if (result.created.length > 1) parts.push(`added ${result.created.length} tasks`);
          if (result.noted.length === 1) parts.push(`an agent left a note on "${result.noted[0]}"`);
          else if (result.noted.length > 1) parts.push(`agent notes landed on ${result.noted.length} tasks`);
          if (parts.length > 0) {
            void host.toast({ kind: 'info', message: `From an agent: ${parts.join(', ')}.` }).catch(() => undefined);
          }
          scheduleMirrorPush();
        }
        if (result.failures > 0) {
          statusEl.textContent = result.failures === 1
            ? '1 agent change could not be applied — it stays queued and retries automatically.'
            : `${result.failures} agent changes could not be applied — they stay queued and retry automatically.`;
          statusEl.hidden = false;
        } else {
          statusEl.hidden = true;
        }
      }
    } finally {
      channelBusy = false;
    }
    // Storage truth after every pass — this pass's own writes, entries another
    // surface already landed, a board write racing the same emit — one reload
    // covers the whole outcome.
    await reload();
  };
  let channelTimer: number | undefined;
  const scheduleChannelWork = () => {
    if (channelTimer !== undefined || disposed) return;
    channelTimer = window.setTimeout(() => { channelTimer = undefined; void channelPass(); }, 300);
  };
  const stopServiceEvents = host.onServiceEvent((event) => {
    // The service's queue got an agent write — or a board surface pushed the
    // mirror right after writing (its `kanban-board-change`): either way this
    // surface drains what is queued and re-reads storage within the debounce,
    // instead of waiting for the low-cadence pass.
    if (event.topic !== 'kanban-agent-change' && event.topic !== 'kanban-board-change') return;
    scheduleChannelWork();
  });
  // Storage has no change push outside the session snapshots and this
  // channel: the pass is both the journal pull and the idle refresh, so a
  // display-only surface never goes stale either.
  intervalId = window.setInterval(() => { void channelPass(); }, 30_000);

  // ---- The mirror doc's push ----
  // Same debounced, projects-guarded push the board runs (`pushMirrorNow`
  // there): after a write this surface made land (a journal apply, an
  // adoption, a title promotion) the doc goes up, so agents reading
  // `GET /agent/tasks` see the board as it is while only the rail is open.
  let mirrorTimer: number | undefined;
  let mirrorInFlight = false;
  const scheduleMirrorPush = () => {
    if (mirrorTimer !== undefined || disposed) return;
    mirrorTimer = window.setTimeout(() => {
      mirrorTimer = undefined;
      if (disposed) return;
      if (mirrorInFlight) { scheduleMirrorPush(); return; }
      if (projects.length === 0) return;
      mirrorInFlight = true;
      void pushMirror(host, tasks, projects).finally(() => { mirrorInFlight = false; });
    }, 500);
  };

  let stopProjects: (() => void) | null = null;
  void host.onProjects((snapshot) => {
    if (disposed || snapshot.state !== 'ready') return;
    projects = snapshot.projects;
    resolveCurrentProject();
    applyTasks(tasks);
    if (everLoaded) render();
    // The first snapshot is what makes a mirror worth pushing (it carries the
    // per-task project name and directory an agent maps itself against) — the
    // tasks themselves may not have changed since the last debounced push.
    scheduleMirrorPush();
  }).then((stop) => { if (disposed) stop(); else stopProjects = stop; }, () => undefined);

  // `onDirectory` replays the freshest value at subscribe time, so a mount
  // swapped in by the frame re-seeds itself even when the ready context that
  // started it predates the currently open chat.
  const stopDirectory = host.onDirectory((directory) => {
    if (disposed) return;
    currentDirectory = directory;
    resolveCurrentProject();
    applyTasks(tasks);
    if (everLoaded) render();
  });

  const start = async () => {
    try {
      const [loaded, watermark, dismissed] = await Promise.all([loadTasks(host), loadOrphanWatermark(host), loadDismissedSessions(host)]);
      if (disposed) return;
      applyTasks(loaded.tasks);
      dismissedSessionIds = dismissed;
      if (watermark === null) {
        // First time this feature has ever run, from any surface: nothing
        // that already exists right now is "going forward".
        orphanWatermark = Date.now();
        void saveOrphanWatermark(host, orphanWatermark).catch(() => undefined);
      } else {
        orphanWatermark = watermark;
      }
      everLoaded = true;
      statusEl.hidden = true;
      render();
      // Same ordering the page keeps: the watcher starts only after the first
      // load has landed, so a session already linked to a persisted task is
      // never mistaken for an orphan. Disposed with the mirror, so the
      // frame's other mode (the board, mounting after a swap) always has
      // exactly one live adopter per open surface.
      orphanWatcher = watchOrphanSessions(host, excludedSessionIds, (found) => adoptRunningSession(found.projectId, found.session, found.status));
      // The first drain, right after the first load: entries the journal has
      // been holding since the last surface closed land now, with nothing
      // more open than this rail.
      void channelPass();
    } catch (error) {
      statusEl.textContent = `Could not load tasks — ${describeHostError(error)}`;
    }
  };

  const reload = async () => {
    if (disposed || reloading) return;
    reloading = true;
    try {
      const [{ tasks: loaded }, dismissed] = await Promise.all([loadTasks(host), loadDismissedSessions(host)]);
      if (disposed) return;
      // The dismissal list is storage-truth, re-read like the tasks: a task
      // deleted by the board (the mirror deletes nothing) must keep its
      // session out of this surface's adoption afterwards.
      dismissedSessionIds = dismissed;
      applyTasks(loaded);
      if (!everLoaded) { everLoaded = true; statusEl.hidden = true; }
      render();
    } catch (error) {
      // Transient storage failures keep the last view on screen; only a first
      // load that never succeeded has nothing better to show than the reason.
      if (!everLoaded) {
        statusEl.textContent = `Could not load tasks — ${describeHostError(error)}`;
        statusEl.hidden = false;
      }
    } finally {
      reloading = false;
    }
  };

  const scheduleReload = () => {
    if (reloadTimer !== undefined || disposed) return;
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

  // The first load runs after every closure is defined: the original module
  // launched it from an async `ready` callback, and this factory runs it at
  // the end of its own synchronous build — `start` must exist by then.
  void start();

  return {
    dispose: () => {
      if (disposed) return;
      disposed = true;
      if (intervalId !== undefined) window.clearInterval(intervalId);
      if (reloadTimer !== undefined) window.clearTimeout(reloadTimer);
      if (channelTimer !== undefined) window.clearTimeout(channelTimer);
      if (mirrorTimer !== undefined) window.clearTimeout(mirrorTimer);
      stopServiceEvents();
      stopProjects?.();
      stopDirectory();
      orphanWatcher?.dispose();
      sessionSync.dispose();
      autoDoneSync.dispose();
      titlePromotion.dispose();
      board?.dispose();
    },
  };
};
