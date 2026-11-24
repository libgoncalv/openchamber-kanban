// Agent channel routes for the local service — how an OpenCode agent in one
// of the board's projects reads the board and queues changes to it. Two
// bearer tokens share this HTTP surface: the host's (`OPENCHAMBER_SERVICE_TOKEN`,
// what the panel's serviceRequest carries) and the channel's own agent token.
// The agent token reaches only the agent routes (`GET /agent/tasks`,
// `POST /agent/tasks`, notes); the host token reaches everything, including
// the sync routes the board page uses (mirror push, pending pull, ack) — an
// agent can never read or acknowledge the journal, so it can never erase what
// the board has not yet applied.
//
// Writes are queued, never applied here: the service has no host.storage
// access, and every open Kanban surface (the board page, its expanded-panel
// twin, the rail mirror) applies the journal through the shared op
// (`store/agentApply.ts`). Everything accepted lands in the journal
// (`AgentStore`) and notifies the panel (`notifyChange` → `emit`); when no
// surface is open, the journal simply waits for the next drain — the queue
// on disk is what survives nothing being open.
import { randomBytes } from 'node:crypto';
import {
  AGENT_CHANNEL_VERSION, AGENT_JOURNAL_MAX,
  parseAgentCreateRequest, parseAgentNoteRequest, parseMirrorDoc,
  resolveDirectoryToProject,
  type AgentJournalEntry,
} from '../domain/agentChannel.ts';
import type { AgentStore } from './agentStore.ts';
import type { RouteAnswer } from './transcribe.ts';

export type AgentRouteScope = 'agent' | 'host';

export type AgentRouteDeps = {
  store: AgentStore;
  /** Fired after every accepted write, with the pending count. The host's emit has its own rate cap; failures here are ignored — the journal persists regardless. */
  notifyChange?: (pendingCount: number) => void;
  /**
   * Fired after an accepted mirror push (`PUT /agent/mirror`), the board
   * signalling a board-side change: the surfaces that are open (page frames
   * and the rail) hear the emit and re-read storage within their debounce,
   * so a hand edit or the page-only writes converge without waiting for
   * their own low-cadence pass. Failures ignored; the journal stays the
   * durable truth.
   */
  notifyBoardChange?: () => void;
};

const TASK_ID_PATTERN = /^t_[a-z0-9]{6,40}$/;

const ok = (json: Record<string, unknown>): RouteAnswer => ({ status: 200, json });
const fail = (status: number, error: string): RouteAnswer => ({ status, json: { error } });

const parseBody = (body: string): Record<string, unknown> | null => {
  try {
    const parsed: unknown = JSON.parse(body);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as Record<string, unknown>;
    return null;
  } catch { return null; }
};

const newEntryId = () => `a_${randomBytes(16).toString('hex')}`;

/**
 * The route handlers, parameterised by the store so tests need no disk and no
 * real service. Answers `null` for anything that is not an `/agent/` route —
 * the caller (server.ts) 404s it — and enforces the scope split itself: every
 * sync route (mirror push, pending, ack) answers 403 on the agent token,
 * so the two token classes stay cleanly separated even as routes grow.
 */
export const createAgentTaskRoutes = ({ store, notifyChange, notifyBoardChange }: AgentRouteDeps) => {
  const handle = async (method: string, pathname: string, body: string, scope: AgentRouteScope): Promise<RouteAnswer | null> => {
    if (!pathname.startsWith('/agent/')) return null;
    const isHost = scope === 'host';

    // ---- Board sync routes (host token only) ----
    if (pathname === '/agent/mirror' && method === 'PUT') {
      if (!isHost) return fail(403, 'The mirror is written by the board; agents read it via GET /agent/tasks');
      const parsed = body ? parseBody(body) : null;
      const doc = parsed ? parseMirrorDoc(parsed) : null;
      if (doc === null) return fail(400, 'Request body must be a mirror document');
      await store.writeMirror(doc);
      // The push doubles as the board's change signal: any open surface
      // (mirror included) re-reads storage within the debounce. The emitting
      // caller owns the rate cap; a failure loses nothing — the poll passes
      // stay.
      if (notifyBoardChange) {
        try { notifyBoardChange(); } catch { /* surfaces catch up on their next pass anyway */ }
      }
      return ok({ saved: true, tasks: doc.tasks.length });
    }
    if (pathname === '/agent/pending' && method === 'GET') {
      if (!isHost) return fail(403, 'The pending journal is read by the board only');
      return ok({ pending: await store.readPending() });
    }
    if (pathname === '/agent/pending/ack' && method === 'POST') {
      if (!isHost) return fail(403, 'Acknowledging journal entries is the board\'s job');
      const parsed = body ? parseBody(body) : null;
      const rawIds = parsed && Array.isArray((parsed as { ids?: unknown }).ids) ? (parsed as { ids: unknown[] }).ids : null;
      if (rawIds === null || rawIds.some((id) => typeof id !== 'string')) return fail(400, 'Request body must be { ids: string[] }');
      const ids = rawIds.slice(0, AGENT_JOURNAL_MAX) as string[];
      await store.ackPending(ids);
      return ok({ acked: ids.length, remaining: await store.pendingCount() });
    }

    // ---- Agent routes ----
    if (pathname === '/agent/tasks' && method === 'GET') {
      const mirror = await store.readMirror();
      return ok({ tasks: mirror?.tasks ?? [], savedAt: mirror?.savedAt ?? null });
    }
    if (pathname === '/agent/tasks' && method === 'POST') {
      const parsed = body ? parseBody(body) : null;
      if (parsed === null) return fail(400, 'Request body must be JSON');
      let request;
      try { request = parseAgentCreateRequest(parsed); } catch (error) {
        return fail(400, error instanceof Error ? error.message : 'Invalid request');
      }
      const mirror = await store.readMirror();
      const projectId = resolveDirectoryToProject(mirror?.projects ?? [], request.directory);
      const entry: AgentJournalEntry = {
        id: newEntryId(), v: AGENT_CHANNEL_VERSION, kind: 'create', at: Date.now(),
        title: request.title, description: request.description,
        directory: request.directory, projectId, status: request.status,
      };
      return queue(entry, (queued) => ({
        projectId: queued.kind === 'create' ? queued.projectId : undefined,
        projectName: mirror?.projects.find((project) => project.id === projectId)?.name ?? null,
        warning: request.directory !== null && projectId === null
          ? 'directory did not match a project of this board — the task will be created without one'
          : undefined,
      }));
    }
    if (pathname.startsWith('/agent/tasks/') && pathname.endsWith('/note') && method === 'POST') {
      const taskId = decodeURIComponent(pathname.slice('/agent/tasks/'.length, -'/note'.length));
      if (!TASK_ID_PATTERN.test(taskId)) return fail(404, 'Unknown task id — GET /agent/tasks lists the board');
      const parsed = body ? parseBody(body) : null;
      if (parsed === null) return fail(400, 'Request body must be JSON');
      let request;
      try { request = parseAgentNoteRequest(parsed); } catch (error) {
        return fail(400, error instanceof Error ? error.message : 'Invalid request');
      }
      const mirror = await store.readMirror();
      if (!mirror || !mirror.tasks.some((task) => task.id === taskId)) {
        return fail(404, `No task ${taskId} on the board — GET /agent/tasks lists the board`);
      }
      const entry: AgentJournalEntry = {
        id: newEntryId(), v: AGENT_CHANNEL_VERSION, kind: 'note', at: Date.now(), taskId, text: request.text,
      };
      return queue(entry, () => ({}));
    }
    return null;
  };

  /** Appends one entry to the journal, answers the queued receipt — or 429 when the board has not caught up yet, before this write is lost. */
  const queue = async (
    entry: AgentJournalEntry,
    extra: (entry: AgentJournalEntry) => Record<string, unknown>,
  ): Promise<RouteAnswer> => {
    try {
      await store.appendPending([entry]);
    } catch {
      const count = await store.pendingCount().catch(() => 0);
      return fail(
        429,
        `The journal has ${count} pending agent changes it has not applied yet — open any Kanban surface (the panel or the page) so it catches up, then retry.`,
      );
    }
    const count = await store.pendingCount().catch(() => 0);
    if (notifyChange) {
      try { notifyChange(count); } catch { /* the panel reloads on its next poll anyway */ }
    }
    return ok({ queued: true, id: entry.id, at: entry.at, pending: count, ...extra(entry) });
  };

  return { handle };
};
