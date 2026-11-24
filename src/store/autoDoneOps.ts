import type { HostClient } from '@openchamber/sdk';
import { applyPatch, type Task } from '../domain/task.ts';
import { autoDoneMove } from './taskOps.ts';
import { loadTasks, saveTask } from './taskStore.ts';

type Storage = Pick<HostClient, 'storage'>;

/**
 * The auto-done rule's two writes as shared ops — the pattern `adoptOps.ts`
 * set, carried to the rule that lands a visited, committed Review card in
 * Done: the page runs it, and (since the rail learned the rule) the rail's
 * own watcher reaches the same two writes, so "a reviewed card goes Done
 * while the user watches" holds whichever surface is open. Done itself
 * stays exactly what it always was on the page: your ✓ and Move-to clicks
 * write through their own ops, agent activity never implies it, and the
 * channel can never touch it — this op is the rule's single implementation,
 * not a second writer with its own opinion.
 *
 * The write reads storage freshly instead of trusting the caller's list
 * (a board may have moved, saved, or re-checked the card moments ago while
 * the commit check was in flight), re-runs the pure move's checks on what
 * is actually stored, and saves only when they still pass. Two open
 * surfaces racing the same conclusion write the same record — the same
 * Done stamp, the same `autoDoneCommit` guard, the same marker clear — so
 * the last save's content equals the first's and no tie-break is needed;
 * the guard also makes a second call with the same HEAD a null, not a
 * redundant write.
 */

/**
 * Lands the task in Done with the worktree HEAD as the guard, if what is
 * stored still qualifies (in Review, guard not already this HEAD). `null`
 * when the card moved, died, or the commit already fired the rule — no
 * write, silently.
 */
export const applyAutoDone = async (host: Storage, taskId: string, commitSha: string): Promise<Task | null> => {
  const fresh = await loadTasks(host);
  const current = fresh.tasks.find((task) => task.id === taskId);
  if (!current || current.autoDoneCommit === commitSha) return null;
  const moved = autoDoneMove(current, commitSha);
  if (moved === null) return null;
  await saveTask(host, moved);
  return moved;
};

/**
 * The observed-read write: the host reports the card's session was opened
 * somewhere else, so the stored unseen marker gives way if it is still
 * there — the badge and the unseen count converge on the next render.
 * `null` when the marker is already gone (another surface cleared it, the
 * visit was this surface's click, or the task died).
 */
export const applyObservedRead = async (host: Storage, taskId: string): Promise<Task | null> => {
  const fresh = await loadTasks(host);
  const current = fresh.tasks.find((task) => task.id === taskId);
  if (!current || current.needsAttentionSince === null) return null;
  const updated = applyPatch(current, { needsAttentionSince: null });
  await saveTask(host, updated);
  return updated;
};
