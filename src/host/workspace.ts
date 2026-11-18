import { HostRequestError, type GuestProject, type GuestSessionRecord, type GuestSessionsSnapshot, type GuestWorktree, type GuestWorktreesSnapshot, type HostClient } from '@openchamber/sdk';

export type WorkspaceHost = Pick<HostClient, 'onProjects' | 'onSessions' | 'onWorktrees' | 'openSession'>;

export type ProjectsState = { state: 'loading' | 'ready' | 'error'; projects: GuestProject[] };

/** Live project list from OpenChamber. Returns an unsubscribe function. */
export const watchProjects = async (host: WorkspaceHost, listener: (state: ProjectsState) => void) =>
  host.onProjects((snapshot) => listener({ state: snapshot.state, projects: snapshot.projects }));

export type ProjectsResult = { complete: boolean; projects: GuestProject[] };

/**
 * One-off project list — same resolve/release shape as `fetchSessions`. The
 * board keeps a live list from `watchProjects`; this covers the window before
 * that first snapshot (an agent-journal pull on the very first load needs
 * real project directories to place agent-created tasks).
 */
export const fetchProjects = (host: WorkspaceHost, timeoutMs = 8000): Promise<ProjectsResult> =>
  new Promise((resolve, reject) => {
    let last: { state: string; projects: GuestProject[] } | null = null;
    let settled = false;
    let release: (() => void) | null = null;
    const finish = (snapshot: { state: string; projects: GuestProject[] } | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      release?.();
      resolve({ complete: snapshot?.state === 'ready', projects: snapshot?.projects ?? [] });
    };
    const timer = setTimeout(() => finish(last), timeoutMs);
    host.onProjects((snapshot) => {
      last = snapshot;
      if (snapshot.state !== 'loading') finish(snapshot);
    }).then((stop) => {
      release = stop;
      if (settled) stop();
    }, (error: unknown) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(error);
    });
  });

export type SessionsResult = { complete: boolean; sessions: GuestSessionRecord[]; allSessions: GuestSessionRecord[] };

/**
 * One-off session list for a project. Subscribes, resolves on the first
 * `ready`/`error` snapshot (or the last one seen after `timeoutMs`), then
 * releases the subscription so it never counts against the 32-per-frame cap.
 */
export const fetchSessions = (host: WorkspaceHost, projectId: string, timeoutMs = 8000): Promise<SessionsResult> =>
  new Promise((resolve, reject) => {
    let last: GuestSessionsSnapshot | null = null;
    let settled = false;
    let release: (() => void) | null = null;
    const finish = (snapshot: GuestSessionsSnapshot | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      release?.();
      const allSessions = (snapshot?.sessions ?? [])
        .filter((session) => session.parentId === null)
        .sort((a, b) => b.updatedAt - a.updatedAt);
      const sessions = allSessions.filter((session) => session.archivedAt === null);
      resolve({ complete: snapshot?.state === 'ready', sessions, allSessions });
    };
    const timer = setTimeout(() => finish(last), timeoutMs);
    host.onSessions(projectId, (snapshot) => {
      last = snapshot;
      if (snapshot.state !== 'loading') finish(snapshot);
    }).then((stop) => {
      release = stop;
      if (settled) stop();
    }, (error: unknown) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(error);
    });
  });

export type WorktreesResult = { complete: boolean; worktrees: GuestWorktree[] };

/** One-off worktree list for a project, same resolve/release pattern as `fetchSessions`. */
export const fetchWorktrees = (host: WorkspaceHost, projectId: string, timeoutMs = 8000): Promise<WorktreesResult> =>
  new Promise((resolve, reject) => {
    let last: GuestWorktreesSnapshot | null = null;
    let settled = false;
    let release: (() => void) | null = null;
    const finish = (snapshot: GuestWorktreesSnapshot | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      release?.();
      resolve({ complete: snapshot?.state === 'ready', worktrees: snapshot?.worktrees ?? [] });
    };
    const timer = setTimeout(() => finish(last), timeoutMs);
    host.onWorktrees(projectId, (snapshot) => {
      last = snapshot;
      if (snapshot.state !== 'loading') finish(snapshot);
    }).then((stop) => {
      release = stop;
      if (settled) stop();
    }, (error: unknown) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(error);
    });
  });

export const projectForDirectory = (projects: readonly GuestProject[], directory: string | null) => {
  if (!directory) return null;
  const exact = projects.find((project) => project.directory === directory);
  if (exact) return exact;
  return projects
    .filter((project) => directory.startsWith(`${project.directory}/`))
    .sort((a, b) => b.directory.length - a.directory.length)[0] ?? null;
};

export const describeHostError = (error: unknown) => {
  if (error instanceof HostRequestError) {
    switch (error.code) {
      case 'NOT_GRANTED': return 'This needs the "sessions" permission. Approve it in Settings → Extensions.';
      case 'DISABLED': return 'The extension is paused in Settings → Extensions.';
      case 'HOST_UNAVAILABLE': return 'Not running inside OpenChamber.';
      case 'HOST_TIMEOUT': return 'OpenChamber did not answer in time. Try again.';
      case 'NOT_FOUND': return 'That session no longer exists.';
      default: return `${error.code}: ${error.message}`;
    }
  }
  return error instanceof Error ? error.message : String(error);
};

