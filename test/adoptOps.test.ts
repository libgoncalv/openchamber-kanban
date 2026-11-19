import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { HostClient, JsonValue } from '@openchamber/sdk';
import { createTask, type Task } from '../src/domain/task.ts';
import { loadTasks } from '../src/store/taskStore.ts';
import { adoptOrphanSession, type AdoptableSession } from '../src/store/adoptOps.ts';

/** In-memory stand-in for host.storage (same shape as the taskOps suite's). */
const fakeHost = () => {
  const data = new Map<string, string>();
  const host: Pick<HostClient, 'storage'> = {
    storage: {
      get: async (key) => (data.has(key) ? (JSON.parse(data.get(key)!) as JsonValue) : undefined),
      set: async (key, value) => { data.set(key, JSON.stringify(value)); },
      delete: async (key) => { data.delete(key); },
      keys: async () => [...data.keys()],
    },
  };
  return { host, data };
};

/** Deterministic, valid task ids (t_ + base36, no punctuation titles leaking in). */
let taskIdSeed = 0;
const stored = (title: string, rank: number, status: Task['status'], extra: Partial<Task> = {}): Task =>
  ({ ...createTask({ title, status }, rank, 1000, `t_${(++taskIdSeed).toString(36).padStart(6, '0')}`), needsAttentionSince: null, ...extra });

const session = (id: string, title = id, createdAt = 5000): AdoptableSession => ({ id, title, createdAt });

const seed = async (host: Pick<HostClient, 'storage'>, tasks: Task[]) => {
  for (const task of tasks) await host.storage.set(`task:${task.id}`, task as unknown as JsonValue);
};

test('adoptOrphanSession lands the card at the end of its column, linked, marker only for Review', async () => {
  const { host } = fakeHost();
  await seed(host, [
    stored('todo-a', 100, 'todo'),
    stored('working', 5000, 'in_progress'),
    stored('done-a', 300, 'done'),
  ]);
  const result = await adoptOrphanSession(host, { projectId: 'p1', session: session('ses_active', 'My session'), status: 'in_progress', projectName: null });
  assert.ok(result?.adopted);
  assert.deepEqual(
    { status: result.task.status, rank: result.task.rank, sessionId: result.task.sessionId, projectId: result.task.projectId, needsAttentionSince: null },
    { status: 'in_progress', rank: 5000 + 1024, sessionId: 'ses_active', projectId: 'p1', needsAttentionSince: null },
  );
  assert.equal(result.task.sessionLinkedAt, 5000, 'the anchor is the session birth, so its pre-adoption work still counts');
  const { tasks } = await loadTasks(host);
  assert.ok(tasks.find((t) => t.sessionId === 'ses_active'), 'the record is persisted');
});

test('adopting into Review scores the unseen marker from landings without one', async () => {
  const { host } = fakeHost();
  const result = await adoptOrphanSession(host, { projectId: 'p1', session: session('ses_idle'), status: 'review', projectName: null });
  assert.ok(result?.adopted);
  assert.equal(result.task.status, 'review');
  assert.equal(typeof result.task.needsAttentionSince, 'number');
  assert.equal(result.task.rank, 1024, 'an empty Review column starts the rank scale');
});

test('a session already linked to a stored task returns null and writes nothing', async () => {
  const { host, data } = fakeHost();
  await seed(host, [stored('linked', 100, 'in_progress', { sessionId: 'ses_linked' })]);
  const before = new Set(data.keys());
  const result = await adoptOrphanSession(host, { projectId: 'p1', session: session('ses_linked'), status: 'in_progress', projectName: null });
  assert.equal(result, null);
  assert.deepEqual(new Set(data.keys()), before);
});

test('the rank comes from storage, not the caller\' slice: a task added by another surface lands before the adoption', async () => {
  const { host } = fakeHost();
  await seed(host, [stored('late-writer', 9_999, 'in_progress')]);
  const result = await adoptOrphanSession(host, { projectId: 'p1', session: session('ses_new'), status: 'in_progress', projectName: null });
  assert.equal(result?.task.rank, 9_999 + 1024);
});

test('the project name shapes the title only inside the fallback', async () => {
  const { host } = fakeHost();
  const named = await adoptOrphanSession(host, { projectId: 'p1', session: session('ses_1', 'ses_1'), status: 'todo', projectName: 'Record' });
  const titled = await adoptOrphanSession(host, { projectId: 'p1', session: session('ses_2', 'Real title'), status: 'todo', projectName: 'Record' });
  assert.equal(named?.task.title, 'New session in Record');
  assert.equal(titled?.task.title, 'Real title');
});

test('two surfaces adopting in the same instant converge on one record, the smallest id', async () => {
  const { host } = fakeHost();
  const input = { projectId: 'p1', session: session('ses_race'), status: 'in_progress' as const, projectName: null };
  const [a, b] = await Promise.all([
    adoptOrphanSession(host, input),
    adoptOrphanSession(host, input),
  ]);
  const results = [a, b].filter((r): r is Exclude<typeof r, null> => r !== null);
  assert.equal(results.filter((r) => r.adopted).length, 1, 'exactly one call reports adoption');
  const survivor = results[0]!.task;
  for (const r of results) assert.equal(r.task.id, survivor.id, 'the loser carries the survivor so the views converge');
  const { tasks } = await loadTasks(host);
  const linked = tasks.filter((t) => t.sessionId === 'ses_race');
  assert.equal(linked.length, 1);
  assert.equal(linked[0]!.id, survivor.id);
});

test('a staggered adoption sees the other surface\'s record and stays out of it', async () => {
  const { host } = fakeHost();
  const input = { projectId: 'p1', session: session('ses_slow'), status: 'in_progress' as const, projectName: null };
  const first = await adoptOrphanSession(host, input);
  assert.ok(first?.adopted);
  const second = await adoptOrphanSession(host, input);
  assert.equal(second, null, 'the already-linked read short-circuits before any write');
});
