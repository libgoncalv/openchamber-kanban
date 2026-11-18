import type { GuestSessionsSnapshot, HostClient } from '@openchamber/sdk';
import { statusForSession, type SyncOptions } from '../domain/sync.ts';
import { sessionLinkState, type SessionGoneReason } from '../domain/unlink.ts';
import { type SessionLiveState } from '../domain/boardView.ts';
import type { Task, TaskStatus } from '../domain/task.ts';

export type SessionSyncHost = Pick<HostClient, 'onSessions'>;

export type SessionSyncListeners = {
  /** A snapshot changed the live map this surface displays from. */
  onLiveChange?: () => void;
  /** Any snapshot arrived, changed or not — the panel reloads storage on these. */
  onSnapshot?: () => void;
};

/**
 * Watches the live session state behind every task that has one linked, and
 * reports both the status change it implies and the disappearance of the
 * session itself (deleted or archived from the sidebar — the task's link
 * must not outlive what it points at). Subscribes once per distinct
 * project among those tasks (not once per task) and tears a project's
 * subscription down once no watched task still needs it.
 *
 * This is also the shared live-state provider behind both surfaces' boards:
 * every trusted (`ready`) snapshot rebuilds this project's
 * `SessionLiveState` entries in the `live` map keyed by session id, `loading`
 * keeps the last known state, and an `error` drops the project's entries so
 * rows fall back to their stored status — unknown is never displayed as new.
 * A project leaving the watched set also has its entries dropped, so an
 * unsubscribed project's stale activity can never display as if it were
 * live when it comes back into view.
 *
 * `onStatusChange` is the page's write path (agent-driven status changes);
 * a rail surface passes none and only reads `live` for display-only
 * regrouping — the same single-writer invariant as before.
 */
export const createSessionSync = (
  host: SessionSyncHost,
  options: SyncOptions,
  onStatusChange: ((taskId: string, next: TaskStatus) => void) | null,
  onSessionGone?: (taskId: string, sessionId: string, reason: SessionGoneReason) => void,
  listeners: SessionSyncListeners = {},
) => {
  const onLiveChange = listeners.onLiveChange;
  const onSnapshot = listeners.onSnapshot ?? (() => {});
  const subscriptions = new Map<string, Promise<() => void>>();
  let tasksById = new Map<string, Task>();
  /** Live agent state per session id, as trusted snapshots report it. */
  const liveState = new Map<string, SessionLiveState>();
  /** Last-seen directory per session id, so an absent session's per-directory coverage can still be checked. */
  const sessionDirectories = new Map<string, string>();
  let disposed = false;

  /** Rebuild this project's live entries; `ready` lists are complete, `error` means the truth is unknown, `loading` keeps the last known state. */
  const rebuildLive = (projectId: string, snapshot: GuestSessionsSnapshot): boolean => {
    if (snapshot.state === 'loading') return false;
    let dropped = 0;
    for (const [id, state] of liveState) if (state.projectId === projectId) { liveState.delete(id); dropped += 1; }
    if (snapshot.state !== 'ready') return dropped > 0;
    for (const session of snapshot.sessions) {
      if (session.parentId !== null) continue; // subagent sessions are never a task's chat
      // `unread` (host-side "opened since the last turn") feeds both the
      // display's seen check and the auto-done visit signal; a host
      // without the field reads as unknown, never as seen.
      liveState.set(session.id, { projectId, activity: session.activity, outcome: session.outcome, agent: session.agent ?? null, updatedAt: session.updatedAt, unread: session.unread ?? null });
    }
    return true;
  };

  const applySnapshot = (projectId: string, snapshot: GuestSessionsSnapshot) => {
    if (disposed) return;
    const liveChanged = rebuildLive(projectId, snapshot);
    if (liveChanged && onLiveChange) onLiveChange();
    onSnapshot();
    for (const session of snapshot.sessions) sessionDirectories.set(session.id, session.directory);
    if (onStatusChange) {
      for (const task of tasksById.values()) {
        if (task.projectId !== projectId || !task.sessionId) continue;
        const linkState = sessionLinkState(task.sessionId, sessionDirectories.get(task.sessionId) ?? null, snapshot);
        if (onSessionGone && (linkState === 'deleted' || linkState === 'archived')) {
          onSessionGone(task.id, task.sessionId, linkState);
          continue;
        }
        const session = snapshot.sessions.find((candidate) => candidate.id === task.sessionId);
        if (!session) continue;
        const next = statusForSession(task.status, session.activity, session.outcome, session.agent ?? null, options);
        if (next) onStatusChange(task.id, next);
      }
    }
  };

  const watch = (projectId: string) => {
    const promise = host.onSessions(projectId, (snapshot) => applySnapshot(projectId, snapshot));
    subscriptions.set(projectId, promise);
    void promise.then((stop) => {
      if (disposed || !subscriptions.has(projectId)) stop();
    }, () => undefined);
  };

  /** Call whenever the watched task list changes (reload, link, create, delete, move). */
  const sync = (tasks: readonly Task[]) => {
    if (disposed) return;
    tasksById = new Map(tasks.map((task) => [task.id, task]));
    const needed = new Set(tasks.filter((task) => task.sessionId && task.projectId).map((task) => task.projectId as string));
    for (const projectId of needed) if (!subscriptions.has(projectId)) watch(projectId);
    for (const [projectId, promise] of subscriptions) {
      if (needed.has(projectId)) continue;
      subscriptions.delete(projectId);
      // A project leaving the watched set also leaves its live behind: an
      // unsubscribed project's entries would go stale, and stale activity
      // must never display as if it were live when it comes back into view.
      for (const [id, state] of liveState) if (state.projectId === projectId) liveState.delete(id);
      void promise.then((stop) => stop(), () => undefined);
    }
  };

  const dispose = () => {
    disposed = true;
    for (const promise of subscriptions.values()) void promise.then((stop) => stop(), () => undefined);
    subscriptions.clear();
  };

  return {
    /** The live map to feed `buildBoardView`; treat as read-only. */
    live: (): ReadonlyMap<string, SessionLiveState> => liveState,
    sync,
    dispose,
  };
};
