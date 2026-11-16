import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { HostClient, JsonValue } from '@openchamber/sdk';
import { createTask, type Task } from '../src/domain/task.ts';
import { loadTasks } from '../src/store/taskStore.ts';
import { DISMISSED_SESSIONS_KEY, loadDismissedSessions } from '../src/store/dismissedSessions.ts';
import {
  createBacklogTask,
  deleteTaskWithDismissal,
  patchTask,
  planMove,
  saveMove,
  statusMove,
} from '../src/store/taskOps.ts';

/** In-memory stand-in for host.storage, with optional failure injection per operation. */
const fakeHost = () => {
  const data = new Map<string, string>();
  let failSetOn: RegExp | null = null;
  let failDeleteOn: RegExp | null = null;
  const host: Pick<HostClient, 'storage'> = {
    storage: {
      get: async (key) => (data.has(key) ? (JSON.parse(data.get(key)!) as JsonValue) : undefined),
      set: async (key, value) => {
        if (failSetOn?.test(key)) throw new Error('set failed');
        data.set(key, JSON.stringify(value));
      },
      delete: async (key) => {
        if (failDeleteOn?.test(key)) throw new Error('delete failed');
        data.delete(key);
      },
      keys: async () => [...data.keys()],
    },
  };
  return { host, data, failSetOn: (re: RegExp) => (failSetOn = re), failDeleteOn: (re: RegExp) => (failDeleteOn = re) };
};

const task = (title: string, rank: number, status: Task['status'] = 'todo', extra: Partial<Task> = {}): Task =>
  ({ ...createTask({ title, status }, rank, 1000, `t_${title.padEnd(6, '0').slice(0, 6)}`), needsAttentionSince: null, ...extra });

test('planMove applies the drop plan: moved card gets status and rank, neighbours rebalance, marker clears', () => {
  const moved = task('moved', 5000, 'review', { needsAttentionSince: 300 });
  const colA = task('a', 100);
  const colB = task('b', 200);
  const { next, plan } = planMove([moved, colA, colB], moved.id, 'todo', null, [moved, colA, colB])!;
  assert.equal(plan.rank, 200 + 1024);
  assert.equal(next.find((t) => t.id === moved.id)?.status, 'todo');
  assert.equal(next.find((t) => t.id === moved.id)?.needsAttentionSince, null, 'a deliberate move is an acknowledgment');
  assert.equal(next.find((t) => t.id === colA.id)?.rank, 100);
});

test('planMove rebalances too-close neighbours exactly like the pure math does', () => {
  const x = task('x', 1);
  const y = task('y', 1 + 1e-9);
  const z = task('z', 5);
  const moved = task('m', 9);
  const { next, plan } = planMove([x, y, z, moved], moved.id, 'todo', y.id, [x, y, z])!;
  const ranks = new Map(next.map((t) => [t.id, t.rank]));
  for (const entry of plan.rebalance) assert.equal(ranks.get(entry.id), entry.rank);
  const order = [...next].sort((a, b) => ranks.get(a.id)! - ranks.get(b.id)!).map((t) => t.title);
  assert.deepEqual(order, ['x', 'm', 'y', 'z']);
});

test('saveMove persists the moved record and every rebalanced one', async () => {
  const { host } = fakeHost();
  const x = task('x', 1);
  const y = task('y', 1 + 1e-9);
  const moved = task('m', 9);
  const { next, plan } = planMove([x, y, moved], moved.id, 'todo', y.id, [x, y])!;
  await saveMove(host, next, moved.id, plan);
  const { tasks } = await loadTasks(host);
  assert.deepEqual(
    tasks.filter((t) => t.id === moved.id || t.id === x.id || t.id === y.id).map((t) => t.id).sort(),
    [moved.id, x.id, y.id].sort(),
  );
});

test('statusMove keeps rank, clears the marker, and is null when nothing changes', () => {
  const t = task('t', 1024, 'review', { needsAttentionSince: 9 });
  const moved = statusMove(t, 'todo')!;
  assert.equal(moved.status, 'todo');
  assert.equal(moved.rank, 1024, 'menu moves keep their rank');
  assert.equal(moved.needsAttentionSince, null);
  // A repeat click on the same target is a no-op...
  assert.equal(statusMove(moved, 'todo'), null);
  // ...but clicking the column the task is already in still clears a stale marker.
  const cleared = statusMove(t, 'review')!;
  assert.equal(cleared.needsAttentionSince, null);
  const calm = task('calm', 1, 'review');
  assert.equal(statusMove(calm, 'review'), null, 'same column with no marker is a no-op');
});

test('patchTask applies a patch; unknown ids return null', () => {
  const t = task('t', 1);
  const patched = patchTask([t], t.id, { title: 'renamed' })!;
  assert.equal(patched.task.title, 'renamed');
  assert.equal(patched.next[0]?.title, 'renamed');
  assert.equal(patchTask([t], 'nope', { title: 'x' }), null);
});

test('createBacklogTask appends at the end of Backlog and persists', async () => {
  const { host } = fakeHost();
  const existing = task('existing', 4096, 'backlog');
  const created = await createBacklogTask(host, { tasks: [existing], title: 'fresh', projectId: 'p1' });
  assert.equal(created.status, 'backlog');
  assert.equal(created.rank, 4096 + 1024);
  assert.equal(created.projectId, 'p1');
  const { tasks } = await loadTasks(host);
  assert.equal(tasks.some((t) => t.id === created.id), true);
});

test('deleteTaskWithDismissal records the session BEFORE deleting so adoption can never resurrect it', async () => {
  const { host } = fakeHost();
  const dismissed = new Set<string>();
  const t = task('t', 1, 'in_progress', { sessionId: 'ses_1' });
  const result = await deleteTaskWithDismissal(host, t, dismissed);
  assert.equal(result.dismissed, true);
  assert.equal((await loadDismissedSessions(host)).has('ses_1'), true);
  assert.equal((await loadTasks(host)).tasks.some((existing) => existing.id === t.id), false);
});

test('a task with no session deletes without touching the dismissal list', async () => {
  const { host } = fakeHost();
  const dismissed = new Set<string>();
  const t = task('t', 1);
  await deleteTaskWithDismissal(host, t, dismissed);
  assert.equal(dismissed.size, 0);
  assert.equal(await storageHas(host, DISMISSED_SESSIONS_KEY), false);
});

test('when the dismissal save fails the session is rolled back and nothing is deleted', async () => {
  const { host, failSetOn } = fakeHost();
  const dismissed = new Set<string>();
  const t = task('t', 1, 'in_progress', { sessionId: 'ses_1' });
  failSetOn(new RegExp(`^${DISMISSED_SESSIONS_KEY}$`));
  await assert.rejects(deleteTaskWithDismissal(host, t, dismissed));
  assert.equal(dismissed.has('ses_1'), false, 'rolled back in memory');
});

test('when the delete fails a fresh dismissal is rolled back', async () => {
  const { host, failDeleteOn } = fakeHost();
  const dismissed = new Set<string>();
  const t = task('t', 1, 'in_progress', { sessionId: 'ses_1' });
  failDeleteOn(new RegExp('^task:'));
  await assert.rejects(deleteTaskWithDismissal(host, t, dismissed));
  assert.equal(dismissed.has('ses_1'), false);
  assert.equal((await loadDismissedSessions(host)).has('ses_1'), false, 'storage rolled back too');
});

/** `keys`-has helper, since callers hold the whole host slice, not the storage object. */
const storageHas = (storage: Pick<HostClient, 'storage'>, key: string) =>
  storage.storage.keys().then((keys) => keys.includes(key));
