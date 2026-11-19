import type { HostClient } from '@openchamber/sdk';
import { rankAtEnd } from '../domain/board.ts';
import { titleForOrphanSession } from '../domain/autoTask.ts';
import { createTask, type Task, type TaskStatus } from '../domain/task.ts';
import { deleteTask, loadTasks, saveTask } from './taskStore.ts';

type Storage = Pick<HostClient, 'storage'>;

/** The session facts adoption needs — exactly what the orphan watcher reports. */
export type AdoptableSession = { id: string; title: string; createdAt: number };

export type AdoptionInput = {
  projectId: string;
  session: AdoptableSession;
  status: TaskStatus;
  /** The project's registered name, for the fallback title; null when unknown. */
  projectName: string | null;
};

/**
 * What one call ended as. `adopted: true` means this call's record is the one
 * that survived in storage; `adopted: false` means another surface's record
 * for the same session survived the same instant's race, and `task` carries
 * that survivor so the caller converges its view on it. `null` means the
 * session was already linked when the fresh read happened — nothing to do,
 * nothing to report.
 */
export type AdoptionOutcome = { adopted: true; task: Task } | { adopted: false; task: Task } | null;

/**
 * The one session-adoption write every open surface runs — the full board and
 * the rail mirror both reach here through their orphan watchers (see
 * `host/orphanSessions.ts`), so "the board adopts while it is open" is one
 * implementation, not two.
 *
 * The write reads storage freshly instead of trusting the caller's in-memory
 * list: another surface may have adopted this exact session (or a task may
 * have been linked to it) moments ago while this surface's copy still shows
 * nothing, and the rank must come from the real end of the real column. An
 * already-linked session returns `null` before anything is written.
 *
 * Two open surfaces (the page beside the rail, each running its own watcher)
 * can both adopt the same just-created session in the same snapshot tick —
 * both fresh reads passing before either save lands. Every adopter converges
 * after its save instead of racing to prevent that: the record with the
 * smallest task id survives, a tie-break deterministic for every side of the
 * race, so the loser deletes its own record, the winner deletes every rival's,
 * and whichever read ran too early to see the pair is corrected by the other.
 * `deleteTask` of an already-deleted key is a no-op, so double deletes are
 * harmless. Callers hear the survivor either way — `adopted: false` only, with
 * the winner's toast the one that tells the story.
 */
export const adoptOrphanSession = async (host: Storage, input: AdoptionInput): Promise<AdoptionOutcome> => {
  const first = await loadTasks(host);
  if (first.tasks.some((task) => task.sessionId === input.session.id)) return null;
  const task: Task = {
    ...createTask(
      { title: titleForOrphanSession(input.session, input.projectName), projectId: input.projectId, status: input.status },
      rankAtEnd(first.tasks, input.status),
    ),
    sessionId: input.session.id,
    // The auto-done anchor is the session's own birth, not the adoption
    // moment: an adopted session may already have committed everything it
    // has (the "already finished" adopt), and its work must still count —
    // every commit the session ever made is newer than its creation.
    sessionLinkedAt: input.session.createdAt,
    // Landing straight in Review (already finished, or needs you) is just as unseen as any other automatic move there.
    needsAttentionSince: input.status === 'review' ? Date.now() : null,
  };
  await saveTask(host, task);
  const settled = await loadTasks(host);
  const rivals = settled.tasks.filter((candidate) => candidate.sessionId === input.session.id && candidate.id !== task.id);
  const rival = rivals.length === 0 ? null : rivals.reduce((a, b) => (a.id < b.id ? a : b));
  if (rival === null) return { adopted: true, task };
  if (task.id < rival.id) {
    await deleteTask(host, rival.id).catch(() => undefined);
    return { adopted: true, task };
  }
  await deleteTask(host, task.id).catch(() => undefined);
  return { adopted: false, task: rival };
};
