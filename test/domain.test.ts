import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyPatch, createTask, newTaskId, parseTask, type Task } from '../src/domain/task.ts';
import { ARCHIVE_AFTER_MS, archiveCandidates, nextArchiveTickAt, planDrop, planStatusMoves, rankAtEnd } from '../src/domain/board.ts';

const make = (title: string, extra: Partial<Task> = {}, rank = 1024): Task => ({
  ...createTask({ title }, rank, 1000, newTaskId(1000 + Math.floor(Math.random() * 1e6))),
  ...extra,
});

test('createTask trims, defaults to backlog, and round-trips through parseTask', () => {
  const task = createTask({ title: '  Fix login  ', description: 'details', projectId: ' p1 ' }, 1024, 5000);
  assert.equal(task.title, 'Fix login');
  assert.equal(task.status, 'backlog');
  assert.equal(task.projectId, 'p1');
  assert.equal(task.sessionId, null);
  assert.deepEqual(parseTask(JSON.parse(JSON.stringify(task))), task);
});

test('createTask rejects an empty or oversized title', () => {
  assert.throws(() => createTask({ title: '   ' }, 1), /needs a title/);
  assert.throws(() => createTask({ title: 'x'.repeat(201) }, 1), /limited/);
});

test('parseTask rejects malformed records instead of guessing', () => {
  const good = createTask({ title: 'ok' }, 1, 1);
  assert.throws(() => parseTask(null));
  assert.throws(() => parseTask({ ...good, status: 'doing' }), /status/);
  assert.throws(() => parseTask({ ...good, id: '../evil' }), /id/);
  assert.throws(() => parseTask({ ...good, schemaVersion: 2 }), /schema/);
});

test('parseTask treats a record saved before needsAttentionSince existed as null, not unreadable', () => {
  const good = createTask({ title: 'old record' }, 1, 1);
  const { needsAttentionSince, ...withoutField } = good;
  assert.equal(parseTask(withoutField).needsAttentionSince, null);
  assert.equal(parseTask({ ...good, needsAttentionSince: 500 }).needsAttentionSince, 500);
  assert.throws(() => parseTask({ ...good, needsAttentionSince: 'soon' }), /needsAttentionSince/);
});

test('autoDoneCommit follows the same optional-field convention as needsAttentionSince', () => {
  const good = createTask({ title: 'guarded' }, 1, 1);
  assert.equal(good.autoDoneCommit, null, 'fresh tasks carry no guard');
  const { autoDoneCommit, ...withoutField } = good;
  assert.equal(parseTask(withoutField).autoDoneCommit, null, 'records saved before the field existed parse as null');
  assert.equal(parseTask({ ...good, autoDoneCommit: 'abc123' }).autoDoneCommit, 'abc123');
  assert.throws(() => parseTask({ ...good, autoDoneCommit: { not: 'a string' } }), /autoDoneCommit/);
  const patched = applyPatch(good, { autoDoneCommit: 'sha999' });
  assert.equal(patched.autoDoneCommit, 'sha999');
  assert.equal(applyPatch(patched, { autoDoneCommit: null }).autoDoneCommit, null);
});

test('sessionLinkedAt follows the same optional-field convention, a timestamp like needsAttentionSince', () => {
  const good = createTask({ title: 'anchored' }, 1, 1);
  assert.equal(good.sessionLinkedAt, null, 'fresh tasks carry no anchor yet');
  const { sessionLinkedAt, ...withoutField } = good;
  assert.equal(parseTask(withoutField).sessionLinkedAt, null, 'records saved before the field existed parse as null');
  assert.equal(parseTask({ ...good, sessionLinkedAt: 1795_051_680_000 }).sessionLinkedAt, 1795_051_680_000);
  assert.throws(() => parseTask({ ...good, sessionLinkedAt: 'yesterday' }), /sessionLinkedAt/);
  const patched = applyPatch(good, { sessionLinkedAt: 1795_051_680_001 });
  assert.equal(patched.sessionLinkedAt, 1795_051_680_001);
  assert.equal(applyPatch(patched, { sessionLinkedAt: null }).sessionLinkedAt, null, 'unlinking retires the evidence');
});

test('applyPatch sets and clears needsAttentionSince', () => {
  const task = createTask({ title: 'a' }, 1, 100);
  assert.equal(applyPatch(task, { needsAttentionSince: 500 }).needsAttentionSince, 500);
  assert.equal(applyPatch(task, { needsAttentionSince: null }).needsAttentionSince, null);
});

test('applyPatch updates only patched fields and bumps updatedAt', () => {
  const task = createTask({ title: 'a' }, 1, 100);
  const next = applyPatch(task, { status: 'in_progress', sessionId: 'ses_123' }, 200);
  assert.equal(next.status, 'in_progress');
  assert.equal(next.sessionId, 'ses_123');
  assert.equal(next.title, 'a');
  assert.equal(next.updatedAt, 200);
  assert.equal(applyPatch(next, { sessionId: null }, 300).sessionId, null);
  assert.throws(() => applyPatch(task, { status: 'nope' as never }));
});

test('planDrop places between neighbours, at ends, and into empty columns', () => {
  const x = make('x', { rank: 100 });
  const y = make('y', { rank: 200 });
  const m = make('m', { rank: 999 });
  assert.equal(planDrop([], m.id, null).rank, 1024);
  assert.equal(planDrop([x, y], m.id, y.id).rank, 150);
  assert.equal(planDrop([x, y], m.id, x.id).rank, 100 - 1024);
  assert.equal(planDrop([x, y], m.id, null).rank, 200 + 1024);
  assert.equal(planDrop([x, y, m], m.id, y.id).rank, 150, 'moving within a column ignores its old slot');
});

test('planDrop rebalances when neighbours are too close and keeps order', () => {
  const x = make('x', { rank: 1 });
  const y = make('y', { rank: 1 + 1e-9 });
  const z = make('z', { rank: 5 });
  const m = make('m');
  const plan = planDrop([x, y, z], m.id, y.id);
  const ranks = new Map(plan.rebalance.map((entry) => [entry.id, entry.rank]));
  ranks.set(m.id, plan.rank);
  const order = [x, y, z, m].sort((a, b) => ranks.get(a.id)! - ranks.get(b.id)!).map((t) => t.title);
  assert.deepEqual(order, ['x', 'm', 'y', 'z']);
});

test('rankAtEnd appends after the highest rank in that status', () => {
  const x = make('x', { rank: 10, status: 'todo' });
  const y = make('y', { rank: 50, status: 'backlog' });
  assert.equal(rankAtEnd([x, y], 'todo'), 10 + 1024);
  assert.equal(rankAtEnd([x, y], 'review'), 1024);
});

test('planStatusMoves appends the selection as a group at the target column end, in rank order', () => {
  const a = make('a', { status: 'backlog', rank: 100 });
  const b = make('b', { status: 'backlog', rank: 200 });
  const m1 = make('m1', { status: 'review', rank: 5000, needsAttentionSince: 300 });
  const m2 = make('m2', { status: 'review', rank: 6000, needsAttentionSince: 400 });
  const plan = planStatusMoves([a, b, m1, m2], [m2.id, m1.id], 'backlog')!;
  const ranks = new Map(plan.next.map((t) => [t.id, t.rank]));
  // Group appended beyond the target column's max, mutual order byRank —
  // not the id order the array happened to pass.
  assert.equal(ranks.get(m1.id), 200 + 1024);
  assert.equal(ranks.get(m2.id), 200 + 2048);
  // Deliberate moves acknowledge: markers clear on everything that moved.
  assert.equal(plan.next.find((t) => t.id === m1.id)?.needsAttentionSince, null);
  assert.equal(plan.next.find((t) => t.id === m2.id)?.needsAttentionSince, null);
  // The untouched neighbours never move: no rebalancing by design.
  assert.equal(ranks.get(a.id), 100);
  assert.equal(ranks.get(b.id), 200);
  assert.deepEqual(plan.changed.map((t) => t.id).sort(), [m1.id, m2.id].sort());
});

test('planStatusMoves leaves a task already in the target in place, clearing only a stale marker', () => {
  const inTarget = make('t', { status: 'done', rank: 10, needsAttentionSince: 500 });
  const calm = make('c', { status: 'done', rank: 10 });
  const moving = make('m', { status: 'todo', rank: 30 });
  const plan = planStatusMoves([inTarget, calm, moving], [inTarget.id, calm.id, moving.id], 'done')!;
  const byId = new Map(plan.next.map((t) => [t.id, t]));
  assert.equal(byId.get(inTarget.id)?.needsAttentionSince, null, 'a repeat move still acknowledges');
  assert.equal(byId.get(inTarget.id)?.rank, 10);
  assert.equal(byId.get(calm.id)?.rank, 10, 'marker already clear: record untouched');
  assert.deepEqual(plan.changed.map((t) => t.id).sort(), [inTarget.id, moving.id].sort());
});

test('planStatusMoves is null when nothing would change, and ignores unknown ids', () => {
  const calm = make('c', { status: 'done', rank: 10 });
  assert.equal(planStatusMoves([calm], [calm.id], 'done'), null);
  assert.equal(planStatusMoves([calm], ['nope'], 'todo'), null);
  assert.equal(planStatusMoves([calm], [], 'todo'), null);
  // Unknown ids mixed with real ones: only the real ones act.
  const plan = planStatusMoves([calm, make('x', { status: 'todo', rank: 20 })], ['nope', calm.id, calm.id], 'todo')!;
  assert.deepEqual(plan.changed.map((t) => t.id), [calm.id]);
  assert.equal(plan.next.find((t) => t.id === calm.id)?.rank, 20 + 1024);
});

// ---- The archive rule ----

test('doneAt follows the same optional-field convention as sessionLinkedAt', () => {
  const good = createTask({ title: 'old record' }, 1, 1);
  const { doneAt, ...withoutField } = good;
  assert.equal(parseTask(withoutField).doneAt, null);
  assert.equal(parseTask({ ...good, doneAt: 500 }).doneAt, 500);
  assert.throws(() => parseTask({ ...good, doneAt: 'soon' }), /doneAt/);
});

test('entering Done stamps doneAt; leaving clears; re-entering stamps fresh; a no-op stamps nothing', () => {
  const base = make('t', { updatedAt: 1000 });
  const now = 5_000;
  const done = applyPatch(base, { status: 'done' }, now);
  assert.equal(done.doneAt, now);
  assert.equal(applyPatch(done, { needsAttentionSince: null }, now + 1).doneAt, now, 'a patch that keeps the status never resets the clock');
  assert.equal(applyPatch(done, { status: 'done' }, now + 1).doneAt, now, 'a repeated Move-to-Done click never resets the clock');
  const back = applyPatch(done, { status: 'todo' }, now + 2);
  assert.equal(back.doneAt, null, 'leaving Done clears the anchor');
  assert.equal(applyPatch(back, { status: 'done' }, now + 3).doneAt, now + 3, 'every stretch of Done counts fresh from its own entry');
  assert.equal(createTask({ title: 'x', status: 'done' }, 1, 7).doneAt, 7);
  assert.equal(createTask({ title: 'x' }, 1, 7).doneAt, null);
});

test('planStatusMoves reaches archived like any other target: end-of-column rank, clean stamps', () => {
  const doneOld = make('d', { status: 'done', rank: 20, updatedAt: 1 });
  const settled = make('a', { status: 'archived', rank: 10 });
  const plan = planStatusMoves([settled, doneOld], [doneOld.id], 'archived')!;
  const byId = new Map(plan.next.map((t) => [t.id, t]));
  assert.equal(byId.get(doneOld.id)?.status, 'archived');
  assert.equal(byId.get(doneOld.id)?.rank, 10 + 1024, 'appended beyond the existing archive ranks');
  assert.equal(byId.get(doneOld.id)?.doneAt, null, 'leaving Done clears the archive anchor');
  assert.deepEqual(plan.changed.map((t) => t.id), [doneOld.id]);
});

test('archiveCandidates picks exactly the done cards past the two-week anchor', () => {
  const NOW = 10_000_000_000_000;
  const day = 24 * 60 * 60_000;
  const aged = make('old', { status: 'done', doneAt: NOW - 20 * day, updatedAt: 1 });
  const fresh = make('new', { status: 'done', doneAt: NOW - 13 * day, updatedAt: NOW - 13 * day });
  const edge = make('edge', { status: 'done', doneAt: NOW - 14 * day, updatedAt: 1 });
  const archived = make('gone', { status: 'archived', doneAt: null, updatedAt: NOW - 40 * day });
  const open = make('wip', { status: 'in_progress', doneAt: null });
  assert.equal(ARCHIVE_AFTER_MS, 14 * day);
  // The edge card sits exactly at the window: retired, not a day early or late.
  assert.deepEqual(archiveCandidates([aged, fresh, edge, archived, open], NOW), [aged.id, edge.id]);
  // Legacy records without doneAt borrow their updatedAt, the backfill's rule.
  const legacy = make('anc', { status: 'done', doneAt: null, updatedAt: NOW - 20 * day });
  const legacyFresh = make('lnew', { status: 'done', doneAt: null, updatedAt: NOW - day });
  assert.deepEqual(archiveCandidates([legacy, legacyFresh], NOW), [legacy.id]);
  // The tick: the next instant the board must wake at; null once it passed or it never will.
  assert.equal(nextArchiveTickAt(fresh, NOW), fresh.doneAt! + ARCHIVE_AFTER_MS);
  assert.equal(nextArchiveTickAt(aged, NOW), null);
  assert.equal(nextArchiveTickAt(archived, NOW), null);
  assert.equal(nextArchiveTickAt(open, NOW), null);
});
