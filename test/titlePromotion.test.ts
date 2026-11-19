import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { HostClient, JsonValue } from '@openchamber/sdk';
import { createTask, type Task } from '../src/domain/task.ts';
import type { SessionLiveState } from '../src/domain/boardView.ts';
import { loadTasks } from '../src/store/taskStore.ts';
import { createTitlePromotion } from '../src/host/titlePromotion.ts';

/** In-memory stand-in for host.storage, with a liftable write fault. */
const fakeHost = () => {
  const data = new Map<string, string>();
  let faulting = false;
  const host: Pick<HostClient, 'storage'> = {
    storage: {
      get: async (key) => (data.has(key) ? (JSON.parse(data.get(key)!) as JsonValue) : undefined),
      set: async (key, value) => {
        if (faulting) throw new Error('storage write rejected');
        data.set(key, JSON.stringify(value));
      },
      delete: async (key) => { data.delete(key); },
      keys: async () => [...data.keys()],
    },
  };
  return { host, data, setFault: (on: boolean) => { faulting = on; } };
};

let taskIdSeed = 0;
const stored = (title: string, extra: Partial<Task> = {}): Task =>
  ({ ...createTask({ title, status: 'in_progress' }, 100, 1000, `t_${(++taskIdSeed).toString(36).padStart(6, '0')}`), needsAttentionSince: null, ...extra });

const state = (title: string, over: Partial<SessionLiveState> = {}): SessionLiveState =>
  ({ projectId: 'p1', activity: 'running', outcome: null, agent: 'build', updatedAt: 5000, unread: null, title, ...over });

/** Lets the sweep's storage round-trip settle. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

const mount = (
  host: Pick<HostClient, 'storage'>,
  live: ReadonlyMap<string, SessionLiveState>,
  onPromoted: (task: Task) => void = () => {},
  onStale: (task: Task) => void = () => {},
) => createTitlePromotion(host, () => live, (projectId) => (projectId ? 'Record' : null), { onPromoted, onStale });

test('a placeholder card is promoted exactly once, and the view hears the promoted record', async () => {
  const { host, data } = fakeHost();
  const task = stored('New session in Record', { sessionId: 'ses_1', projectId: 'p1' });
  await host.storage.set(`task:${task.id}`, task as unknown as JsonValue);
  const promoted: Task[] = [];
  const promotion = mount(host, new Map([['ses_1', state('Fix the login flow')]]), (t) => promoted.push(t));
  promotion.sync([task]);
  await settle();
  assert.deepEqual(promoted.map((t) => t.title), ['Fix the login flow'], 'the callback carries the promoted record for the view');
  const { tasks } = await loadTasks(host);
  assert.equal(tasks[0]?.title, 'Fix the login flow', 'the write is persisted');
  const after = [...data.values()];
  // A later sweep is a no-op: the caller kept the stale placeholder, the session id is marked attempted.
  promotion.sync([task]);
  await settle();
  assert.deepEqual([...data.values()].sort(), after.sort(), 'no second write');
});

test('the host fallback id-title is no name yet: nothing happens', async () => {
  const { host, data } = fakeHost();
  const task = stored('New session (ses_abcd)', { sessionId: 'ses_abcdef1' });
  await host.storage.set(`task:${task.id}`, task as unknown as JsonValue);
  const before = [...data.values()];
  const promoted: Task[] = [];
  const promotion = mount(host, new Map([['ses_abcdef1', state('ses_abcdef1')]]), (t) => promoted.push(t));
  promotion.sync([task]);
  await settle();
  assert.deepEqual(promoted, []);
  assert.deepEqual([...data.values()].sort(), before.sort(), 'storage untouched');
});

test('a card whose title is no longer a placeholder is skipped on the caller\'s list, before any write', async () => {
  const { host, data } = fakeHost();
  const task = stored('My own name', { sessionId: 'ses_1' });
  await host.storage.set(`task:${task.id}`, task as unknown as JsonValue);
  const before = [...data.values()];
  const promoted: Task[] = [];
  const stales: Task[] = [];
  const promotion = mount(host, new Map([['ses_1', state('Fresh name')]]), (t) => promoted.push(t), (t) => stales.push(t));
  promotion.sync([task]);
  await settle();
  assert.deepEqual(promoted, []);
  assert.deepEqual(stales, [], 'no write was attempted, so no convergence callback either');
  assert.deepEqual([...data.values()].sort(), before.sort(), 'storage untouched');
});

test('a session the live map knows nothing about is skipped', async () => {
  const { host, data } = fakeHost();
  const task = stored('New session (ses_abcd)', { sessionId: 'ses_abcdef1' });
  await host.storage.set(`task:${task.id}`, task as unknown as JsonValue);
  const before = [...data.values()];
  const promoted: Task[] = [];
  const promotion = mount(host, new Map(), (t) => promoted.push(t));
  promotion.sync([task]);
  await settle();
  assert.deepEqual(promoted, []);
  assert.deepEqual([...data.values()].sort(), before.sort(), 'storage untouched');
});

test('storage knowing better answers onStale with the fresh record, silently', async () => {
  const { host, data } = fakeHost();
  const task = stored('New session (ses_abcd)', { sessionId: 'ses_abcdef1' });
  await host.storage.set(`task:${task.id}`, task as unknown as JsonValue);
  // Another surface promoted the card moments ago; this surface's list is stale.
  const promotedElsewhere = { ...task, title: 'Real title', updatedAt: 2000 };
  await host.storage.set(`task:${promotedElsewhere.id}`, promotedElsewhere as unknown as JsonValue);
  const before = [...data.values()];
  const promoted: Task[] = [];
  const stales: Task[] = [];
  const promotion = mount(host, new Map([['ses_abcdef1', state('Real title')]]), (t) => promoted.push(t), (t) => stales.push(t));
  promotion.sync([task]);
  await settle();
  assert.deepEqual(promoted, [], 'the write did not happen here');
  assert.deepEqual(stales.map((t) => t.title), ['Real title'], 'the fresh record converges the view');
  assert.deepEqual([...data.values()].sort(), before.sort(), 'storage untouched');
});

test('a failed write is silent and guarded; a reset re-tries it once', async () => {
  const { host, data, setFault } = fakeHost();
  const task = stored('New session in Record', { sessionId: 'ses_1', projectId: 'p1' });
  await host.storage.set(`task:${task.id}`, task as unknown as JsonValue);
  setFault(true);
  const promoted: Task[] = [];
  const promotion = mount(host, new Map([['ses_1', state('Real title')]]), (t) => promoted.push(t));
  promotion.sync([task]);
  await settle();
  assert.equal(promoted.length, 0, 'the failure stays silent');
  const before = [...data.values()];
  // While the fault persists the guard blocks every later sweep of this mount.
  promotion.sync([task]);
  promotion.evaluate();
  await settle();
  assert.equal(promoted.length, 0);
  assert.deepEqual(await loadTasks(host).then((r) => r.tasks.map((t) => t.title)), ['New session in Record']);
  assert.deepEqual([...data.values()].sort(), before.sort());
  // A reload's clean slate clears the guard, and the same controller retries once, successfully.
  setFault(false);
  promotion.reset();
  promotion.evaluate();
  await settle();
  assert.deepEqual(promoted.map((t) => t.title), ['Real title']);
  assert.deepEqual(await loadTasks(host).then((r) => r.tasks.map((t) => t.title)), ['Real title']);
});

test('the two placeholder forms both qualify, whatever the project known now', async () => {
  const { host } = fakeHost();
  const projectless = stored('New session (ses_abcd)', { sessionId: 'ses_abcdef1', projectId: 'p1' });
  await host.storage.set(`task:${projectless.id}`, projectless as unknown as JsonValue);
  const promoted: Task[] = [];
  const promotion = mount(host, new Map([['ses_abcdef1', state('Real title')]]), (t) => promoted.push(t));
  promotion.sync([projectless]);
  await settle();
  assert.deepEqual(promoted.map((t) => t.title), ['Real title'], 'the projectless adoption form is eligible even with the project registered since');
});
