import type { StartSessionRequest, StartSessionResult } from '@openchamber/sdk';
import { sessionTitleForTask } from './autoTask.ts';
import type { Task, TaskPatch } from './task.ts';
import { resolveTaskWorktree } from './worktree.ts';

export const EXTENSION_ID = 'kanban-board';

/** Never dereferenced by the host; only shown as this task's chip link. */
export const taskUrl = (id: string) => `https://kanban.local/tasks/${id}`;

/**
 * The `host.startSession` request the rail's chat button sends for a task
 * with no linked chat: a real session is created and attached to the card
 * (providerId/id/title/url are the chip's identity) with **no first
 * message** — an empty chat the user writes into. It runs in the task's own
 * worktree when it has one, else in the project root. `navigation:
 * 'preserve'` keeps the current view, so navigation happens only after the
 * link is safely saved — the caller's `openSession` is the one navigation
 * trigger, exactly like the page's Start Agent.
 */
export const buildStartSessionRequest = (task: Task): StartSessionRequest => {
  const request: StartSessionRequest = {
    providerId: EXTENSION_ID,
    id: task.id,
    title: sessionTitleForTask(task),
    url: taskUrl(task.id),
    worktree: task.worktree ? { kind: 'existing', directory: task.worktree.directory } : false,
    navigation: 'preserve',
  };
  // The rail's button renders only for tasks with a project (the card's
  // own), so this is always set in practice; omitted otherwise, never guessed.
  if (task.projectId) request.projectId = task.projectId;
  return request;
};

/**
 * What a successful start writes onto the task: the session link and the
 * worktree the host reports having used (prefers the host's own echo; falls
 * back to the requested directory), and the auto-done rule's commit anchor —
 * `sessionLinkedAt`, the moment this save runs, because the session is born
 * here and every commit it ever makes is newer than that. Never a status
 * change — on the panel, agent-driven moves stay the board's thing to
 * persist; the chat's existence is written, the card's column is not.
 */
export const buildLinkPatch = (request: StartSessionRequest, result: StartSessionResult & { sessionId: string }, now = Date.now()): TaskPatch => ({
  sessionId: result.sessionId,
  worktree: resolveTaskWorktree(request.worktree ?? false, result),
  sessionLinkedAt: now,
});

/**
 * The text a new chat's composer is pre-filled with: the card's description
 * — what the agent is being asked — or the title when the description is
 * empty. Never sent by itself: `host.prompt` with `send` omitted
 * replace-composes it on the opened session and waits for the user's own
 * send; a fill that never lands loses nothing, the text stays on the card.
 */
export const chatPromptForTask = (task: Pick<Task, 'title' | 'description'>): string =>
  task.description.trim() || task.title;
