# OpenChamber Kanban

This is a Kanban board for OpenChamber. A Kanban board is a board with columns, like Backlog, To Do, and Done. You put tasks on cards. You move cards between columns.

This board does one more thing. It can start a real AI agent chat for a task. It keeps the task and the chat linked.

All your data stays on your own OpenChamber server. This extension does not send your data to any other server.

## What it does

- Click the **+** in the toolbar. This creates and saves a new task right away, titled "New task", and opens it for you to edit. Later edits are saved by **Save changes** or when you click **Start Agent**.
- In the task, change the title. Add a description. It is what fills the new chat's composer.
- Choose a project.
- Click **Start Agent**. You do not need to click **Save changes** first. It uses and saves the title, description, and project you have on screen. It always runs in the project's main folder — there is no worktree or branch to choose.
- The new chat uses the task title. If the title is still "New task", it uses the first line of the description instead. The chat opens with the description pre-filled in its composer — nothing is sent until you press send, so you can review or edit it first.
- The task now links to that chat and moves to **In Progress**. Click the task card later, and it opens the same chat again.
- You can also link an already-running chat to a task, instead of starting a new one.
- Start a session from a task on this board, and it stays linked to that task. It does not create another task. Start a session from the OpenChamber sidebar, and the board can add a new task for it automatically, as described below.
- Delete a session in the OpenChamber sidebar — the linked task is deleted automatically. Archive a session, or delete a worktree — the corresponding link is cleared and the task stays on the board. You can start a new agent for it, or link another session.
- Move a task to any column three ways: drag the card, the ⋯ menu on it, or open the task and click the status you want in its Status strip. One click for every column, and the click moves immediately — the same deliberate move the other two make. The ⋯ menu exists on every card on the page.
- Each column carries its theme accent — gray Backlog, a held-back blue To Do, the same blue at full strength In Progress, amber Review, green Done — as a small strip above the header and the count's tint. The blue family is one color at two strengths (planned vs working); the color is display language on the column head only: cards keep their own (the agent pill, the amber unseen border).
- The board also speaks **to agents**: an agent session in one of the board's projects can read the tasks and queue two things — a new task (Backlog or To Do) and a **note** on a task it worked on. See "The agent channel" below.





<img width="1577" height="993" alt="Screenshot 2026-10-15 at 4 02 10 PM" src="https://github.com/user-attachments/assets/c738c32b-fd31-4c46-bcd1-1b450f98d45e" />
<img width="1557" height="870" alt="Screenshot 2026-10-15 at 4 01 49 PM" src="https://github.com/user-attachments/assets/02899ebb-71da-4d9a-9a8a-c609de1a7ef1" />


### The sidebar panel is a display mirror, filtered to your project

The narrow Kanban panel next to your session list shows the same board laid out for a narrow column, locked to the project OpenChamber currently has open. The same five columns appear stacked from top to bottom, each header showing its count and carrying its column's colored strip, exactly like the full page. On the full page the scope is a filter you can change; here it follows the open project.

A "Project: …" line under the header names the focused project. When no project is open, every task shows, with the project named on each row.

Every task shows the same information on both the page and the panel: its title, its project, and one colored, glyphed pill about the agent — a spinner for running or retrying, ? for "needs your answer", a shield for "needs permission", ! for failed, ✓ for finished — using the same tones as OpenChamber's own badges. Rows that need your review carry the same orange border as on the page, and the badge turns orange while unseen rows wait.

The panel follows agents in real time. If an agent finishes while the page is closed, the row already sits under Review — the pill carries what the agent is doing and the row's new section carries the move. Two quick actions live on the panel, both always visible at a row's right edge. The small **blue ✓** on every row that is not Done marks the task Done, exactly like the ✓ on the full board's cards — Done is still a human decision everywhere, and the panel never marks anything on its own. Beside it sits a **chat button**: on a card with a linked chat it opens that chat (and clears the orange border, because opening a waiting chat is exactly what being reviewed means); on a card with none it starts a new chat **attached to the card** — its composer is pre-filled with the card's description, or its title when the description is empty, so you review or edit and then press send yourself (the agent only starts at your send) — running in the card's own worktree when it has one — opens it, and links it to the card, without ever moving the card between columns: if the agent starts working, the pill shows it right away, and the board makes the move real the next time you open it. Cards without a project show no chat button. It has no other clicks: no opening, no moving, no quick-add, no deleting, no editing. To do anything else, use the full board from the Extension pages menu — that is the thinking: the panel is for looking at what the agents are up to in the project you have open (and for the fastest mark-done and the fastest way into a card's chat), the page is for doing.

### The Review column moves on its own

Some tasks move to the **Review** column by themselves. You do not drag them there. This happens when:

- the agent finishes its work, or
- the agent asks you a question, or
- the agent needs a permission from you, or
- the agent's run fails.

A task never moves to **Done** by itself. Only you can mark a task Done.

A task that moved to Review, and you have not opened yet, gets an **orange border** on the left side of the card. This border means: "Look at this one." The newest such task is always at the top of the Review column, above tasks you already saw.

Open the task (click it, or click Edit), and the border goes away.

### "Looks done" — a suggestion, never a decision

When a task sits in Review, its agent has finished, and nothing has happened for about ten minutes — no new turn, no answer requested — a small green **✓** appears next to the ⋯ menu on the card. Its tooltip explains itself: "Looks done · quiet 14m — click to mark Done."

The ✓ is only a suggestion, in the spirit of how OpenChamber itself treats finished sessions: the board never marks a task Done on its own. A click on the ✓ is simply a faster way for you to mark it Done (it stays where it is in the column order). If a new agent turn starts, the ✓ disappears immediately, because the quiet is over. Once you have opened the task, the ✓ turns quiet too: it only appears when you hover the card.

### Tasks can also appear by themselves

If you start a chat in OpenChamber another way — for example, from the sidebar — this board can still find it and make a task for it. The board adopts new, active sessions while it is open, and checks again when you open it. This only works for sessions created **after** you first open the board. It does not look back at older sessions. Sessions started with **Start Agent** are linked to the task you started from, not adopted as another task.

## How it works (a simple picture)

```
   Kanban Board
        |
        |  click a task with no chat yet, or click Start Agent
        v
   Task Detail
        |
        |  Start Agent / Open Chat
        v
   OpenCode Chat  <-----> the real agent does the work here
        |
        |  the task stays linked to this chat
        v
   Kanban Board  (the task shows the new status, for example Review)
```

### The agent channel — how an agent reads and feeds the board

An agent session (an OpenCode chat running in one of the board's projects) can talk to this board through the extension's local service. It can do exactly three things:

- **List tasks** — `GET /agent/tasks` returns the board as a summary: each task's title, description, status, and project.
- **Queue a task** — `POST /agent/tasks` with a title, a description, and (recommended) the working directory, which places the task in that project. It lands in Backlog or To Do when the board next applies it — the board page applies queued work on every load (and, while the board is open, within seconds).
- **Leave a note** — `POST /agent/tasks/<id>/note` puts a text on a task, shown in the task detail's "Agent notes" section. This is the intended **wrap-up report**: what the agent did, which files changed, how to verify.

That is all. There is deliberately no way for an agent to delete, to move a card, or to mark anything **Done** — statuses follow the linked session's state on their own, and Done stays a human decision everywhere on this board. Queued changes wait in a journal on disk (the board page is the only writer of task records and is often closed); acknowledging the journal is the board's job and the agent's token cannot reach it.

Agents learn about the channel from the **skill**: install it once with

```bash
node scripts/install-skill.mjs
```

which copies `skill/kanban` into `~/.config/opencode/skills/kanban/`, so every OpenCode session — OpenChamber's included — can load it. The skill carries the routes, the discovery (the endpoint and its token are in the extension's data dir, in `agent.json`), and the etiquette above. The agent-side surface is the skill by design — no MCP registration — but the routes are plain HTTP, so a future MCP wrapper can sit on them unchanged.

The service's data dir also holds the mirror (the task summary the board pushes for agents to read) and the journal (queued agent writes). Both live only on your machine. Installing the skill is optional: the board works the same without it.

## Install

**1. Get the code.**

```bash
git clone https://github.com/libgoncalv/openchamber-kanban.git
cd openchamber-kanban
```

**2. Build it.**

```bash
npm install
npm run check
```

`npm run check` does three things: it checks the TypeScript types, it runs all tests, and it builds the files OpenChamber needs. If this command finishes with no errors, the build is good.

**3. Add it to OpenChamber.**

- Open OpenChamber.
- Go to **Settings → Extensions**.
- Click **Add**.
- Paste the full folder path, for example `~/path/to/openchamber-kanban`.
- OpenChamber shows you three permissions to approve:
  - **Access projects and sessions** — lets the board see your projects and chats, and open or create chats.
  - **Compose in your sessions** — lets the board pre-fill a new chat's composer with your task's description. Nothing is sent until you press send.
  - **Run a local service** — see "What the local service does" below. This is the only reason this permission exists.
- Click **Allow and enable**.
- Open **Kanban** from the Extension pages menu, above your session list.
- *(Optional)* Install the agent skill so OpenCode sessions can use the board: `node scripts/install-skill.mjs`. See "The agent channel" below.

**Requirement:** OpenChamber version 1.24.0 or newer. Older versions do not have the Extensions feature at all.

## What the local service does — and nothing else

The approval screen calls this "Run a local service" and says it runs with your full user access. That sounds broad, so here is exactly what it does:

- It carries the board's **dictation**: when you dictate a description with the microphone, the audio goes to this service and is transcribed on your own computer — your voice never leaves your machine, and nothing connects to the internet on its own.
- It runs **one command only**: `git for-each-ref`, which **reads** your repository's branch names. The service-side check is thin on purpose — an absolute path — and the real restriction lives where the call comes from: this route is reachable **only through the host's authenticated proxy** with the extension's own token (an agent's channel token is refused with 403), and the board only ever sends a directory from your registered project list. Nothing on this machine that you didn't grant can reach it. The board itself no longer asks for that list: **Start Agent** now always runs in the project's main folder, so there is no branch to pick anymore — the command exists only because the route is still declared from an older version of this dialog.
- It carries the **agent channel** described above: a loopback HTTP API where agent sessions can read the task summary (the mirror) and queue tasks and notes (the journal). It authenticates agents with a token it mints itself, stored in its own data dir next to `agent.json` — a file any process running as your user can read, which is exactly the trust every OpenCode session already has on this machine. The service keeps running while OpenChamber runs so agents always find it (the approval dialog says so); its data dir is deleted when the extension is removed.

## What this extension cannot do

Some things are not possible with the current OpenChamber SDK (SDK = the toolkit extensions are built with). This is not a bug. It is a real limit.

- **It cannot see "Chats."** In OpenChamber, a Chat is a conversation with no project attached. This board only knows about chats inside a project. A Chat with no project never shows up here.
- **It cannot watch for new chats while you are in a different chat.** Starting a chat always switches your screen away from this board. The board can only check for new chats the next time you open it.



## Project files

See `ARCHITECTURE.md` for the full technical write-up: how each file works and the exact SDK limits behind each design choice.

## Credits

This project began as [mannu150/openchamber-kanban](https://github.com/mannu150/openchamber-kanban)
by Mohit Anand. It has since diverged and is now maintained independently.
