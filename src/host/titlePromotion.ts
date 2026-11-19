import type { HostClient } from '@openchamber/sdk';
import { adoptionPlaceholderTitles, isRealSessionTitle } from '../domain/autoTask.ts';
import type { SessionLiveState } from '../domain/boardView.ts';
import type { Task } from '../domain/task.ts';
import { promoteSessionTitle } from '../store/titleOps.ts';

export type TitlePromotionHost = Pick<HostClient, 'storage'>;

export type TitlePromotionCallbacks = {
  /**
   * The write landed: this surface's view takes the promoted record (state
   * first, then render), nothing is saved here — the op already persisted.
   */
  onPromoted: (task: Task) => void;
  /**
   * Storage disagrees with this list: renamed, or promoted, by another
   * surface between sweeps. Converge the view on the fresh record, silently.
   */
  onStale: (task: Task) => void;
};

/**
 * The title promotion sweep — the last leg adoption leaves open. Adoption
 * (`store/adoptOps.ts`) writes a card the moment a session becomes
 * adoptable, which is usually before OpenCode's title agent has named the
 * session (the host reports the session id as the fallback title), so a
 * card can land with a "New session …" placeholder. Every trusted snapshot
 * carries the session's title in the live map (`SessionLiveState`); this
 * sweep offers each linked card still sitting on one of adoption's
 * placeholder texts the first real title it sees, and the shared op
 * (`store/titleOps.ts`) re-reads storage freshly so a card renamed anywhere
 * is never clobbered. At most one attempt per session per mount: the same
 * permanent guard adoption keeps, so a persistent storage failure cannot
 * retry once per snapshot tick — a manual reload's `reset` re-tries once.
 * Silent, the auto-done rule's way: the card simply gains its name.
 *
 * One sweep per surface (the page beside the rail, each running its own),
 * converging by value: both surfaces promote to the same title, and the
 * loser of a race converges on the fresh record through `onStale`.
 */
export const createTitlePromotion = (
  host: TitlePromotionHost,
  /** The sessionSync live provider (read-only), so snapshot state is shared, not duplicated. */
  live: () => ReadonlyMap<string, SessionLiveState>,
  /** The project's registered name as this surface knows it, null unresolvable — placeholder forms. */
  projectNameOf: (projectId: string | null) => string | null,
  callbacks: TitlePromotionCallbacks,
) => {
  let tasksById = new Map<string, Task>();
  /** Sessions this mount ever attempted, success, convergence, or failure. Cleared only by `reset` (a manual reload). */
  const attempted = new Set<string>();
  /** Promotions currently writing; one per session at a time, like the auto-done rule's checks. */
  const inFlight = new Set<string>();
  let disposed = false;

  const evaluate = () => {
    if (disposed) return;
    for (const task of tasksById.values()) {
      const sessionId = task.sessionId;
      if (sessionId === null || attempted.has(sessionId) || inFlight.has(sessionId)) continue;
      const state = live().get(sessionId);
      if (!state || !isRealSessionTitle(sessionId, state.title)) continue;
      if (!adoptionPlaceholderTitles(sessionId, projectNameOf(task.projectId)).includes(task.title)) continue;
      attempted.add(sessionId);
      inFlight.add(sessionId);
      void (async () => {
        try {
          const outcome = await promoteSessionTitle(host, {
            taskId: task.id,
            sessionId,
            sessionTitle: state.title,
            projectName: projectNameOf(task.projectId),
          });
          if (disposed || outcome === null) return;
          if (outcome.promoted) callbacks.onPromoted(outcome.task);
          else callbacks.onStale(outcome.task);
        } catch {
          // Silent, the auto-done way: `attempted` already stopped the
          // per-tick retries; the next `reset` (a manual reload) re-tries once.
        } finally {
          inFlight.delete(sessionId);
        }
      })();
    }
  };

  /** Call whenever the task list changes (reload, link, create, save) — the same channel `autoDoneSync` keeps. */
  const sync = (tasks: readonly Task[]) => {
    if (disposed) return;
    tasksById = new Map(tasks.map((task) => [task.id, task]));
    evaluate();
  };

  /** A manual or initial reload is a clean slate for the attempt guard, the same rule the page keeps over its adoption set. */
  const reset = () => {
    attempted.clear();
  };

  const dispose = () => {
    disposed = true;
    inFlight.clear();
  };

  return { sync, evaluate, reset, dispose };
};
