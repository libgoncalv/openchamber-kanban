import type { HostClient } from '@openchamber/sdk';
import { adoptionPlaceholderTitles, isRealSessionTitle } from '../domain/autoTask.ts';
import { TITLE_MAX, applyPatch, type Task } from '../domain/task.ts';
import { loadTasks, saveTask } from './taskStore.ts';

type Storage = Pick<HostClient, 'storage'>;

/** One card's promotion candidate: the linked session and the real title the live snapshot reported for it. */
export type TitlePromotionInput = {
  taskId: string;
  sessionId: string;
  /** The snapshot title; checked real by the caller (`isRealSessionTitle`) and re-clamped here. */
  sessionTitle: string;
  /** The project's registered name as the promoting surface knows it, null unresolvable — one placeholder form. */
  projectName: string | null;
};

/**
 * What one call ended as. `promoted: true` means this call's write is the
 * one that landed in storage; `promoted: false` means storage already knew
 * better — the card was renamed, or promoted, by another surface — and
 * `task` carries the fresh record so the caller's view converges. `null`
 * means the task is gone from storage; the caller's next reload drops it
 * from the view, nothing further to do here.
 */
export type TitlePromotionOutcome = { promoted: boolean; task: Task } | null;

/**
 * The promotion write behind `host/titlePromotion.ts`: the card adoption
 * named with a placeholder takes its session's real, agent-generated title
 * once one exists. The write reads storage freshly (the adoption write's
 * discipline, `store/adoptOps.ts`): this surface's task list can be a
 * moment stale, and a card the user renamed in the other surface must never
 * be clobbered back — the stored record is re-checked against exactly the
 * placeholder texts adoption leaves (see `adoptionPlaceholderTitles`)
 * before anything is saved. Two open surfaces promoting the same card write
 * the same title value, so unlike adoption there is no tie-break to run;
 * the loser's `promoted: false` answer still carries the fresh record, and
 * both views converge.
 */
export const promoteSessionTitle = async (host: Storage, input: TitlePromotionInput): Promise<TitlePromotionOutcome> => {
  const { tasks } = await loadTasks(host);
  const current = tasks.find((task) => task.id === input.taskId);
  if (!current || current.sessionId !== input.sessionId) return null;
  // "No name yet" (the host's id fallback, or empty) promotes to nothing — the
  // sweep checks the same way; doubled here so the op is safe on its own.
  const nextTitle = isRealSessionTitle(input.sessionId, input.sessionTitle) ? input.sessionTitle.trim().slice(0, TITLE_MAX) : null;
  if (!nextTitle || current.title === nextTitle) return { promoted: false, task: current };
  if (!adoptionPlaceholderTitles(input.sessionId, input.projectName).includes(current.title)) return { promoted: false, task: current };
  const updated = applyPatch(current, { title: nextTitle });
  await saveTask(host, updated);
  return { promoted: true, task: updated };
};
