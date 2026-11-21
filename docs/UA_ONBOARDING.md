# Onboarding Guide — openchamber-kanban

> Generated from the project's knowledge graph on 2026-11-21 (graph commit `5e1890e`, matching HEAD at generation time).
> Architecture data source: `.ua/knowledge-graph.json` — run `/understand` to regenerate it and this guide.

## Project Overview

**openchamber-kanban** is a local-first Kanban board for OpenChamber that links tasks to real OpenCode sessions.

- **Languages**: TypeScript, JavaScript, HTML, JSON, Markdown
- **Frameworks**: OpenChamber SDK, esbuild, node:test
- **The promise** (from README.md): a board with columns like Backlog, To Do, and Done where any card can start a real OpenCode chat, task and chat stay linked, and all data stays on the user's own OpenChamber server. It ships as an OpenChamber extension with three surfaces — a full-page board, a rail panel mirror, and an adaptive frame entry — plus a loopback Node service it spawns.

Three facts shape everything else, and the whole codebase follows them:

1. **Agents are first-class board participants.** A deliberately narrow wire protocol lets agents list tasks, queue a task, and leave notes — but never mark cards Done.
2. **Automation is contract-driven.** Review moves are gated on the *build (doer)* agent, Done is auto-proposed when commits land on a linked branch, and tasks auto-archive after two weeks.
3. **Data never leaves the machine.** Tasks live in host storage (localStorage keys), and even voice dictation runs offline via sherpa-onnx.

## Architecture Layers

The codebase is a strict layering — pure rules at the bottom, I/O wrappers above, DOM at the top. Reading order should follow the layer numbers below.

| Layer | What it holds |
|---|---|
| **Domain Model** | Pure Kanban logic with no I/O: task/board/board-view state machines, view modes, auto-task and auto-sync rules, worktree/chat-link decisions, agent-channel wire protocol with validation clamps. |
| **State Store** | localStorage-backed stores and operation modules applying task, adoption, dismissal, title, orphan-watermark and preference mutations on top of the domain rules. |
| **Host Integration** | Bridges to the OpenChamber/OpenCode host over the SDK: live session/worktree/branch sync, orphan handling, prompt fill, dictation plumbing, title promotion, agent-channel monitoring. |
| **Local Service** | The loopback Node HTTP service the host spawns: bearer-token authenticated git routes, token-scoped agent-channel API + journal store, offline sherpa-onnx dictation. |
| **UI Components** | DOM-only rendering blocks: board + kanban view, detail and archive dialogs, drag-and-drop, pills, styles, dictation UI. |
| **Entry & Bootstrap** | Mount points for the three surfaces (full-page board, adaptive panel frame, rail mirror controller). |
| **Bundled Artifacts** | esbuild products OpenChamber actually serves: minified IIFE bundles of page/panel/frame, unminified ESM service bundle, HTML shells. |
| **Build & Tooling** | The esbuild pipeline and the skill-installer setup script. |
| **Test Suite** | node:test suites mirroring every layer, covering domain, store, host, service and UI. |
| **Project Config & Docs** | package.json + tsconfig, README, ARCHITECTURE.md, and the agent-facing kanban skill definition. |

## Key Concepts

These are the project's load-bearing design decisions — internalize them before touching code.

### 1. Pure domain, thin I/O edges
`src/domain/` has zero I/O. State mutations are pure functions (`createTask`, `applyPatch`, `parseTask`, `planMove`); the store layer applies them to real storage, the host layer feeds them live SDK state, the service wraps the same core in HTTP. This is why tests import the *same* modules and swap only the I/O edges.

### 2. Wire-format discipline
Every limit is a named constant; ids are pattern-checked; saves are validated through parse round-trips (`parseTask`) before storage accepts them. Journal entries, agent creates and notes are all clamped to wire limits (`src/domain/agentChannel.ts`).

### 3. The agent channel: mirror + journal
Agents don't touch the board directly. The board **pushes** a mirror document (`mirror.json`) that agents can read; agents **queue** writes into `journal.jsonl`; the board pulls and applies pending entries. Accepted writes: create a task in Backlog/To Do (placeholders only) and leave notes. Sync routes always answer 403 to the agent token — the bearer-token scope split in `src/service/server.ts` enforces it.

### 4. Agent etiquette (deliberately narrow)
Agents never mark cards Done — the SKILL.md teaches them to always leave a wrap-up note instead, which feeds the auto-done pipeline via Review gating.

### 5. The automation contracts
- **Build-agent-gated Review**: only the *doer* agent's activity can move a task into Review (`src/domain/sync.ts`).
- **Auto-done**: the board asks the local service how many commits a linked worktree's branch is ahead of base; commits that land *after* the agent went quiet propose a move to Done (`src/host/autoDoneSync.ts`, anchored by `sessionLinkedAt`).
- **Two-week archive**: tasks auto-archive after 14 days (`src/domain/board.ts`).
- **Link health**: a "gone" answer is trusted only from fully loaded snapshots; otherwise link state is `unknown` (`src/domain/unlink.ts`).
- **Orphan adoption**: taskless sessions become cards, with a persisted watermark (a page-type extension can't detect sessions while closed) and a dismissed-set so deleted cards are never re-adopted (`src/host/orphanSessions.ts`, `src/store/adoptOps.ts`).
- **Title promotion**: a real session title is promoted onto exactly one adopted card, once, overwriting only adoption placeholders (`src/domain/autoTask.ts`, `src/host/titlePromotion.ts`, `src/store/titleOps.ts`).

### 6. Fail-soft transports
Host-side API calls degrade quietly: `src/host/agentChannel.ts` degrades every failure to `null`/`false`, `src/host/branchService.ts` returns `null` (never throws), `src/host/workspace.ts` maps failures to user-facing messages. The UI must never break because an agent or the service hiccuped.

### 7. Storage model: one key per task
`src/store/taskStore.ts` stores each task under its own key so edits never clobber each other, loads in batches with per-key fault tolerance, and validates every save through the same parse round-trip. Ops modules (`taskOps`, `adoptOps`, `titleOps`) implement the writes; saves **throw** so callers can notify and reload (dismissal-first discipline on deletes).

### 8. Build: esbuild emits, tsc checks
`tsconfig.json` is check-only (`noEmit`, strict flags: `verbatimModuleSyntax`, `noUncheckedIndexedAccess`). esbuild performs the real emit: three minified IIFE bundles under `panel/` (page, panel mirror, adaptive frame) plus an unminified ESM bundle at `service/main.js`, with `sherpa-onnx-node` kept external. **Read `src/`, not the bundles.**

### 9. Test discipline
Every layer has a `node:test` mirror under `test/` using in-memory storage doubles and scripted fake hosts; service tests drive the *real* HTTP server (`agentRoutes.test.ts` verifies the token scope split). This is the quality bar: same modules, swapped I/O edges.

## Guided Tour

The recommended reading path — 13 stops, each building on the last. ARCHITECTURE.md is the table of contents for this tour.

1. **Project Overview** — `README.md` (the plain-language promise, agent channel routes, honest SDK limits) + `package.json` (surfaces, requested capabilities: sessions, prompt, microphone; long-running service with git exec permission; scripts).
2. **The Architecture Map** — `ARCHITECTURE.md`: layered file structure, per-key task data model, and the contracts for every automatic behavior listed above.
3. **Entry Points & Surfaces** — `src/page.ts` (full-page board), `src/panel.ts` (rail mirror mounted once per frame lifetime), `src/frame.ts` (adaptive entry measuring iframe width and device form-factor, debounced 150 ms), `src/panelMirror.ts` (the rail's real production logic).
4. **Domain Model: Tasks & Boards** — `src/domain/task.ts` (the most depended-upon file: six-status enum, defensive normalization, safe lifecycle functions), `src/domain/board.ts` (filtering, rank ordering, drop planning, archive rule), `src/domain/boardView.ts` (projects persisted tasks + live session state into the render-ready view), `src/domain/viewMode.ts` (mirror-vs-board decision with a 128 px hysteresis band).
5. **Automation & Link Rules** — `src/domain/sync.ts` (status mapping, agent gating), `src/domain/autoTask.ts` (adoption heuristics, titles), `src/domain/chatLink.ts` (startSession request + `sessionLinkedAt` anchor), `src/domain/worktree.ts` (pickers → worktree shape, null on failure), `src/domain/unlink.ts` (link-health predicates).
6. **State Store** — `taskStore` (one key per task, batched, fault-tolerant) → `taskOps` (board writes, throws so callers notify and reload) → `adoptOps` (first-writer race) → `titleOps` (one-card promotion) → `prefs.ts`.
7. **Rendering the Board** — `src/ui/board.ts` (composition root; highest fan-out at 29 imports), `kanbanView.ts` (cards, drag zones, menus), `detail.ts` (task overlay: edit, dictate, link session, Start Agent), `dom.ts` + `dnd.ts` (minimal primitives).
8. **Host Integration: Live Sync** — `sessionSync.ts` (shared live-state provider behind both surfaces), `worktreeSync.ts` (missing-worktree watcher), `autoDoneSync.ts` (commits-ahead → Done proposal), `orphanSessions.ts` (adoptable input), `titlePromotion.ts` (once-per-card sweep).
9. **The Local Service** — `src/service/main.ts` (git route, sherpa-onnx recognizer, agent channel token + agent.json discovery), `server.ts` (bearer-token scope split, strict git-param allowlist), `agentRoutes.ts` + `agentStore.ts` (mirror/journal persistence), `transcribe.ts` (chunked dictation with TTL).
10. **Agent Channel Wire Protocol** — `src/domain/agentChannel.ts` (pure wire spec) + `src/host/agentChannel.ts` (best-effort transport). Closes the loop with the service: agents read `mirror.json`, write `journal.jsonl`, the board applies pending writes.
11. **Build Pipeline & Bundles** — `scripts/build.mjs` and the build-output nodes; tsconfig explains the check-only/emit split.
12. **Test Suite** — `test/domain.test.ts`, `test/sync.test.ts` (table-driven), `test/taskOps.test.ts` (injected storage faults), `test/agentRoutes.test.ts` (real HTTP server, 403 scope split, journal-full refusal).
13. **The Agent Skill Guide** — `skill/kanban/SKILL.md`: how an agent finds the endpoint file + bearer token, the three routes (list tasks, queue a task, leave a note), and the etiquette. The tour's loop closes here: the board is a surface both humans and agents drive, over the same journal.

## File Map

Everything that matters, organized by layer. Start each bullet with the file, followed by what it does.

### src/domain — pure rules, no I/O
| File | Role |
|---|---|
| `task.ts` ⭐ | Core task model: six-status enum + limits, defensive normalization, `createTask`/`applyPatch`/`parseTask`. |
| `board.ts` | Board geometry as pure functions: project filtering, rank ordering, drop planning with rebalancing, 14-day auto-archive. |
| `boardView.ts` | Projects persisted tasks + live session state into the render-ready view: effective statuses, "looks done" aging, unseen counts, badge labels. |
| `sync.ts` | Maps a linked session's activity/outcome/agent onto status changes; gates Review entry behind the build agent. |
| `chatLink.ts` | Builds the `host.startSession` request attaching (worktree- or project-rooted) chat to a card; persists link + `sessionLinkedAt`. |
| `worktree.ts` | Backs the Session-directory and base-branch pickers; maps to host worktree shape, degenerates to null on failure. |
| `unlink.ts` | Link-health predicates; trusts "gone" only from fully loaded snapshots. |
| `viewMode.ts` | Pure rule choosing mirror vs full board from width + form factor, with 128 px hysteresis. |
| `autoTask.ts` | Adoption + title heuristics: adoptability, landing column, placeholder title selection/recognition. |
| `agentChannel.ts` | The agent-channel wire protocol as pure data/functions: mirror docs, journal, agent task views. |

### src/store — persistence + write ops
| File | Role |
|---|---|
| `taskStore.ts` | localStorage persistence, one key per task; batched loads with per-key fault tolerance; parse-validated saves. |
| `taskOps.ts` | Board-page writes: drag/menu moves, auto-done, patches, batch deletes with dismissal-first discipline (saves throw). |
| `adoptOps.ts` | Adopts orphan sessions as tasks; resolves first-writer races, deletes the loser, reports the survivor. |
| `titleOps.ts` | Promotes a real session title onto exactly one adopted card; converges on stale races. |
| `dismissedSessions.ts` | Persisted set of deliberately deleted sessions so the orphan watcher never re-adopts them. |
| `orphanWatermark.ts` | Persists the orphan-scan cutoff for sessions created while the board was closed. |
| `prefs.ts` | Project filter + last-open task, parsed defensively with clean fallbacks. |

### src/host — SDK integration and watchers
| File | Role |
|---|---|
| `sessionSync.ts` | Shared live-state provider behind both board surfaces; deriv­es status changes, session-gone reports, per-session live map. |
| `worktreeSync.ts` | One worktree subscription per project; reports tasks whose linked worktree disappears. |
| `autoDoneSync.ts` | Watches linked worktrees, asks the service commits-ahead, proposes Done when commits land after agent quiet. |
| `orphanSessions.ts` | Subscribes to every project's session stream; reports adoptable taskless sessions. |
| `titlePromotion.ts` | Sweep promoting a real session title onto an adopted card, once per card; callback-based outcomes. |
| `promptFill.ts` | Fills a just-opened chat's composer without sending (writes twice to win the session-switch race); `onLost` when fill provably gone. |
| `workspace.ts` | Typed adapter over host snapshot APIs (projects, sessions, worktrees) with timeout race and longest-prefix project match. |
| `agentChannel.ts` | Board side of the agent channel: best-effort push/pull/ack transport; every failure degrades to null/false. |
| `branchService.ts` | Best-effort fetcher for the service's `/branches`; null on anything odd. |
| `dictation.ts` | Browser dictation controller: guest microphone, Web Audio capture, capped clips, drives transcription with state/level/notice callbacks. |

### src/ui — DOM-only components
| File | Role |
|---|---|
| `board.ts` ⭐ | Composition root: `mountKanbanBoard` factory loads, renders, wires dialogs, runs all sync engines, mirrors to agents, disposes. |
| `kanbanView.ts` | The rendering layer: sections, columns, cards, selection, drag sources/zones, per-card menus, chat/done actions. |
| `detail.ts` | Task detail overlay: editable fields, quick status, dictated description, session picker with link/unlink, Start Agent button. |
| `archiveDialog.ts` | Archive dialog: restore, two-step delete, countdown-confirmed bulk purge. |
| `dictationPanel.ts` | Compact dictation control: mic trigger, timer, canvas level meter, transcribing state, insert/discard. |
| `speech.ts` | Pure audio helpers shared with tests: metering, 16 kHz downsample, Int16 PCM encode, wire-capped base64 chunks. |
| `styles.ts` | The UI's single CSS stylesheet, injected exactly once. |
| `pill.ts` | SVG agent activity pill (spinner/shield/dot + status label). |
| `dnd.ts` | Drop before/after decision from pointer position. |
| `dom.ts` | Minimal primitives: `el()` factory and `clear()`. |

### src/service — local Node HTTP service
| File | Role |
|---|---|
| `main.ts` | Service entry: git for-each-ref route, offline recognizer, agent-channel token + agent.json discovery, proxied service host. |
| `server.ts` | HTTP layer: bearer-token auth splits host-only routes from the agent-token `/agent/*` subtree; strict git-param allowlist. |
| `agentRoutes.ts` | Agent channel HTTP handlers: read mirror, queue task/note writes; enforces the token scope split (403s for sync routes). |
| `agentStore.ts` | Persists `mirror.json` + `journal.jsonl` with promise-chained serialization and atomic rewrites. |
| `transcribe.ts` | Dictation routes: `/transcribe/begin|append|finish|cancel` chunked sessions with TTL, plus one-shot `/transcribe`. |
| `recognizer.ts` | Lazy sherpa-onnx wrapper: native module + ~0.6 GB int8 Parakeet model load only on first transcribe; user-safe errors. |
| `sherpa-onnx-node.d.ts` | Minimal ambient types for exactly the OfflineRecognizer surface the service uses. |

### Entry points
| File | Role |
|---|---|
| `src/page.ts` | Full-page board surface bootstrap. |
| `src/panel.ts` | Rail mirror bootstrap; production logic lives in `panelMirror.ts`. |
| `src/panelMirror.ts` ⭐ | The rail's real controller: project lock, live sync, title promotion, orphan adoption, unseen badge, clean dispose. |
| `src/frame.ts` | Adaptive entry: measures width + form factor, swaps mirror/board via `viewMode` with debounced resize. |

### Tooling, config, docs
| File | Role |
|---|---|
| `package.json` | Extension manifest: entries, capabilities (sessions, prompt, microphone), service with git exec permission, npm scripts. |
| `tsconfig.json` | Check-only strict TypeScript (`noEmit`, `verbatimModuleSyntax`, `noUncheckedIndexedAccess`). |
| `README.md` | User-facing overview, install, automatic rules, honest SDK limits. |
| `ARCHITECTURE.md` | Deep-dive: manifest and four capabilities, layered structure, per-key data model, every automation contract. |
| `skill/kanban/SKILL.md` | The agent-facing skill: endpoint discovery, the three routes, etiquette. |
| `scripts/build.mjs` | esbuild pipeline: three minified IIFE browser bundles + unminified ESM service bundle, sherpa-onnx external. |
| `scripts/install-skill.mjs` | Copies the kanban skill into OpenCode's global skills directory (`~/.config/opencode/skills/kanban`). |

### Build outputs (generated — read `src/` instead)
`panel/index.html`, `panel/page.html`, `panel/frame.html`, `panel/main.js`, `panel/page.js`, `panel/frame.js`, `service/main.js`.

### Test suite (one per domain counterpart)
`test/` mirrors every layer with `node:test`. Highlights: `domain.test.ts` (round-trips, clamps, rebalancing, archive rule), `sync.test.ts` (table-driven status mapping), `taskOps.test.ts` (storage faults, dismissal rollback), `boardView.test.ts` (display regrouping, badges, archive display rule), `agentRoutes.test.ts` (real HTTP server, token scope split, journal-full refusal), `autoDoneSync.test.ts` (scripted commit responses, retry rate limiting), `transcribe.test.ts` (chunked sessions, 503 error mapping). Smaller suites cover `dnd`, `viewMode` (640 px threshold + hysteresis), `workspace`, `promptFill`, `speech` (audio helpers), `branchService`, `chatLink`, `worktree`, `unlink`, `orphanSessions`, `orphanWatermark`, `adoptOps`, `titleOps`, `titlePromotion`, `store`, `autoTask`, `agentChannel`, `agentStore`, `commitAheadService`, `sessionSync`, `worktreeSync`.

## Complexity Hotspots

Approach these carefully; they carry the most state and cross-layer wiring. All marked `complex` in the graph.

**Production code**
- `src/ui/board.ts` — composition root with the highest fan-out (29 imports); every rendering and sync concern meets here.
- `src/panelMirror.ts` — the rail's production controller: timers, subscriptions, adoption, badges, all with dispose obligations.
- `src/ui/kanbanView.ts`, `src/ui/detail.ts` — dense, stateful DOM components (drag events, forms, dicts of interactions).
- `src/service/server.ts` — security boundary: token scope split, git-param allowlist; changes here are security changes.
- `src/domain/task.ts` — most depended-upon file (37 graph nodes point at it); change limits here and the whole board shifts.
- `src/domain/boardView.ts` — where persisted state and live host state reconcile into display statuses.
- `src/domain/agentChannel.ts` — the wire protocol; breaking clamps here breaks the agent contract.
- `src/host/dictation.ts` — Web Audio plumbing with capped clips and multi-callback state.
- `src/host/sessionSync.ts` — shared live-state single source of truth for both surfaces.
- `src/ui/archiveDialog.ts`, `src/ui/dictationPanel.ts` — armed/destructive flows and audio-meter UI.

**Tests worth reading before refactoring** (they encode the subtle contracts): `test/taskOps.test.ts`, `test/boardView.test.ts`, `test/autoDoneSync.test.ts`, `test/transcribe.test.ts`.

## Daily Workflow

```bash
npm run check    # typecheck + node:test + esbuild build — runs everything CI cares about
npm run typecheck
npm test
npm run build
```

Also: `node scripts/install-skill.mjs` copies the agent skill into OpenCode's global skills directory (`~/.config/opencode/skills/kanban`) when `skill/kanban/SKILL.md` changes. Remember the bundles under `panel/` and `service/` are generated, and the knowledge graph lives in `.ua/`.
