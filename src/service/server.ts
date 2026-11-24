// Builds the loopback HTTP server the host spawns and proxies to. Every
// request must carry the host-set bearer token; the panel never sees it.
// Extracted from main.ts so the HTTP surface itself is testable without
// starting anything real (tests inject the git and transcriber behaviour).
import http from 'node:http';
import path from 'node:path';
import { parseGitRefOutput } from '../domain/worktree.ts';
import { createTranscribeRoutes } from './transcribe.ts';
import type { Transcriber } from './recognizer.ts';
import { createAgentTaskRoutes } from './agentRoutes.ts';
import type { AgentStore } from './agentStore.ts';

export type ServiceGit = (directory: string, args: string[]) => Promise<
  { ok: true; stdout: string } | { ok: false; status: number; error: string }
>;

/**
 * The agent channel, optional because a host without `SERVICE_DATA_DIR` (or a
 * data dir that could not be set up) simply runs without it and the subtree
 * 404s. Two tokens share the surface: `token` is the host's (what the panel's
 * serviceRequest carries and the approval dialog's grant implies); `agent.token`
 * is the channel's own, minted once per install and advertised in the data
 * dir's agent.json. The agent token reaches only the agent routes — git and
 * dictation stay host-only.
 */
export type ServiceAgent = {
  token: string;
  store: AgentStore;
  /** Fired after an accepted agent write: the host's `emit`, so an open board refreshes without waiting for its own poll. */
  notifyChange?: (pendingCount: number) => void;
  /** Fired after an accepted mirror push: the host's `emit`, so open surfaces converge on a board-side write without waiting for their poll. */
  notifyBoardChange?: () => void;
};

export type ServiceDeps = {
  token: string;
  git: ServiceGit;
  transcriber: Transcriber;
  agent?: ServiceAgent | null;
};

/** A request body is at most a few wire chunks; anything larger is refused. */
const BODY_MAX = 131_072;

/**
 * What a `base` may be for the commits-ahead route: a plain, refish,
 * single word (no leading dash, `.` and friends excluded by the range
 * composition itself) — the route runs `includes('..')` on top, before
 * git ever sees the composed range. A deleted branch still matches the
 * pattern; git answers the failure, which the page reads as unknown
 * evidence, never a write.
 */
const COMMIT_BASE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._/-]*$/;

/**
 * What a `since` may be for the commits-ahead route: a plain digit run, at
 * most 15 digits (epoch milliseconds fits in 13 until the year 33658), so
 * `parseInt` can never reinterpret a crafted prefix. The route turns it
 * into git's space-separated ISO date in UTC, a format its parser takes
 * verbatim, never a shell or composite.
 */
const SINCE_MS_PATTERN = /^\d{1,15}$/;

/** Epoch milliseconds to the ISO-like date git's `--since` parses exactly: `2026-11-18 10:00:00 +0000`. */
const sinceIsoUtc = (ms: number): string => {
  const iso = new Date(ms).toISOString();
  return `${iso.slice(0, 10)} ${iso.slice(11, 19)} +0000`;
};

const readBody = (req: http.IncomingMessage): Promise<string | null> =>
  new Promise((resolve) => {
    let size = 0;
    const parts: Buffer[] = [];
    let done = false;
    const finish = (value: string | null) => {
      if (!done) {
        done = true;
        resolve(value);
      }
    };
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > BODY_MAX) {
        finish(null);
        req.destroy();
        return;
      }
      parts.push(chunk);
    });
    req.on('end', () => finish(Buffer.concat(parts).toString('utf8')));
    req.on('error', () => finish(null));
  });

const json = (res: http.ServerResponse, status: number, body: unknown): void => {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
};

/**
 * Builds the HTTP server. `GET /health` (the host polls it to decide
 * readiness — without a real answer the service never becomes usable, so it
 * stays the one route that answers without auth), the local git-branch route,
 * the dictation routes, and the agent channel's routes. A crashed handler
 * answers a clean 500, never a hung request.
 */
export const createServiceServer = ({ token, git, transcriber, agent }: ServiceDeps): http.Server => {
  const transcribe = createTranscribeRoutes(transcriber);
  const agentRoutes = agent ? createAgentTaskRoutes({ store: agent.store, notifyChange: agent.notifyChange, notifyBoardChange: agent.notifyBoardChange }) : null;

  return http.createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://127.0.0.1');

    if (url.pathname === '/health') {
      json(res, 200, { ok: true });
      return;
    }

    // Two token classes: the host's (panel serviceRequest) and, when the
    // channel is configured, the agent's. Unknown or missing is 401 exactly
    // as before.
    const authorization = req.headers.authorization;
    const hostAuth = authorization === `Bearer ${token}`;
    const agentAuth = Boolean(agent) && authorization === `Bearer ${agent?.token}`;
    if (!hostAuth && !agentAuth) {
      json(res, 401, { error: 'unauthorized' });
      return;
    }

    void (async () => {
      try {
        // The agent channel subtree. Its handler enforces the scope split
        // (sync routes answer 403 on the agent token), so the token classes
        // stay cleanly separated even as routes grow.
        if (url.pathname.startsWith('/agent/')) {
          if (!agentRoutes) {
            json(res, 404, { error: 'not-found' });
            return;
          }
          const body = req.method === 'GET' ? '' : await readBody(req);
          if (body === null) {
            json(res, 413, { error: 'Request body too large' });
            return;
          }
          const answer = await agentRoutes.handle(req.method ?? '', url.pathname, body, hostAuth ? 'host' : 'agent');
          if (answer === null) {
            json(res, 404, { error: 'not-found' });
            return;
          }
          json(res, answer.status, answer.json);
          return;
        }

        // The historical routes are the host's only: the channel's agent
        // token must never reach git or dictation.
        if (!hostAuth) {
          json(res, 403, { error: 'forbidden' });
          return;
        }

        if (req.method === 'GET' && url.pathname === '/branches') {
          const directory = url.searchParams.get('directory') ?? '';
          if (!path.isAbsolute(directory)) {
            json(res, 400, { error: 'bad-request' });
            return;
          }
          // Most-recently-active branches first, capped — some repositories have
          // thousands, far more than a dropdown can usefully hold.
          const result = await git(directory, ['for-each-ref', '--sort=-committerdate', '--count=200', '--format=%(refname)', 'refs/heads', 'refs/remotes']);
          if (!result.ok) {
            json(res, result.status, { error: result.error });
            return;
          }
          json(res, 200, { branches: parseGitRefOutput(result.stdout) });
          return;
        }

        if (req.method === 'GET' && url.pathname === '/commits-ahead') {
          const directory = url.searchParams.get('directory') ?? '';
          const base = url.searchParams.get('base');
          const since = url.searchParams.get('since');
          // Exactly one evidence mode: the worktree's base ref, or the
          // project root's link anchor. Anything else is bad request.
          if (!path.isAbsolute(directory) || (base === null) === (since === null)) {
            json(res, 400, { error: 'bad-request' });
            return;
          }
          let countArgs: string[];
          if (base !== null) {
            // The base becomes one argv element in `<base>..HEAD`, so it must
            // be a plain ref: no leading dash (an arg, not a ref), no `..`
            // inside (this is the range's left side), and only ref-ish
            // characters.
            if (!COMMIT_BASE_PATTERN.test(base) || base.includes('..')) {
              json(res, 400, { error: 'bad-request' });
              return;
            }
            countArgs = ['rev-list', '--count', `${base}..HEAD`];
          } else {
            const sinceRaw = since!;
            if (!SINCE_MS_PATTERN.test(sinceRaw)) {
              json(res, 400, { error: 'bad-request' });
              return;
            }
            countArgs = ['rev-list', '--count', `--since=${sinceIsoUtc(Number.parseInt(sinceRaw, 10))}`, 'HEAD'];
          }
          const count = await git(directory, countArgs);
          if (!count.ok) {
            json(res, count.status, { error: count.error });
            return;
          }
          const head = await git(directory, ['rev-parse', 'HEAD']);
          if (!head.ok) {
            json(res, head.status, { error: head.error });
            return;
          }
          const ahead = Number.parseInt(count.stdout.trim(), 10);
          if (!Number.isInteger(ahead) || ahead < 0) {
            json(res, 500, { error: 'unparseable rev-list output' });
            return;
          }
          json(res, 200, { ahead, head: head.stdout.trim() || null });
          return;
        }

        if (url.pathname.startsWith('/transcribe')) {
          const body = req.method === 'POST' ? await readBody(req) : '';
          if (body === null) {
            json(res, 413, { error: 'Request body too large' });
            return;
          }
          const routeAnswer = await transcribe.handle(req.method ?? '', url.pathname, body);
          json(res, routeAnswer.status, routeAnswer.json);
          return;
        }

        json(res, 404, { error: 'not-found' });
      } catch (error) {
        json(res, 500, { error: error instanceof Error ? error.message : String(error) });
      }
    })();
  });
};
