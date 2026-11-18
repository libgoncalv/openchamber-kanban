import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTask, type Task } from '../src/domain/task.ts';
import { autoDoneCandidate, type SessionLiveState } from '../src/domain/boardView.ts';
import { createAutoDoneSync, fetchCommitsAhead, type AutoDoneSyncHost } from '../src/host/autoDoneSync.ts';
import type { GuestRequestResult } from '@openchamber/sdk';

/** Records serviceRequest calls and answers every one with the same scripted result. */
const fakeHost = (status: number, body: string) => {
  const calls: Array<{ method: string; path: string; query: Record<string, string> }> = [];
  const host: AutoDoneSyncHost = {
    serviceRequest: async (request) => {
      calls.push({ method: request.method, path: request.path, query: Object.fromEntries(Object.entries(request.query ?? {}).map(([k, v]) => [k, String(v)])) });
      return { status, body } as GuestRequestResult;
    },
  };
  return { host, calls };
};

/** A serviceRequest that pends until the test resolves it, for racing the fetch against list changes. */
const pendingHost = () => {
  const calls: Array<{ method: string; path: string }> = [];
  let resolve: ((result: GuestRequestResult) => void) | null = null;
  const answer = (result: GuestRequestResult) => { resolve?.(result); resolve = null; };
  const host: AutoDoneSyncHost = {
    serviceRequest: async (request) => {
      calls.push({ method: request.method, path: request.path });
      return new Promise<GuestRequestResult>((res) => { resolve = res; });
    },
  };
  return { host, calls, answer };
};

const state = (over: Partial<SessionLiveState> = {}): SessionLiveState =>
  ({ projectId: 'p1', activity: 'idle', outcome: 'completed', agent: 'build', updatedAt: 5000, unread: false, ...over });

const task = (id: string, over: Partial<Task> = {}): Task => ({
  ...createTask({ title: id }, 1, 1000, id),
  status: 'review',
  worktree: { directory: '/wt', branch: 'wt/a' },
  sourceBranch: 'main',
  ...over,
});

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

test('fetchCommitsAhead parses the service answer and nulls out every failure shape', async () => {
  assert.deepEqual(await fetchCommitsAhead(fakeHost(200, '{"ahead":3,"head":"abc"}').host, '/wt', 'main'), { ahead: 3, head: 'abc' });
  assert.deepEqual(await fetchCommitsAhead(fakeHost(200, '{"ahead":0,"head":null}').host, '/wt', 'main'), { ahead: 0, head: null });
  assert.equal(await fetchCommitsAhead(fakeHost(422, '{"error":"not a git repository"}').host, '/wt', 'main'), null);
  assert.equal(await fetchCommitsAhead(fakeHost(200, '{"ahead":"3","head":"abc"}').host, '/wt', 'main'), null);
  assert.equal(await fetchCommitsAhead(fakeHost(200, '{"ahead":2,"head":7}').host, '/wt', 'main'), null);
  assert.equal(await fetchCommitsAhead(fakeHost(200, 'not json').host, '/wt', 'main'), null);
});

test('a candidate with commits ahead fires the write with the HEAD as the guard', async () => {
  const { host, calls } = fakeHost(200, '{"ahead":2,"head":"sha_1"}');
  const writes: Array<[string, string]> = [];
  const t = task('t_ad0001', { sessionId: null }); // unlinked: qualifies without any live state
  const sync = createAutoDoneSync(host, () => new Map(), { onAutoDone: (id, sha) => writes.push([id, sha]), onObservedRead: () => {} });
  sync.sync([t]);
  await tick();
  assert.deepEqual(writes, [[t.id, 'sha_1']]);
  assert.equal(calls.length, 1);
  assert.equal(calls[0]?.path, '/commits-ahead');
  assert.deepEqual(calls[0]?.query, { directory: '/wt', base: 'main' });
});

test('the guard holds and zero ahead stays quiet', async () => {
  const writes: Array<[string, string]> = [];
  // The exact commit that fired before: nothing re-fires — the drag-back case.
  const fired = task('t_ad0002', { sessionId: null, autoDoneCommit: 'sha_1' });
  const { host } = fakeHost(200, '{"ahead":2,"head":"sha_1"}');
  const sync = createAutoDoneSync(host, () => new Map(), { onAutoDone: (id, sha) => writes.push([id, sha]), onObservedRead: () => {} });
  sync.sync([fired]);
  await tick();
  assert.equal(writes.length, 0);
  // No commits ahead of the source branch: nothing to acknowledge yet.
  const none = task('t_ad0003', { sessionId: null });
  const { host: host2 } = fakeHost(200, '{"ahead":0,"head":"sha_2"}');
  const sync2 = createAutoDoneSync(host2, () => new Map(), { onAutoDone: (id, sha) => writes.push([id, sha]), onObservedRead: () => {} });
  sync2.sync([none]);
  await tick();
  assert.deepEqual(writes, []);
});

test('a linked session must be trusted-idle before any write; an unknown one waits', async () => {
  const { host, calls } = fakeHost(200, '{"ahead":2,"head":"sha_1"}');
  const writes: string[] = [];
  const linked = task('t_ad0004', { sessionId: 'ses_1' });
  const sync = createAutoDoneSync(host, () => new Map(), { onAutoDone: (id) => writes.push(id), onObservedRead: () => {} });
  sync.sync([linked]);
  await tick();
  assert.equal(writes.length, 0, 'no trusted snapshot for the linked session: no fire');
  assert.equal(calls.length, 0);  const idle: ReadonlyMap<string, SessionLiveState> = new Map([['ses_1', state({ unread: null })]]); // seen the old-fashioned way (no marker) is enough
  const sync2 = createAutoDoneSync(host, () => idle, { onAutoDone: (id) => writes.push(id), onObservedRead: () => {} });
  const seenHere = task('t_ad0005', { sessionId: 'ses_1', needsAttentionSince: null });
  sync2.sync([seenHere]);
  await tick();
  assert.deepEqual(writes, [seenHere.id]);
});

test('an observed read elsewhere clears the stored marker, then the rule may fire on a later pass', async () => {
  const { host, calls } = fakeHost(200, '{"ahead":5,"head":"sha_1"}');
  const live = new Map([['ses_1', state({ unread: false })]]);
  const reads: string[] = [];
  const writes: Array<[string, string]> = [];
  let stored = task('t_ad0006', { sessionId: 'ses_1', needsAttentionSince: 1000 });
  const sync = createAutoDoneSync(host, () => live, { onAutoDone: (id, sha) => writes.push([id, sha]), onObservedRead: (id) => reads.push(id) });
  sync.sync([stored]); // pass 1: the host reports the chat was opened somewhere else
  await tick();
  assert.deepEqual(reads, [stored.id]);
  assert.deepEqual(writes, [], 'a read and a write never share a pass');
  assert.equal(calls.length, 0, 'no git call in the read pass');
  stored = { ...stored, needsAttentionSince: null }; // the page's marker clear landed
  sync.sync([stored]); // pass 2: the auto-done candidate check runs against live state
  await tick();
  assert.deepEqual(writes, [[stored.id, 'sha_1']]);
});

test('a failed check retries only after the floor, on the next event', async () => {
  const realNow = Date.now;
  let fakeTime = 0;
  Date.now = () => fakeTime;
  try {
    const { host, calls } = fakeHost(500, '{"error":"no service"}');
    const writes: string[] = [];
    const t = task('t_ad0007', { sessionId: null });
    const sync = createAutoDoneSync(host, () => new Map(), { onAutoDone: (id) => writes.push(id), onObservedRead: () => {} });
    sync.sync([t]);
    await tick();
    assert.equal(calls.length, 1);
    sync.sync([t]);
    sync.sync([t]);
    await tick();
    assert.equal(calls.length, 1, 'the floor holds against immediate re-events');
    fakeTime = 60_000; // past the 60 s floor
    sync.sync([t]);
    await tick();
    assert.equal(calls.length, 2);
    assert.deepEqual(writes, []);
  } finally {
    Date.now = realNow;
  }
});

test('a check still in flight never starts twice, and a fetch that resolves after the card moved writes nothing', async () => {
  const { host, calls, answer } = pendingHost();
  const writes: Array<[string, string]> = [];
  const t = task('t_ad0008', { sessionId: null });
  const sync = createAutoDoneSync(host, () => new Map(), { onAutoDone: (id, sha) => writes.push([id, sha]), onObservedRead: () => {} });
  sync.sync([t]);
  sync.sync([t]);
  assert.equal(calls.length, 1, 'in flight: one start');
  // The card moved (or was deleted) while the service was thinking: the verify step stands down.
  sync.sync([{ ...t, status: 'in_progress' as const }]);
  answer({ status: 200, body: '{"ahead":4,"head":"sha_9"}' });
  await tick();
  assert.deepEqual(writes, []);
});

test('a disposed watcher answers nothing', async () => {
  const { host, calls } = fakeHost(200, '{"ahead":1,"head":"sha_1"}');
  const writes: string[] = [];
  const reads: string[] = [];
  const seenElsewhere = task('t_ad0009', { sessionId: 'ses_1', needsAttentionSince: 1000 });
  const sync = createAutoDoneSync(host, () => new Map([['ses_1', state({ unread: false })]]), { onAutoDone: (id) => writes.push(id), onObservedRead: (id) => reads.push(id) });
  sync.sync([]);
  sync.dispose();
  sync.sync([seenElsewhere]);
  await tick();
  assert.equal(calls.length, 0);
  assert.deepEqual(writes, []);
  assert.deepEqual(reads, []);
  sync.sync([]); // post-dispose list changes stay inert too
});

test('autoDoneCandidate itself is exported and pure — the watcher double-checks it after every fetch', () => {
  const t = task('t_ad0010', { sessionId: null });
  const noState: SessionLiveState | null = null;
  assert.equal(autoDoneCandidate(t, noState), true);
  assert.equal(autoDoneCandidate({ ...t, status: 'done' }, noState), false);
});
