import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { createServiceServer } from '../src/service/server.ts';
import type { Transcriber } from '../src/service/recognizer.ts';
import type { AgentStore } from '../src/service/agentStore.ts';
import type { AgentJournalEntry, MirrorDoc } from '../src/domain/agentChannel.ts';

/** In-memory store: the routes are parameterised by the store, so the HTTP matrix needs no disk. */
const fakeStore = (full = false): AgentStore => {
  let mirror: MirrorDoc | null = null;
  const pending: AgentJournalEntry[] = [];
  return {
    readMirror: async () => mirror,
    writeMirror: async (doc) => { mirror = doc; },
    pendingCount: async () => pending.length,
    readPending: async () => [...pending],
    appendPending: async (entries) => {
      if (pending.length + entries.length > (full ? 0 : 200)) throw new Error('Journal is full');
      pending.push(...entries);
    },
    ackPending: async (ids) => {
      const acked = new Set(ids);
      for (let index = pending.length - 1; index >= 0; index -= 1) {
        if (acked.has(pending[index]!.id)) pending.splice(index, 1);
      }
    },
  };
};

const transcriber: Transcriber = { transcribe: async () => 'fake' };

const withServer = async (
  agent: { token: string; store: AgentStore; notifyChange?: (pendingCount: number) => void; notifyBoardChange?: () => void } | null,
  run: (requester: Requester) => Promise<void>,
) => {
  const server = createServiceServer({
    token: 'host-token',
    git: async () => ({ ok: true, stdout: '' }),
    transcriber,
    agent,
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = (server.address() as AddressInfo).port;
  const base = `http://127.0.0.1:${port}`;
  const requester: Requester = async (method, path, body, bearer) => {
    const response = await fetch(`${base}${path}`, {
      method,
      headers: {
        ...(bearer === null ? {} : { Authorization: `Bearer ${bearer}` }),
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    return { status: response.status, json: (await response.json().catch(() => null)) as any };
  };
  try { await run(requester); }
  finally { await new Promise<void>((resolve) => server.close(() => resolve())); }
};
type Requester = (method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH', path: string, body?: unknown, bearer?: string | null) => Promise<{ status: number; json: any }>;

const HOST = 'host-token';
const AGENT = 'agent-token';

test('without a configured agent channel, the /agent/ subtree 404s and the host keeps everything else', async () => {
  await withServer(null, async (call) => {
    assert.equal((await call('GET', '/agent/tasks', undefined, HOST)).status, 404);
    assert.equal((await call('GET', '/agent/tasks', undefined, AGENT)).status, 401);
    assert.equal((await call('GET', '/branches?directory=/x', undefined, HOST)).status, 200);
  });
});

test('unknown and missing tokens are 401 on every route, exactly as before', async () => {
  await withServer({ token: AGENT, store: fakeStore() }, async (call) => {
    assert.equal((await call('GET', '/agent/tasks')).status, 401);
    assert.equal((await call('GET', '/agent/tasks', undefined, 'wrong')).status, 401);
    assert.equal((await call('GET', '/branches?directory=/x')).status, 401);
  });
});

test('the agent token reaches only the agent routes: sync routes and the historical ones are 403', async () => {
  await withServer({ token: AGENT, store: fakeStore() }, async (call) => {
    assert.equal((await call('PUT', '/agent/mirror', { v: 1, savedAt: 1, projects: [], tasks: [] }, AGENT)).status, 403);
    assert.equal((await call('GET', '/agent/pending', undefined, AGENT)).status, 403);
    assert.equal((await call('POST', '/agent/pending/ack', { ids: [] }, AGENT)).status, 403);
    assert.equal((await call('GET', '/branches?directory=/x', undefined, AGENT)).status, 403);
    assert.equal((await call('POST', '/transcribe/cancel', {}, AGENT)).status, 403);
  });
});

test('the board (host token) writes the mirror and reads/acks the pending journal', async () => {
  await withServer({ token: AGENT, store: fakeStore() }, async (call) => {
    const doc = { v: 1, savedAt: 5, projects: [{ id: 'p1', name: 'repo', directory: '/repo' }], tasks: [{ id: 't_mirror1', title: 'One', description: '', status: 'todo', projectId: 'p1', projectName: 'repo', sessionId: null, updatedAt: 5, notes: [] }] };
    const pushed = await call('PUT', '/agent/mirror', doc, HOST);
    assert.deepEqual(pushed.json, { saved: true, tasks: 1 });
    // The listed tasks are exactly what the board pushed (view is the mirror's shape).
    assert.deepEqual((await call('GET', '/agent/tasks', undefined, HOST)).json.tasks, doc.tasks);
    // A junk mirror is refused, not stored.
    assert.equal((await call('PUT', '/agent/mirror', { nonsense: true }, HOST)).status, 400);

    // Queue from the agent token, read and ack from the host token.
    const queued = await call('POST', '/agent/tasks', { title: 'From an agent', directory: '/repo/worktrees/w1' }, AGENT);
    assert.equal(queued.status, 200);
    assert.equal(queued.json.queued, true);
    assert.equal(queued.json.projectId, 'p1');
    assert.equal(queued.json.projectName, 'repo');
    assert.equal(queued.json.pending, 1);
    const pending = (await call('GET', '/agent/pending', undefined, HOST)).json.pending;
    assert.equal(pending.length, 1);
    assert.equal(pending[0].kind, 'create');
    assert.equal(pending[0].status, 'backlog');
    const acked = await call('POST', '/agent/pending/ack', { ids: [pending[0].id] }, HOST);
    assert.deepEqual(acked.json, { acked: 1, remaining: 0 });
    // An agent can neither see nor erase the journal.
    assert.equal((await call('GET', '/agent/pending', undefined, AGENT)).status, 403);
  });
});

test('an agent queues a task; malformed bodies answer 400 with a reason, and unknown note targets answer 404', async () => {
  await withServer({ token: AGENT, store: fakeStore() }, async (call) => {
    const doc = { v: 1, savedAt: 5, projects: [{ id: 'p1', name: 'repo', directory: '/repo' }], tasks: [{ id: 't_mirror1', title: 'One', description: '', status: 'todo', projectId: 'p1', projectName: 'repo', sessionId: null, updatedAt: 5, notes: [] }] };
    await call('PUT', '/agent/mirror', doc, HOST);

    assert.equal((await call('POST', '/agent/tasks', { nonsense: true }, AGENT)).status, 400);
    assert.equal((await call('POST', '/agent/tasks', 'not json', AGENT)).status, 400);
    const noTitle = (await call('POST', '/agent/tasks', { description: 'x' }, AGENT)).json.error;
    assert.match(noTitle, /title/i);
    const badStatus = (await call('POST', '/agent/tasks', { title: 't', status: 'done' }, AGENT)).json.error;
    assert.match(badStatus, /backlog/);
    const unmapped = (await call('POST', '/agent/tasks', { title: 't', directory: '/nowhere' }, AGENT)).json;
    assert.equal(unmapped.queued, true);
    assert.equal(unmapped.projectId, null);
    assert.match(unmapped.warning, /directory/);

    assert.equal((await call('POST', '/agent/tasks/t_absent/note', { text: 'x' }, AGENT)).status, 404);
    assert.equal((await call('POST', '/agent/tasks/not-an-id/note', { text: 'x' }, AGENT)).status, 404);
    const noted = await call('POST', '/agent/tasks/t_mirror1/note', { text: 'wrap-up' }, AGENT);
    assert.equal(noted.json.queued, true);
    const pending = (await call('GET', '/agent/pending', undefined, HOST)).json.pending;
    const note = pending.find((entry: AgentJournalEntry) => entry.kind === 'note');
    assert.equal(note.taskId, 't_mirror1');
    assert.equal(note.text, 'wrap-up');
  });
});

test('a journal left full by the board answers 429 with what to do', async () => {
  await withServer({ token: AGENT, store: fakeStore(true) }, async (call) => {
    await call('PUT', '/agent/mirror', { v: 1, savedAt: 1, projects: [], tasks: [] }, HOST);
    const refused = await call('POST', '/agent/tasks', { title: 't' }, AGENT);
    assert.equal(refused.status, 429);
    assert.match(refused.json.error, /open any Kanban surface/i);
  });
});

test('a mirror push fires the board-change emit; agent writes fire the pending-count emit', async () => {
  const boardChanges: number[] = [];
  const agentChanges: number[] = [];
  await withServer({
    token: AGENT,
    store: fakeStore(),
    notifyChange: (count) => agentChanges.push(count),
    notifyBoardChange: () => boardChanges.push(1),
  }, async (call) => {
    await call('PUT', '/agent/mirror', { v: 1, savedAt: 5, projects: [], tasks: [] }, HOST);
    assert.equal(boardChanges.length, 1, 'every accepted push signals the open surfaces');
    assert.equal((await call('PUT', '/agent/mirror', { nonsense: true }, HOST)).status, 400);
    assert.equal(boardChanges.length, 1, 'a refused push signals nothing');
    await call('POST', '/agent/tasks', { title: 'From an agent', directory: '/repo' }, AGENT);
    assert.equal(agentChanges.length, 1);
    assert.equal(agentChanges[0], 1);
  });
});

test('an unknown /agent/ route is a plain 404, not a crash', async () => {
  await withServer({ token: AGENT, store: fakeStore() }, async (call) => {
    assert.equal((await call('GET', '/agent/nothing', undefined, AGENT)).status, 404);
    assert.equal((await call('DELETE', '/agent/tasks', undefined, HOST)).status, 404);
  });
});
