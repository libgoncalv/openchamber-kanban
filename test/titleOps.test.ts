import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { HostClient, JsonValue } from '@openchamber/sdk';
import { createTask, type Task } from '../src/domain/task.ts';
import { loadTasks } from '../src/store/taskStore.ts';
import { promoteSessionTitle, type TitlePromotionInput } from '../src/store/titleOps.ts';

/** In-memory stand-in for host.storage (same shape as the adoption suite's). */
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

/** Deterministic, valid task ids (t_ + base36). */
let taskIdSeed = 0;
const stored = (title: string, extra: Partial<Task> = {}): Task =>
  ({ ...createTask({ title, status: 'in_progress' }, 100, 1000, `t_${(++taskIdSeed).toString(36).padStart(6, '0')}`), needsAttentionSince: null, ...extra });

const seed = async (host: Pick<HostClient, 'storage'>, task: Task) => {
  await host.storage.set(`task:${task.id}`, task as unknown as JsonValue);
};

/** Unwraps the op's outcome so assertions read the fresh record without null gymnastics. */
const run = (host: Pick<HostClient, 'storage'>, input: TitlePromotionInput) =>
  promoteSessionTitle(host, input).then((result) => ({ promoted: result?.promoted === true, gone: result === null, fresh: result?.task ?? null }));

const snapshotOf = (data: Map<string, string>) => [...data.entries()].sort();

test('a placeholder card takes the real session title, persisted', async () => {
  const { host } = fakeHost();
  const task = stored('New session in Record', { sessionId: 'ses_1', projectId: 'p1' });
  await seed(host, task);
  const { promoted, gone, fresh } = await run(host, { taskId: task.id, sessionId: 'ses_1', sessionTitle: 'Fix the login flow', projectName: 'Record' });
  assert.ok(!gone);
  assert.ok(promoted);
  assert.ok(fresh);
  assert.equal(fresh.title, 'Fix the login flow');
  const { tasks } = await loadTasks(host);
  assert.equal(tasks[0]?.title, 'Fix the login flow', 'the record is persisted');
});

test('a card the user renamed is never touched, even when the caller\'s list is stale', async () => {
  const { host, data } = fakeHost();
  const task = stored('My own name', { sessionId: 'ses_1' });
  await seed(host, task);
  const before = snapshotOf(data);
  // The caller still believes the card sits on a placeholder; storage knows better.
  const { promoted, fresh } = await run(host, { taskId: task.id, sessionId: 'ses_1', sessionTitle: 'Fresh from the agent', projectName: 'Record' });
  assert.ok(!promoted);
  assert.ok(fresh);
  assert.equal(fresh.title, 'My own name', 'the fresh record comes back so the view converges');
  assert.deepEqual(snapshotOf(data), before, 'storage is untouched');
});

test('the id-form placeholder of a projectless adoption stays eligible', async () => {
  const { host } = fakeHost();
  const task = stored('New session (ses_abcd)', { sessionId: 'ses_abcdef1' });
  await seed(host, task);
  const { promoted, fresh } = await run(host, { taskId: task.id, sessionId: 'ses_abcdef1', sessionTitle: 'Real title', projectName: null });
  assert.ok(promoted);
  assert.ok(fresh);
  assert.equal(fresh.title, 'Real title');
});

test('the id-form placeholder stays eligible even with a project name known now', async () => {
  const { host } = fakeHost();
  const task = stored('New session (ses_abcd)', { sessionId: 'ses_abcdef1' });
  await seed(host, task);
  const { promoted, fresh } = await run(host, { taskId: task.id, sessionId: 'ses_abcdef1', sessionTitle: 'Real title', projectName: 'Record' });
  assert.ok(promoted);
  assert.ok(fresh);
  assert.equal(fresh.title, 'Real title');
});

test('a session title longer than the cap is clamped, never raised as an error', async () => {
  const { host } = fakeHost();
  const task = stored('New session (ses_abcd)', { sessionId: 'ses_abcdef1' });
  await seed(host, task);
  const { promoted, fresh } = await run(host, { taskId: task.id, sessionId: 'ses_abcdef1', sessionTitle: 'x'.repeat(300), projectName: null });
  assert.ok(promoted);
  assert.ok(fresh);
  assert.equal(fresh.title, 'x'.repeat(200));
});

test('the host fallback id-title promotes to nothing: storage untouched', async () => {
  const { host, data } = fakeHost();
  const task = stored('New session in Record', { sessionId: 'ses_1' });
  await seed(host, task);
  const before = snapshotOf(data);
  const { promoted, fresh } = await run(host, { taskId: task.id, sessionId: 'ses_1', sessionTitle: 'ses_1', projectName: 'Record' });
  assert.ok(!promoted);
  assert.ok(fresh);
  assert.equal(fresh.title, 'New session in Record', 'the fresh record comes back unchanged');
  assert.deepEqual(snapshotOf(data), before);
});

test('an empty session title writes nothing', async () => {
  const { host, data } = fakeHost();
  const task = stored('New session in Record', { sessionId: 'ses_1' });
  await seed(host, task);
  const before = snapshotOf(data);
  const { promoted, fresh } = await run(host, { taskId: task.id, sessionId: 'ses_1', sessionTitle: '   ', projectName: 'Record' });
  assert.ok(!promoted);
  assert.ok(fresh);
  assert.deepEqual(snapshotOf(data), before);
});

test('a task gone, or linked to another session, answers null and writes nothing', async () => {
  const { host, data } = fakeHost();
  const task = stored('New session in Record', { sessionId: 'ses_1' });
  await seed(host, task);
  const before = snapshotOf(data);
  const other = await run(host, { taskId: task.id, sessionId: 'ses_other', sessionTitle: 'x', projectName: null });
  assert.ok(other.gone);
  assert.ok(!other.promoted);
  const missing = await run(host, { taskId: 't_missing', sessionId: 'ses_1', sessionTitle: 'x', projectName: null });
  assert.ok(missing.gone);
  assert.ok(!missing.promoted);
  assert.deepEqual(snapshotOf(data), before);
});

test('two calls converge: the second sees the promoted title and writes nothing', async () => {
  const { host, data } = fakeHost();
  const task = stored('New session (ses_abcd)', { sessionId: 'ses_abcdef1' });
  await seed(host, task);
  const input = { taskId: task.id, sessionId: 'ses_abcdef1', sessionTitle: 'Real title', projectName: null };
  const first = await run(host, input);
  const after = snapshotOf(data);
  assert.ok(first.promoted);
  const second = await run(host, input);
  assert.ok(!second.promoted, 'the card already carries the target title');
  assert.ok(second.fresh);
  assert.equal(second.fresh.title, 'Real title');
  assert.deepEqual(snapshotOf(data), after, 'no second write');
});
