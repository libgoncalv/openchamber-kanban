---
name: Kanban board
description: Read the OpenChamber Kanban board from an agent — list its tasks, add a breakdown task, and leave a wrap-up note on the task you worked on.
---

# The OpenChamber Kanban board

The user's OpenChamber has a Kanban board extension (columns: Backlog, To Do,
In Progress, Review, Done). A task can be linked to a real agent session; when
that session finishes, asks a question, or needs permission, the task moves to
**Review** on its own — never to Done. Agents use the board through the
extension's local service: a small HTTP API on this machine, authenticated
with a token the extension wrote to a file.

Load this skill when the user mentions the board, its cards or tasks, when you
are working on a task that came from it, or when you split work into pieces.
It is also the way you report finished work back onto the card.

## Reaching it

The service advertises its endpoint in the extension's data dir:

```sh
CFG=~/.config/openchamber/guest-data/kanban-board/agent.json
# override with KANBAN_AGENT_CONFIG if set
PORT=$(node -p "require(process.env.KANBAN_AGENT_CONFIG || '$CFG').port")
TOKEN=$(node -p "require(process.env.KANBAN_AGENT_CONFIG || '$CFG').token")
BASE="http://127.0.0.1:$PORT"
AUTH="Authorization: Bearer $TOKEN"
```

If the file is missing or a request is refused with `connection refused`, the
extension is paused or the service has not started: tell the user to open the
Kanban page once — do not retry-loop.

## Routes

**List the board** — `GET /agent/tasks`:

```sh
curl -s -H "$AUTH" "$BASE/agent/tasks"
# {"tasks":[{"id":"t_…","title":"…","description":"…","status":"todo",
#   "projectId":"path_…","projectName":"thesis","sessionId":null,
#   "updatedAt":173…,"notes":[…]}]}
```

Descriptions are summaries; long ones are shortened in the listing. Always
list before creating anything — there may already be a card for the work.

**Add a task** — `POST /agent/tasks`:

```sh
curl -s -X POST -H "$AUTH" -H 'Content-Type: application/json' \
  -d '{"title":"Add token budget to the planner","description":"What to do, and how to check it.","directory":"'"$PWD"'","status":"todo"}' \
  "$BASE/agent/tasks"
```

- `directory` (recommended: the current working directory) places the task in
  that project; without a match it answers a `warning` and the task is
  created without a project.
- `status` is `backlog` (default) or `todo`.
- The answer is a receipt — **queued**, not created. The board applies queued
  tasks the next time it opens, or within seconds while it is open. A
  duplicate in that window is possible but harmless; mention it if you queued
  many.

**Leave a note on a task** — `POST /agent/tasks/<id>/note`:

```sh
curl -s -X POST -H "$AUTH" -H 'Content-Type: application/json' \
  -d '{"text":"Implemented the budget: planner.ts (cap, accounting), tests added. Run npm test to verify."}' \
  "$BASE/agent/tasks/t_ab12cd34ef/note"
```

The note appears on the task card for the user. This is your wrap-up report —
see below.

## Etiquette

- **Never try to mark Done.** There is no route for it: Done is the user's
  decision, and Review happens automatically through your session's state.
  Do not ask for a status change; finish your turn and the card moves itself.
- **A task's status is its session's state**, not yours to track. Work on the
  task your session is linked to; the board follows on its own.
- **Break work down early.** For a task with clear subtasks, queue one card
  per subtask (short imperative title; the description says what to do and
  how to verify) so the user can see and dispatch the pieces.
- **Always leave a wrap-up note** on the task you worked on before ending the
  turn: what you did, which files changed, and how the user can check it in
  one line. A Review card with no note is a card the user has to investigate
  from scratch.
- Ids in errors are opaque; a `404` on a note means the task id was wrong —
  list first. A `429` means the board is behind on applying queued work:
  opening the Kanban page once clears it, then retry.

All three routes stay on this machine and carry nothing to any server beyond
the user's own OpenChamber.
