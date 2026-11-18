import type { GuestProject, HostClient } from '@openchamber/sdk';
import { buildMirrorDoc, parseJournalEntry, type AgentJournalEntry } from '../domain/agentChannel.ts';
import type { Task } from '../domain/task.ts';

export type AgentChannelHost = Pick<HostClient, 'serviceRequest'>;

/**
 * The board page's side of the agent channel — best-effort throughout, exactly
 * like `branchService.ts`: the service may be unapproved, paused, or mid-restart
 * (it dies on idle unless keepRunning holds it, and restarts on the next
 * request), and every failure here is `null`/`false` rather than an error the
 * board has to style. The journal on the service's disk is the durable truth;
 * a missed push or pull is retried by the next board load or the next event.
 */

const answer = (result: { status: number; body: string }): Record<string, unknown> | null => {
  if (result.status !== 200) return null;
  try {
    const parsed: unknown = JSON.parse(result.body);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as Record<string, unknown>;
    return null;
  } catch { return null; }
};

export const requestJson = async (host: AgentChannelHost, method: 'GET' | 'POST' | 'PUT', path: string, body?: unknown): Promise<Record<string, unknown> | null> => {
  try {
    const result = await host.serviceRequest({
      method,
      path,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    return answer(result);
  } catch {
    return null;
  }
};

/** Pushes the mirror so agents read the board as it is, not as it was. The description/notes cutting for the request-body cap lives in `buildMirrorDoc`. */
export const pushMirror = async (
  host: AgentChannelHost,
  tasks: readonly Task[],
  projects: readonly GuestProject[],
): Promise<boolean> => {
  const doc = buildMirrorDoc(tasks, projects, Date.now());
  const result = await requestJson(host, 'PUT', '/agent/mirror', doc);
  return result !== null;
};

/** Pulls the journal: entries queued while the board was closed. `null` on any service failure — silent, retried by the next load or event. */
export const fetchPendingEntries = async (host: AgentChannelHost): Promise<AgentJournalEntry[] | null> => {
  const result = await requestJson(host, 'GET', '/agent/pending');
  if (result === null || !Array.isArray(result.pending)) return null;
  return result.pending.flatMap((raw) => {
    try { return [parseJournalEntry(raw)]; } catch { return []; }
  });
};

/** Acknowledges exactly the applied entries; the rest stay pending. */
export const ackPendingEntries = async (host: AgentChannelHost, ids: readonly string[]): Promise<boolean> => {
  const result = await requestJson(host, 'POST', '/agent/pending/ack', { ids: [...ids] });
  return result !== null;
};
