import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { HostClient, JsonValue } from '@openchamber/sdk';
import { createTask, type Task } from '../src/domain/task.ts';
import { loadTasks } from '../src/store/taskStore.ts';
import { applyAutoDone, applyObservedRead } from '../src/store/autoDoneOps.ts';

/** In-memory stand-in for host.storage, same shape as the adoptOps suite's. */
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

/** Deterministic, valid task ids from the title: applies inject their own mints. */
const stored = (title: string, rank: number, status: Task['status'], extra: Partial<Task> = {}): Task =>
  ({ ...createTask({ title, status }, rank, 1000, `t_${title.replace(/[^a-z0-9]/gi, '').toLowerCase().padEnd(8, 'x').slice(0, 24)}`), needsAttentionSince: null, ...extra });

const seed = async (host: Pick<HostClient, 'storage'>, tasks: Task[]) => {
  for (const task of tasks) await host.storage.set(`task:${task.id}`, task as unknown as JsonValue);
};

const reviewCard = (extra: Partial<Task> = {}): Task =>
  stored('Reviewed work', 5000, 'review', { needsAttentionSince: 6000, ...extra });
const REVIEW_ID = 't_reviewedwork';

test('a qualifying Review card lands Done: guard stamped, marker cleared, clock anchored, rank kept', async () => {
  const { host } = fakeHost();
  await seed(host, [reviewCard()]);
  const moved = await applyAutoDone(host, REVIEW_ID, 'abc');
  assert.ok(moved);
  assert.equal(moved.status, 'done');
  assert.equal(moved.autoDoneCommit, 'abc');
  assert.equal(moved.needsAttentionSince, null);
  assert.equal(moved.rank, 5000, 'the move is a kept-rank one, like every Done click');
  assert.equal(typeof moved.doneAt, 'number', 'entering Done stamps the archive anchor');
  const { tasks } = await loadTasks(host);
  assert.equal(tasks.length, 1);
  assert.deepEqual(
    { status: tasks[0]!.status, autoDoneCommit: tasks[0]!.autoDoneCommit, needsAttentionSince: tasks[0]!.needsAttentionSince },
    { status: 'done', autoDoneCommit: 'abc', needsAttentionSince: null },
    'the write is persisted',
  );
});

test('a card that left Review is a null, not a write: a rework pull-back holds against a stale check', async () => {
  const { host } = fakeHost();
  await seed(host, [stored('Reworking', 5000, 'in_progress', { autoDoneCommit: 'old' })]);
  const before = host.storage.keys().then((keys) => keys.length);
  const moved = await applyAutoDone(host, 't_reworking', 'abc');
  assert.equal(moved, null);
  assert.equal(await before, 1, 'nothing was written');
  const { tasks } = await loadTasks(host);
  assert.equal(tasks[0]!.status, 'in_progress');
  assert.equal(tasks[0]!.autoDoneCommit, 'old');
});

test('the guard fires: commit already carried means null and no redundant save', async () => {
  const { host } = fakeHost();
  await seed(host, [reviewCard({ autoDoneCommit: 'abc' })]);
  const moved = await applyAutoDone(host, 'abc', 'abc');
  assert.equal(moved, null);
  const after = await loadTasks(host);
  assert.equal(after.tasks[0]!.status, 'review', 'unchanged — this card needs a newer commit, not a rewrite');
});

test('an unknown task is a null, and a dead id never writes', async () => {
  const { host, data } = fakeHost();
  await seed(host, [reviewCard()]);
  const before = new Set(data.keys());
  assert.equal(await applyAutoDone(host, 't_missing000', 'abc'), null);
  assert.deepEqual(new Set(data.keys()), before);
});

test('observed read clears the stored marker; a cleared one is a null', async () => {
  const { host } = fakeHost();
  await seed(host, [reviewCard()]);
  const cleared = await applyObservedRead(host, REVIEW_ID);
  assert.ok(cleared);
  assert.equal(cleared.needsAttentionSince, null);
  assert.equal(cleared.status, 'review', 'the visit alone never moves the status');
  assert.equal(await applyObservedRead(host, REVIEW_ID), null, 'a marker already gone is a null, not a rewrite');
  const once = await loadTasks(host);
  assert.deepEqual(once.tasks.map((task) => task.needsAttentionSince), [null]);
});

test('a visit reported by another surface converges: the fresh read carries the truth', async () => {
  const { host } = fakeHost();
  // The board surface cleared the marker a moment ago while this call's
  // watcher still believed otherwise — the fresh read sees the cleared truth.
  await seed(host, [reviewCard({ needsAttentionSince: null })]);
  assert.equal(await applyObservedRead(host, REVIEW_ID), null);
});
