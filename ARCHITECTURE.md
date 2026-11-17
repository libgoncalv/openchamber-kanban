# Architecture

A local-first Kanban board extension for OpenChamber, built with the official `@openchamber/sdk`. All task and preference data lives in `host.storage` on the connected OpenChamber server — nothing is sent anywhere else, and no capability beyond what's listed below is used.

Requires OpenChamber `>=1.24.0` — the Extensions SDK (`Settings → Extensions`, panels, pages, `host.storage`) doesn't exist in earlier versions. The `microphone` capability additionally needs an OpenChamber that ships SDK 2.7.x (ready.features.microphone); on older hosts the mic button simply never renders.

## Manifest and capabilities

```jsonc
{
  "openchamber": {
    "apiVersion": 1,
    "engines": { "openchamber": ">=1.24.0" },
    "contributes": {
      "panel": { "id": "kanban-board", "name": "Kanban", "icon": "task", "entry": "panel/index.html" },
      "page": { "entry": "panel/page.html", "title": "Kanban board" },
      "capabilities": ["sessions", "prompt", "microphone"],
      "service": { "entry": "service/main.js", "runtime": "host", "permissions": { "exec": ["git"] } }
    }
  }
}
```

| Capability | Used for |
|---|---|
| `sessions` | `listProjects`/`onProjects`, `listSessions`/`onSessions`, `listWorktrees`/`onWorktrees`, `startSession`, `openSession` — reading project/session/worktree state and creating or opening sessions. |
| `prompt` | Permits `startSession` to send its `text` field as the agent's first message. The returned `sent` value is checked because session creation can succeed without the message being delivered. |
| `microphone` | Voice dictation for the description field (`host.openMicrophone`), see "Voice dictation" below. Audio is processed on this machine only. |
| `service` (auto-added by declaring `contributes.service`) | The local git-branch-reading and dictation service, see below. |

**Capability approval is all-or-nothing.** The host's own grant endpoint (`PUT /api/guests/:id/capabilities`) accepts only the full requested list or `[]` — there is no partial grant. Installing this extension means accepting all four capabilities together; there is no way to get the Kanban board without also being asked about the microphone and the local service.

## File structure

```
openchamber-kanban/
  package.json
  src/
    domain/
      task.ts          # Task type, validation, createTask/applyPatch/parseTask — pure, no host
      board.ts          # filters, rank math (rankAtEnd/planDrop) — pure
      sync.ts            # agent activity → task status mapping — pure
      boardView.ts         # the one view model both surfaces render: display-only agent regrouping, unseen flags, badge counts — pure
      worktree.ts         # worktree/branch picker logic, local service response parsing — pure
      unlink.ts            # link health: whether a linked session/worktree provably still exists — pure
      autoTask.ts          # orphan-session eligibility + initial status + title — pure
    store/
      taskStore.ts      # one host.storage key per task: task:<id>
      taskOps.ts          # the write ops the full-screen page runs: moves (planMove/saveMove/statusMove), bulk moves (planStatusMoves in domain/board.ts), createBacklogTask, patches, deletes (single + batch, the dismissal-before-delete protocol) — pure + storage only
      prefs.ts            # board filters + last-open task: host.storage key "prefs"
      orphanWatermark.ts    # "going forward" cutoff timestamp: host.storage key "orphan-watermark"
    host/
      workspace.ts      # host.listProjects/onProjects/onSessions/onWorktrees/openSession wrappers
      sessionSync.ts      # live onSessions watcher → status sync (page) + the live map both surfaces display from
      worktreeSync.ts       # live onWorktrees watcher → worktree-deleted unlinks
      orphanSessions.ts     # live onProjects+onSessions watcher → sessions with no task yet
      branchService.ts        # calls the local git-branch service; null on any failure
      dictation.ts            # mic capture state machine + chunked /transcribe client
    ui/
      dnd.ts            # drop-target math — pure, no DOM
      styles.ts           # CSS using the host's --oc-* theme tokens
      dom.ts                # element() helper
      pill.ts             # the agent-state pill (cards, rail rows, dialog head): tint from the kit's tone variables, glyph per state
      speech.ts               # resample/Int16/base64 chunk helpers — pure, no DOM
      kanbanView.ts          # the one renderer both surfaces mount (page = columns, rail = sections): every interactive affordance is conditional on the handler the surface supplies
      board.ts               # the page: toolbar + selection bar + column-empty arming + detail dialog + the agent-status writer, adoption, reconciliation — around kanbanView
      detail.ts               # task detail dialog (page full-width, rail compact without Start Agent)
      dictationPanel.ts         # dictation controls used by the detail dialog
    page.ts             # full-screen page entry (contributes.page)
    panel.ts              # rail panel entry: a display mirror, project-locked (kanbanView rail mode; display data + the panel's one write, onMarkDone)
    service/
      main.ts           # bootstrap: env, server, git + real recognizer (Node, not browser)
      server.ts         # the loopback HTTP surface: auth, body read, route dispatch
      transcribe.ts       # dictation routes: begin/append/finish/cancel + one-shot, clip store
      recognizer.ts       # lazy sherpa-onnx-node singleton for the local Parakeet model
  panel/
    index.html, page.html   # HTML shells
    main.js, page.js          # esbuild IIFE output
  service/
    main.js             # esbuild Node/ESM output of src/service/main.ts (sherpa-onnx-node stays external)
  test/                 # node:test unit tests for domain/, store/, host/, plus the service HTTP routes
  scripts/build.mjs      # esbuild: browser IIFE for panel/page, Node/ESM for the service
```

Layering: `domain/` has no SDK or DOM imports — pure functions, fully unit-tested. `store/` and `host/` depend only on narrow `Pick<HostClient, …>` slices, tested with in-memory fakes. `ui/` is the only layer that touches the DOM.

## Task data model

```ts
type Task = {
  schemaVersion: 1;
  id: string;                 // t_<base36 time><6 random chars>
  title: string;
  description: string;        // first message requested for the agent; delivery is checked via result.sent
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
  rank: number;                // fractional, for drag-and-drop ordering within a column
  projectId: string | null;
  sourceBranch: string | null;  // unused by current UI; kept for backward compatibility with old records
  worktree: { directory: string; branch: string | null } | null;
  sessionId: string | null;
  createdAt: number;
  updatedAt: number;
  needsAttentionSince: number | null;  // set when the Review marker/sort should treat this as unseen
};
```

Stored one task per `host.storage` key (`task:<id>`), so editing one task can never corrupt another, and a malformed record is reported and skipped rather than blocking the rest of the board. Board filters, the currently-open task, and the "going forward" orphan-adoption cutoff are each a separate key (`prefs`, `orphan-watermark`).

## The board

Full-screen page (`contributes.page`) with a project filter and five columns (Backlog, To Do, In Progress, Review, Done). The rail panel is a **display-only mirror** of the same kanban view, locked to the open project — see "The rail panel (display-only mirror, project-locked)" below; everything interactive lives on the page.

- **One view, two surfaces.** The page and the rail panel mount the same renderer (`src/ui/kanbanView.ts`) and render the same pure view model (`src/domain/boardView.ts`, `buildBoardView`). Only the layout differs because the width does: columns of cards versus stacked sections. Every interactive affordance in the renderer is conditional on the handler the surface supplies — the page passes the full set (tap, ⋯ menu, drag, fold, selection, column-empty); the rail passes only `onMarkDone`, its single deliberate write. The writes of both surfaces run through one shared module (`src/store/taskOps.ts`), so the ordering the rail displays can never disagree with the orderings the page writes.
- **Add task** is a single **+** icon button in the toolbar (the toolbar's other icon is the reload — it spins while a reload runs, and every reload, whatever triggered it, keeps that visible). A click creates a real, persisted task immediately (title `"New task"`, appended to Backlog via the shared `createBacklogTask`) and opens its detail popup for editing — no separate title field in the toolbar.
- **Card details.** Every item — card or rail row — shows the same body: title, project name, and the agent **pill** (`src/ui/pill.ts`: the same tint as the host's own toned badges — the kit resolves its `data-tone` to the app's real status colors — plus a glyph: ▷spinner running, ? needs your answer, shield needs permission, ! failed, ✓ finished; a muted dot for "idle"/"chat linked") — the pill is the one status signal an item wears, so an agent-driven move shows as the row's new column or section, and the `✓ looks done` chip appears once the session has been quiet (see the looks-done affordance below) — and small icon buttons where handlers exist: on the page, a success-tinted ✓ beside the ⋯ menu (the mark-Done shortcut) and the ⋯ menu itself (Move to every other column, Edit task, Delete task); on the rail, the mark-done ✓ sits at every non-done row's right edge — always visible, tinted with the app's info tone (`data-info`, riding the `--oc-info-*` tokens `applyHostReady` paints on the frame root) — and an attention row's Open-chat idiom renders where a surface supplies it.
- **Drag-and-drop** (page) uses fractional ranks (`planDrop`, `rankAtEnd` through the shared `planMove`/`saveMove` ops), so moving a card only ever rewrites that card and, rarely, a few neighbors whose gap became too small — never the whole column. Keyboard: page items are focusable; Enter/Space activates them.
- **Multi-select** (page) is transient board-page state — a `Set<string>` the page owns; the renderer only asks (`onToggleSelect`/`isSelected`, `data-selected` on the card). One checkbox sits left of every card's title, always visible (larger under a finger), and Ctrl/⌘-click on a card body toggles too. A selection bar appears under the toolbar while anything is selected: the count, a **Move to** menu, **Mark Done**, and a **Delete** that needs its second, confirming press. Every action runs through the shared ops — bulk move through `planStatusMoves` (in `domain/board.ts`): the selection moves as a group appended at the target column's end in the board's own rank order — not Review's urgency display order — with attention markers cleared, tasks already in the target left in rank (only a stale marker clears), and no rebalancing anywhere. Bulk delete and column emptying share `deleteTasksWithDismissal`: all fresh linked-session dismissals saved **once** before the first delete, deletes independent per storage key (one failure keeps only its own task), failed tasks' sessions un-dismissed again so a task that was not deleted keeps its session adoption-eligible. The selection survives re-renders and filter changes, is pruned on reload, and clears on Escape (waiting a beat while a detail dialog is open, which owns Escape first).
- **Column cleanup.** Every page column head carries a small trash icon beside the count pill. First press arms it — destructive tint, "Click again to empty <column>" — the second press deletes exactly the tasks currently shown in that column (the filter-respecting view: "All projects" then spans projects, which the armed confirm makes explicit), through the same `deleteTasksWithDismissal` as above. The arming is the page's state with a ~3.5 s timeout so a stray tap never leaves a column primed for deletion, and an empty column never arms at all. The rail renders none of this: it passes no selection handlers, and its single-write design is untouched.
- **Column colors.** One theme token per column, keyed off the `data-status` the renderer already puts on both surfaces (the rail's `renderSection` sets it in parity with the page's `renderColumn`; `--kb-accent` in `styles.ts`): Backlog muted, To Do the info blue held back, In Progress the same blue at full strength, Review warning, Done success. The two blues are one family at two strengths — planned vs working — split by a faded strip, a dimmer title and a lighter count tint on To Do. The theme's brand `--oc-primary` is **deliberately out of the column palette**: in real host themes it can sit anywhere on the wheel (checked against one where it lands right beside the amber), and a column must not depend on it to stay distinct. The accent paints exactly three head pieces — a 3px strip above the head, the title, the count pill — and stops there: column bodies stay neutral so the attention border, the agent pills, and the drag-over outline keep sole ownership of their hues in every column. The attention count (`data-attn`) overrides the tint with the warning color wherever the flag fires; in Review that is a shade match, not a conflict. No foreign colors: everything rides the `--oc-*` tokens `applyHostReady` paints, so both themes come free.

- **Badges.** The badge next to the toolbar shows the view's open count with unseen flags ("N open · M unseen", warning tone while unseen rows wait) — the same pill the rail header shows. The Kanban rail icon deliberately carries **no number**: `host.setBadge` is not called from any surface; the panel just displays, and a counting icon would pretend otherwise.
- **The Review column sorts by urgency**, not rank: whichever task most recently needs attention leads; already-seen tasks sink below and keep normal rank order among themselves. Every other column stays rank-ordered.

### The "needs attention" marker

A task that lands in Review through something other than your own action — the live agent-status sync or auto-adopting a running session — gets `needsAttentionSince` set to that moment, shown as a warning-colored left border on its card. It's cleared the moment you open the task (its chat, or its detail popup) or drag it anywhere yourself. A status change you make deliberately (dragging, or the detail popup's own status strip) never sets the marker — only the two automatic paths do.

### The rail panel (display-only mirror, project-locked)

The rail panel (`src/panel.ts`) is the board's view rendered for a narrow rail and stripped of every affordance but one: it mounts the same renderer (`src/ui/kanbanView.ts` in `rail` mode) and the same pure view model (`buildBoardView` in `src/domain/boardView.ts`) with only `onMarkDone` beyond display data — no tap, no ⋯ menu, no dragging, no fold toggling, no quick-add. The renderer draws rows plain and non-focusable except for the mark-done ✓: every non-done row carries one at its right edge, always visible and tinted with the app's info tone (`data-info` on the kit-independent `.kb-iconbtn` idiom), and Done rows carry none because they need none. The panel writes exactly one thing — a deliberate Done, through the same pure `statusMove` op the ⋯ menu's Move-to takes (kept rank, attention marker cleared, nothing re-saved when it changes nothing) — and it does not number the Kanban rail icon either (`host.setBadge` is unused everywhere): the icon is just a way in to the same view.

- **Display-only agent sync.** The panel applies the board's own pure mapping (`statusForSession`, via the view model) to live session state and regroups rows accordingly, so a task the agent finished while the board was closed already sits under Review — the row's position carries the move; no `→` chip renders anywhere — and shows the looks-done `✓ looks done` chip once the session has been quiet through the window. Its agent mapping never writes the status it implies — the page stays the only writer of agent-driven status changes (its marker setting, `lastAttemptedStatus` retry guard, and save-retry logic remain in one place), and the stored status is exactly what the board will persist the next time it opens. The panel's one exception is the deliberate Done (see below), kept inside the same ordering: the same `statusMove` op, saved through the same store helper. Done is never moved, same invariant as the page. The panel has no tick scheduling of its own; its 30 s idle interval pass re-renders soon after any quiet-window crossing the snapshots don't cover.
- **Unseen flags.** A stored `needsAttentionSince` marker, or an agent's display-only move into Review (no board was open to persist the marker), flags the row — warning border on the item, a summary line above the sections ("N tasks need your review"), and a warning-tone badge next to the view's open count. Rows under Done are excluded from that count: Done is deliberate work, not open attention. Review sections order unseen rows by the stored marker, with the session's own last-change time standing in for a marker that could never be persisted.
- **Project scope.** The panel shows only the tasks of the project OpenChamber currently has open: `ready.directory` seeds it and `host.onDirectory` keeps it current, with `projectForDirectory` mapping a directory (nested paths included) to the registered project. With no open directory — or one matching no registered project — every task shows, with the project named per row. The one-line "Project: …" scope indicator under the header names the focused project and per-row names appear only in that show-all mode. This is the whole difference from the page: on the page the scope is a filter you can change, on the panel it is locked to the open project.
- **Live data.** One `onProjects` subscription plus one `onSessions` subscription per *visible* project holding linked sessions (same per-project pattern as `sessionSync.ts`, inside the frame's subscription cap — `createSessionSync` is the shared live provider; the panel passes no `onStatusChange`). A trusted (`ready`) snapshot rebuilds that project's entries in the shared live map; `loading` keeps the last known state; an `error` drops them so rows fall back to their stored status — unknown is never displayed as new. A project leaving the visible set also has its live entries dropped, so an unsubscribed project's stale activity can never display as if it were live when it comes back into view. Every snapshot also schedules one debounced `loadTasks` read (500 ms), because storage has no change push and the board page may have saved edits meanwhile; a 30 s interval covers the idle case. A display-only surface has no Refresh button — it keeps itself fresh.
- **One write, by design.** The panel performs exactly one write — marking a task Done with the row's ✓ (the user's own click, at their own pace; nothing auto-marks). Everything else — Open Chat, Edit, Move between columns, Delete — is a deliberate action that lives on the full board, where the dialog width for editing exists. The panel's answer to "do something with this task" is the same line under the sections as before: the full board is one menu away.

## Agent-status sync

Implemented in `src/domain/sync.ts` (`statusForSession`, pure) and watched live by `src/host/sessionSync.ts` (`createSessionSync`, one `host.onSessions` subscription per project among currently-linked tasks):

| Session activity / outcome | Task moves to |
|---|---|
| `running`, `retrying` | In Progress (from any status except Done) |
| `waiting-question` | Review |
| `waiting-permission` | Review |
| `idle` + outcome `completed` | Review |
| `idle` + outcome `failed` | Review |
| anything else | no change |

A task marked **Done is never moved** by this — only your own "Mark Done" ever sets it. A save failure here doesn't retry on every subsequent snapshot (a live session's `onSessions` snapshot fires continuously while it runs): `lastAttemptedStatus` tracks the status this mount last attempted for a task, and only a genuinely different target status is retried, cleared on `Refresh`/reopen.

### The looks-done affordance (the ✓)

OpenChamber's own In-work runtime answers "when does finished work look done?" with a classifier-backed **hint after a measured quiet window — never a write** ("the user closes; this runtime never does"). The board ports the pattern onto signals the guest SDK already receives (`activity`/`outcome`/`updatedAt`; no extension-reachable classifier and no answer text exist in the SDK, so its precision is traded for a two-shot design: Review is an intermediate state and Done stays a click). Pure derivation in `src/domain/boardView.ts` (`looksDoneFor`, `looksDoneTooltip`, `nextLooksDoneTickAt`, `LOOKS_DONE_QUIET_MS` = 10 minutes, the number OpenChamber measured for the same hint), rendered by `kanbanView`:

- A linked session `idle` + outcome `completed` while the **stored** status is `review` and the session has been quiet for the window clocked from `needsAttentionSince` (or the session's own `updatedAt` when no marker exists) shows the state: **hint** while the task is unseen — the success-tinted ✓ beside the ⋯ menu, always visible; **quiet** once the task was seen — the same ✓ muted, revealed on hover/focus like the ⋯ menu (always visible under a finger, which has no hover). The rail shows either as the same display-only `✓ looks done` chip.
- Any activity change (`running`, waiting, `failed`) voids the state by itself — a new turn re-runs the clock through the same derivation. A task at any status other than stored `review` shows nothing, and `done` of course never does.
- The tooltip names the quiet time ("Looks done · quiet 14m — click to mark Done") while it is still short: the count drops after an hour, both in the label and in the timer that keeps it fresh — `nextLooksDoneTickAt` returns the earliest time-based change (window crossing or next tooltip minute) and the page's `scheduleLooksDoneTick` re-renders on exactly those instants, its only time-driven render. Everything else arrives through snapshots and saves.
- The ✓ click is the user's own Done: it routes through the ⋯ menu's Move-to path (`statusMove` to `done` — kept rank, marker cleared, shared save/rollback). The rail passes no handler and so cannot write.

## Automatic unlinking

A task's links must not outlive what they point at. When a session is deleted, the linked task is deleted automatically. When a session is archived, or a worktree is deleted (all from OpenChamber's sidebar), the corresponding link is cleared from the task automatically — `sessionId` for a session, `worktree` for a worktree. The task itself is kept for archive/worktree cases, with its title, column, and description untouched; it simply becomes a plain unstarted card again, so **Start Agent** or **Link an existing session** can be used on it fresh. The status is deliberately left alone too — moving or archiving a card's session is not a status change.

Two mechanisms cover it, because a page-type extension only runs while it is the selected view:

- **Live** — `src/host/sessionSync.ts` reports a deleted or archived session on its existing `onSessions` subscription (no extra subscription); `src/host/worktreeSync.ts` does the same for worktrees via one `onWorktrees` subscription per project holding worktree-linked tasks. `src/domain/unlink.ts` (`sessionLinkState`, `worktreeLinkState`) decides: an archived session (`archivedAt`) is archived; an absent one is deleted only when the snapshot finished loading (`state: 'ready'`) and, for the directory the session was last seen in, the per-directory `coverage` finished too. Anything less is `unknown`, and **unknown never deletes** — an incomplete list is not a disappearance, and a false "gone" would lose the task permanently.
- **On every load** — `reconcileLinks` in `src/ui/board.ts` runs at the end of every `reload()`, before the orphan watcher starts: for each project holding linked tasks it fetches the current sessions and worktrees once (`fetchSessions`, which returns both active and full top-level session lists, and `fetchWorktrees`) and deletes tasks or clears links that provably no longer resolve. This is what catches the common case — deleting or archiving in the sidebar while the board is closed, where no live watcher was running. It runs before orphan adoption starts so a session whose stale task is being deleted can never also be re-adopted as a duplicate task.

Unlinking shows a toast naming the task. On a load-time pass it is one summary toast instead of one per task. A save failure falls back to a full reload, which re-loads the still-linked task and lets the next pass retry.

## Auto-adopting a session with no task

A session with no task pointed at it, created at or after a persisted watermark timestamp, becomes a new task automatically — In Progress while running, Review once it needs attention (question, permission prompt, finished, or failed) — using the same `statusForSession`-derived mapping (`initialStatusForNewSession` in `src/domain/autoTask.ts`), linked to that session, titled from the session's own title (or `"New session in <project>"`/`"New session (<short id>)"` when the host's own id-as-title fallback would otherwise show a raw session id).

- `src/host/orphanSessions.ts` (`watchOrphanSessions`) is a live reporter: one `onSessions` subscription per registered project, reporting every structurally-adoptable session (not a subagent, not archived, not already linked) with a resolvable status, on every snapshot. Sidebar-created sessions are therefore adopted while the board is open and are also found on the next board load if they were created while it was closed.
- `src/store/orphanWatermark.ts` holds the single cutoff: set once, the first time this feature ever runs, to that moment, and never moved again. Every session's real `createdAt` is compared against it on every board load — this is the only design that works for a page-type extension, since a page only runs while it's the selected main view, and detection cannot happen while you're in a different chat.
- `attemptedSessions` in `board.ts` guards against retrying a failed adoption on every snapshot tick, cleared on `Refresh`/reopen.
- `startingAgents` temporarily pauses adoption while a task's `startSession` request is in flight. The host can publish the new session before that request returns its id; once returned, the id is claimed and the originating task is saved with the link before navigation. A final same-session check removes any duplicate card already linked to that session.
- Subagents and archived sessions are never adopted. A toast announces each adoption.

## Start Agent

Shown in the task detail popup until a session is linked (after that, Open Chat/Unlink instead, with the chat's own title leading the row and the id in mono under it). Requires a title, description, and project; disabled with an inline reason otherwise, re-evaluated live. The **Start Agent** button sits in the popup's footer next to **Save changes** — the primary and blocking actions share one place.

### The dialog's structure

The popup leads with the task (title + description + dictation), then a **Board** section and an **OpenCode session** section, and the footer (Delete · Close · Save changes · Start Agent) last. The head names the task — the title, kept current while you type, over `Task · <id> · project <name>` in mono — with the agent's live pill beside it when a trusted snapshot covers the linked session. The status strip replaces the old select + "Move to" button pair: one pressed button per status, a press moves immediately through the kept-rank, marker-clearing path (`quickStatus`), and focus stays on the strip after the press so keyboard users can move again. **Unlink** joins **Delete** in needing a second, confirming press. The popup is `aria-modal`: initial focus lands on the dialog itself (no on-screen keyboard on touch), Escape yields first to an open SDK popup or active dictation (the kit's Escape handlers prevent-default before bubbling here), and Tab is trapped inside — SDK popups mount inside the dialog's DOM (`popup.js`'s `openPopup` appends to the trigger's wrap), so the trap's query at press time already includes them.

**Start from** is a radio choice:
- **Project root** — run directly in the main checkout, no worktree.
- **New branch** — a fresh branch and worktree, based on the branch picked in **Based on**. Shows **Branch name** (with the SDK limit as helper text: `startSession`'s `{ kind: 'new', name, baseBranch }` has one `name` for both, so the folder name always follows the branch).
- **Existing worktree** — reuse a worktree already checked out (`listWorktrees`). Not the same as "check out any branch that doesn't have a worktree yet" — the SDK has no such mode, only `{ kind: 'existing', directory }` for a worktree that already exists on disk.

**Based on** is a searchable dropdown (`searchable: true`), populated from the local git-branch service when available, or the project's existing worktree branches plus "Use project default" otherwise. A new branch can't be based on itself (`branchNameConflictsWithBase`) — checked before the request is ever sent.

Clicking **Start Agent**:
1. Passes the title, description, and project currently shown in the dialog, including edits not yet saved with **Save changes**. The description becomes `text`; the current values are also saved to the task as part of the session-link update.
2. The session title uses the task title. If the title is still the default `"New task"`, `sessionTitleForTask` uses the first line of the description instead. This avoids giving a new session the generic task placeholder as its name.
3. Builds the `worktree` value (`buildSessionWorktree`) and calls `host.startSession` with `navigation: 'preserve'`. Adoption is paused during that request because the host can publish the new session before the request returns its id.
4. When a session id returns, it is claimed in `attemptedSessions`, and the existing task is saved with that id, the latest title and description, the project, In Progress status, and its worktree. The save retries three times with backoff (`saveTaskRetrying`). A same-session check removes an already-created duplicate task if one exists.
5. Checks `result.sent`. If the session was created but the description was not sent (`no-model`, `skipped`, or `failed`), the board shows an error toast. The description remains saved on the task; the SDK has no call to send a message to an arbitrary existing session afterward.
6. Clears the saved open-task preference and waits for that storage write to finish before calling `host.openSession(result.sessionId)`. The dialog therefore does not reopen when the user returns to the board.
7. On failure (`sessionId: null`), surfaces the host's own failure reason and keeps the worktree's directory in the message rather than deleting anything.

## The local service (git branches + voice dictation)

Declared via `contributes.service` with `permissions.exec: ["git"]` — the only way to list a repository's real branches, since the SDK itself has no API for this (confirmed by enumerating every `HostClient` method). The same process also answers the dictation routes; it runs no new external programs for that (sherpa-onnx is loaded in-process).

- `src/service/main.ts` is a thin bootstrap (env, git implementation, real recognizer); `src/service/server.ts` builds the HTTP surface: bearer auth, `GET /health`, `GET /branches`, and the `/transcribe*` routes. Built to `service/main.js` (Node/ESM target, not the browser build) — the host spawns it and proxies to it on `127.0.0.1`; every request is bearer-authenticated by the host itself, and the panel never sees the token or dials the port directly.
- The branch route runs **exactly one command**: `git -C <directory> for-each-ref --sort=-committerdate --count=200 --format=%(refname) refs/heads refs/remotes` — read-only, most-recently-active branches first, capped at 200, for a project directory the panel already knows about (`path.isAbsolute` checked).
- `src/host/branchService.ts` (`fetchServiceBranches`) is best-effort: not approved, not running, a bad answer, or any other error all become `null`, never an exception the UI has to handle, because the worktree-derived fallback is a complete, working option on its own.

## Voice dictation (description field)

A **🎙 Dictate** button sits under the description textarea in the task detail dialog. It is rendered only when the host offers the microphone (`ready.features.microphone` from the `microphone` grant); everywhere else it does not exist, and the documented fallback — particularly in the native mobile app — is the operating system keyboard's own dictation.

### Flow, tap by tap

1. **First tap** — `host.openMicrophone()` runs inside the click (the frame's audio graph needs the user's gesture; the SDK creates its `AudioContext` before its first await). The guest attaches a `ScriptProcessor` graph fed by the returned `MediaStream` into a *silent* `MediaStreamDestination` (never the speakers) and starts pushing one `Float32Array` copy per callback. The button flips to **⏹ Stop and insert**, a status line shows the elapsed time, and a **Discard** button appears.
2. **Second tap** — stops the capture immediately (`mic.close()`, so the host's red "using your microphone" indicator goes away), concatenates the chunks clamped to `MAX_CLIP_SECONDS` (120 s), and transcribes.
3. **Transcription** — `src/ui/speech.ts` resamples to 16 kHz (box-average when the device rate divides evenly, linear interpolation otherwise), encodes Int16 PCM, base64-chunks, and streams via `serviceRequest`: `POST /transcribe/begin` → one `POST /transcribe/append` per chunk → `POST /transcribe/finish`, all carrying one clip id. The returned text is appended to the *existing description* with a single space (clamped to `DESCRIPTION_MAX` if it would overflow; the title is never touched), the field is focused, and unsaved-state marking stays consistent.
4. **Discard / cancel / teardown** — the discard button, closing the dialog, Escape, overlay click, or the board being disposed all route to the same cancel path: the microphone is closed right away, partial audio is dropped, an in-flight upload is abandoned (a generation counter makes late completions inert) plus a best-effort `POST /transcribe/cancel` so the service frees the clip. A host-side stop (`revoked`, `device-lost`) triggers the same reset with a toast.
5. **Errors** — denied/unsupported microphone and service failures surface as `host.toast` messages with human wording.

### Service transcription routes

Audio sent as base64 Int16 PCM at 16 kHz. A single request body on the wire carries at most `GUEST_REQUEST_BODY_MAX` (64 000) characters — roughly 5.7 000 base64 bytes of PCM ≈ 1.35 s of audio per chunk (`PCM_CHUNK_BYTES` = 43 200 bytes) — hence the chunked flow. The clip store accepts at most 4 concurrent clips, 120 s of audio each (the same cap the guest enforces), and expires idle clips after 5 minutes. The one-shot `POST /transcribe` remains for callers that already hold a whole short clip.

| Route | Body | Answer / errors |
|---|---|---|
| `POST /transcribe` | `{ pcm16, sampleRate }` | `{ text }`, or 400/413/503 |
| `POST /transcribe/begin` | `{ sampleRate }` | `{ id }`, or 400/429 |
| `POST /transcribe/append` | `{ id, pcm16 }` | `{ samples }`, or 400/404/413 |
| `POST /transcribe/finish` | `{ id }` | `{ text }`, or 404/503 |
| `POST /transcribe/cancel` | `{ id }` | `{ cancelled }`, idempotent |

Non-2xx answers carry `{ error: "<human-readable reason>" }`, which the dialog turns into a toast.

### The recognizer

- Package: `sherpa-onnx-node` 2.0.1 (with the `sherpa-onnx-linux-x64` 2.0.1 platform package carrying the native binding). Loaded **lazily on the first transcription**, never at service spawn, so `/health` stays instant and a never-used mic costs nothing. The binding stays outside the esbuild bundle (`external: ['sherpa-onnx-node']`) because it loads its own `.node` file and shared libraries at runtime.
- Model: `~/.config/openchamber/speech-models/sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8/` (NVIDIA Parakeet TDT 0.6B v2, int8, offline NeMo transducer), **read-only** — the service never writes to it and never downloads anything. Recognizer config matches sherpa-onnx's own Parakeet example: `featConfig {sampleRate: 16000, featureDim: 80}`, `modelConfig {transducer: {encoder, decoder, joiner}, tokens, numThreads: 2, provider: 'cpu', modelType: 'nemo_transducer'}`.
- First-use latency pays that load (~1.5 s measured on this machine); a 7 s clip decodes in ~0.5 s afterwards (RTF ≈ 0.06, two threads). A clip of the 120 s cap still finishes well inside the host's 20 s `serviceRequest` timeout once loaded.
- If the model directory or its four files are missing, the service stays healthy and every transcribe route answers a clear 503 (`Speech model not found: …`) instead of crashing; clips of genuine silence never touch the model at all.

No audio, text, or transcript ever leaves the machine: capture is the host's own microphone, upload is over the service loopback, and decoding is local ONNX.

## Known SDK limitations

- **No API to list a repository's full branch set**, only `GuestWorktree.branch` per existing worktree, or the local service above.
- **Capability approval is all-or-nothing** across the whole manifest (see above) — there's also no cross-extension service API, so a capability can't be split into its own, separately-optional package either.
- **The microphone cannot be opened at a chosen rate.** `host.openMicrophone()` takes no arguments — the SDK builds the frame's `AudioContext` at the device's default rate (typically 48 kHz) and the host captures at that rate, so the guest downsamples to 16 kHz itself (see `src/ui/speech.ts`). The capture also reaches the guest only as a `MediaStream`, requiring the SDK's own `ScriptProcessor`-into-silent-destination pattern to pull samples.
- **A `serviceRequest` body is capped at 64 000 characters** (`GUEST_REQUEST_BODY_MAX`) — roughly a second of 16 kHz Int16 audio per request — so longer recordings are streamed as ordered chunks through `/transcribe/begin|append|finish`. Responses may be up to 8 MB, so `{ text }` is never a problem.
- **Chats are invisible.** A chat (a session with no project) is explicitly documented as outside any project; the `sessions` capability's methods are all scoped to registered projects. There is no SDK method to list or watch chats at all.
- **Session auto-adoption runs only while the Kanban page is active**, plus the next time it opens. A session started from the sidebar while the board is active is adopted live; one started while the board is closed is found when the board opens again, if it meets the watermark and activity rules. A session started from a task is linked directly to its existing task instead of being adopted as another task.
- **No way to set a worktree's folder name independently of its branch name** — `startSession`'s `{ kind: 'new', name }` sets both together.
- **OpenChamber's own worktree-creation can fail with "Remote branch not found" for a branch confirmed to exist on the remote and already fetched locally.** When `host.startSession` rejects for a new-branch request, the real reason doesn't survive the trip back to the extension — only a generic failure does — so the error shown names the base branch involved and suggests this is a known possibility, not a claim that the branch name is wrong.

## Install and verify

```bash
git clone <this repository>
cd openchamber-kanban
npm install
npm run check   # typecheck + unit tests + build panel/main.js, panel/page.js, service/main.js
```

In OpenChamber: **Settings → Extensions → Add** → paste this folder's absolute path → approve `sessions`, `prompt`, `microphone`, and the local service → open **Kanban** from the Extension pages menu above the session list. The mic button appears in a task's detail dialog only where the host actually offers the microphone (desktop/web with SDK 2.7.x); on mobile the fallback is the OS keyboard's dictation.

Acceptance scenarios:

1. Create three tasks, reload OpenChamber → all three persist.
2. Drag a task between columns, reload → the new status persists.
3. Link an existing session to a task → **Open Chat** → the real session opens via `host.openSession`.
4. Edit a task title and description without clicking **Save changes**, then start an agent → the current values are saved, the description is sent when OpenChamber reports success, the same task links to the session, and the task moves to In Progress.
5. Run two tasks concurrently → they never share a session id.
6. An agent finishes a turn → the task moves to Review, never to Done, until marked Done by hand.
7. Start a session from the OpenChamber sidebar → one new task appears for it, in the column its activity implies.
8. Start an agent from a task → only the originating task is linked to that session; no second task is adopted for the same session.
9. Open a task's detail dialog on desktop → 🎙 Dictate → speak a sentence → Stop and insert → the sentence appears at the end of the description (title untouched), the red microphone indicator disappears the moment you stop, and a second dialog with the mic button already off starts no capture.
10. An agent finishes a turn → the task lands in Review; after ~10 minutes of the session staying idle and `completed` with no new turn, the Review card shows the success-tinted ✓ with a tooltip naming the quiet time; opening the card turns the ✓ muted (hover to see it); clicking it marks the task Done — still never automatically.
11. Check two cards (or Ctrl/⌘-click them) → the selection bar shows "2 selected"; Move to a column keeps their relative order at the target's end, Mark Done sends both to Done, and Delete — after a second, confirming press — removes both and dismisses their linked sessions from adoption. Escape clears the selection; the rail panel shows no checkbox, bar, or trash anywhere.
12. First press of a column's head trash arms it ("Click again to empty"); the second deletes exactly that column's visible tasks and toasts the count. Left alone, the armed state resets itself after a few seconds; the trash on an empty column never arms.
