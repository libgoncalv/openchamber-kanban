// Runs under the app's Node runtime, on 127.0.0.1, only reachable through
// the host proxy (never directly by the sandboxed panel). Three jobs:
// 1. `git for-each-ref` with optional locks off, so it never blocks the
//    user's own git commands, and only for an absolute directory the panel
//    already knows about (one of the registered projects).
// 2. Voice dictation: local sherpa-onnx speech-to-text over /transcribe
//    routes (see server.ts / transcribe.ts) — fully offline, the model is
//    read from the user's config directory, never downloaded.
// 3. The agent channel (see agentRoutes.ts / agentStore.ts): agents read the
//    board mirror and queue tasks and notes into the journal. It publishes
//    the discovery file (agent.json) into this service's own data dir, where
//    a skill points agents at it.
import { execFile } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { chmod, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createServiceHost } from '@openchamber/sdk';
import { createServiceServer, type ServiceGit } from './server.ts';
import { createAgentStore } from './agentStore.ts';
import { createSherpaTranscriber } from './recognizer.ts';

const port = Number(process.env.OPENCHAMBER_SERVICE_PORT);
const token = process.env.OPENCHAMBER_SERVICE_TOKEN ?? '';
if (!port || !token) {
  console.error('OPENCHAMBER_SERVICE_PORT and OPENCHAMBER_SERVICE_TOKEN are required');
  process.exit(1);
}

/**
 * The agent channel's credentials and discovery, in the service's own data
 * dir (host-created, survives restarts, deleted with the extension). The
 * agent token is a persistent per-install secret (mode 0600, same trust as
 * the user's own files: every OpenCode session runs as the user); the
 * discovery file is rewritten at every spawn, because the host binds an
 * ephemeral port each time, and removed on a clean stop, so a dead service
 * never advertises a dead port.
 */
const AGENT_TOKEN_FILE = 'agent-token';
const DISCOVERY_FILE = 'agent.json';
const dataDir = process.env.OPENCHAMBER_SERVICE_DATA_DIR;

const createAgentChannel = async (dataDir: string, port: number) => {
  let agentToken = '';
  try {
    agentToken = (await readFile(join(dataDir, AGENT_TOKEN_FILE), 'utf8')).trim();
  } catch { /* created below */ }
  if (!agentToken) {
    agentToken = randomBytes(32).toString('hex');
    await writeFile(join(dataDir, AGENT_TOKEN_FILE), agentToken, { encoding: 'utf8', mode: 0o600 });
  } else {
    await chmod(join(dataDir, AGENT_TOKEN_FILE), 0o600).catch(() => undefined);
  }
  const store = createAgentStore({ dataDir });
  const writeDiscovery = async () => {
    // Temp file + rename: a reader never sees a half-written port. Rewritten
    // on every spawn because the host binds an ephemeral port each time.
    const temp = join(dataDir, `${DISCOVERY_FILE}.tmp`);
    await writeFile(temp, JSON.stringify({ v: 1, port, token: agentToken, pid: process.pid }), { encoding: 'utf8', mode: 0o600 });
    await rename(temp, join(dataDir, DISCOVERY_FILE));
  };
  await writeDiscovery();
  // A clean stop takes its advertisement with it: the discovery file and its
  // temp sibling both go (a kill between temp write and rename would leave a
  // 0600 stale copy otherwise). A crash leaves a stale port, and a connection
  // to it simply fails — the skill says so.
  for (const signal of ['SIGTERM', 'SIGINT'] as const) {
    process.on(signal, () => {
      void Promise.all([
        rm(join(dataDir, DISCOVERY_FILE), { force: true }),
        rm(join(dataDir, `${DISCOVERY_FILE}.tmp`), { force: true }),
      ]).catch(() => undefined)
        .finally(() => process.exit(0));
    });
  }
  let serviceHost: ReturnType<typeof createServiceHost> | null = null;
  const ensureServiceHost = () => {
    if (!serviceHost) serviceHost = createServiceHost({ env: process.env });
    return serviceHost;
  };
  const notifyChange = (pendingCount: number) => {
    void ensureServiceHost().emit('kanban-agent-change', { pendingCount }).catch(() => undefined);
  };
  const notifyBoardChange = () => {
    void ensureServiceHost().emit('kanban-board-change', {}).catch(() => undefined);
  };
  return { token: agentToken, store, notifyChange, notifyBoardChange };
};

let agent: Awaited<ReturnType<typeof createAgentChannel>> | null = null;
if (dataDir) {
  try { agent = await createAgentChannel(dataDir, port); }
  catch (error) { console.error('Agent channel disabled:', error instanceof Error ? error.message : error); }
}

type GitResult = { ok: true; stdout: string } | { ok: false; status: number; error: string };

const git: ServiceGit = (directory, args) => new Promise((resolve) => {
  execFile('git', ['-C', directory, ...args], {
    timeout: 8_000,
    maxBuffer: 2 * 1024 * 1024,
    env: { ...process.env, GIT_OPTIONAL_LOCKS: '0', GIT_TERMINAL_PROMPT: '0' },
  }, (error, stdout, stderr) => {
    if (!error) { resolve({ ok: true, stdout }); return; }
    if ('code' in error && error.code === 'ENOENT') { resolve({ ok: false, status: 500, error: 'git is not installed' }); return; }
    if (/not a git repository/i.test(stderr)) { resolve({ ok: false, status: 422, error: 'not a git repository' }); return; }
    resolve({ ok: false, status: 500, error: stderr.trim() || error.message });
  });
});

const server = createServiceServer({ token, git, transcriber: createSherpaTranscriber(), agent });
server.listen(port, '127.0.0.1');
