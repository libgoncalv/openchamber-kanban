import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTask, parseTask, type Task } from '../src/domain/task.ts';
import {
  buildMirrorDoc,
  parseAgentCreateRequest,
  parseAgentNoteRequest,
  parseJournalEntry,
  parseMirrorDoc,
  planPendingApply,
  resolveDirectoryToProject,
  type AgentJournalEntry,
} from '../src/domain/agentChannel.ts';

const makeTask = (id: string, overrides: Partial<Task> = {}): Task => {
  const base = createTask({ title: `Task ${id}` }, 1);
  return { ...base, ...overrides, id };
};
const entry = (over: Partial<Extract<AgentJournalEntry, { kind: 'create' }>>): AgentJournalEntry => ({
  id: 'a_0123456789abcdef', v: 1, kind: 'create', at: 1000,
  title: 'From an agent', description: '', directory: null, projectId: null, status: 'backlog',
  ...over,
});
const noteEntry = (over: Partial<Extract<AgentJournalEntry, { kind: 'note' }>>): AgentJournalEntry => ({
  id: 'a_fedcba9876543210', v: 1, kind: 'note', at: 1000, taskId: 't_x', text: 'wrap-up',
  ...over,
});

// ---- parseJournalEntry ----

test('journal entries validate like task records: reasons, not crashes', () => {
  assert.equal(parseJournalEntry(entry({})).kind, 'create');
  assert.equal(parseJournalEntry(noteEntry({})).kind, 'note');
  assert.throws(() => parseJournalEntry(entry({ v: 2 as never })), /version/);
  assert.throws(() => parseJournalEntry(entry({ id: 'nope' as never })), /id/);
  assert.throws(() => parseJournalEntry(noteEntry({ kind: 'move' as never })), /kind/);
  assert.throws(() => parseJournalEntry(entry({ title: '  ' })), /title/);
  assert.throws(() => parseJournalEntry(entry({ status: 'done' as never })), /status/);
  assert.throws(() => parseJournalEntry(noteEntry({ text: 'x'.repeat(2001) })), /note/);
});

// ---- agent request parsing ----

test('agent create requests are refused with reasons the agent can act on, not clamped', () => {
  assert.deepEqual(parseAgentCreateRequest({ title: ' Do it ' }), { title: 'Do it', description: '', directory: null, status: 'backlog' });
  assert.deepEqual(parseAgentCreateRequest({ title: 't', status: 'todo' }).status, 'todo');
  assert.throws(() => parseAgentCreateRequest({}), /title/);
  assert.throws(() => parseAgentCreateRequest({ title: ' ' }), /title/);
  assert.throws(() => parseAgentCreateRequest({ title: 'x'.repeat(201) }), /limited to 200/);
  assert.throws(() => parseAgentCreateRequest({ title: 't', status: 'done' }), /backlog/);
  assert.throws(() => parseAgentCreateRequest({ title: 't', directory: 4 }), /directory/);
  assert.throws(() => parseAgentNoteRequest({}), /needs text/);
  assert.throws(() => parseAgentNoteRequest({ text: 'x'.repeat(2001) }), /limited to 2000/);
  assert.equal(parseAgentNoteRequest({ text: ' wrapped ' }).text, ' wrapped ');
});

// ---- directory -> project mapping ----

test('a directory maps onto the longest project it lives under, never across a path boundary', () => {
  const projects = [
    { id: 'p1', name: 'repo', directory: '/repo' },
    { id: 'p2', name: 'rec', directory: '/rec' },
    { id: 'p3', name: 'nested', directory: '/repo/packages/one' },
  ];
  assert.equal(resolveDirectoryToProject(projects, '/rec'), 'p2');
  assert.equal(resolveDirectoryToProject(projects, '/repo'), 'p1');
  assert.equal(resolveDirectoryToProject(projects, '/repo/sub/dir'), 'p1');
  assert.equal(resolveDirectoryToProject(projects, '/repo/packages/one/src'), 'p3');
  assert.equal(resolveDirectoryToProject(projects, '/record'), null);
  assert.equal(resolveDirectoryToProject(projects, '/nowhere'), null);
  assert.equal(resolveDirectoryToProject(projects, null), null);
});

// ---- the mirror ----

test('the mirror doc carries views with project names; parsing is lenient and drops junk rows', () => {
  const tasks = [
    makeTask('t_aaa', { updatedAt: 5 }),
    makeTask('t_bbb', { updatedAt: 9 }),
  ];
  const doc = buildMirrorDoc(tasks, [{ id: 'p1', name: 'repo', directory: '/repo' }], 7);
  assert.equal(doc.v, 1);
  assert.equal(doc.savedAt, 7);
  assert.deepEqual(doc.projects, [{ id: 'p1', name: 'repo', directory: '/repo' }]);
  assert.ok(doc.tasks.every((view) => view.projectName === null || view.projectName === 'repo'));

  const parsed = parseMirrorDoc(JSON.parse(JSON.stringify({ ...doc, tasks: [...doc.tasks, { junk: true }, null] })));
  assert.equal(parsed?.tasks.length, 2);
  assert.equal(parseMirrorDoc({ v: 2 }), null);
  assert.equal(parseMirrorDoc('nope'), null);
  // Row junk is dropped leniently, not fatal — the mirror still serves what it can hold.
  const lenient = parseMirrorDoc({ v: 1, savedAt: 7, projects: 'odd', tasks: 'odd' });
  assert.deepEqual(lenient?.projects, []);
  assert.deepEqual(lenient?.tasks, []);
});

test('the mirror is cut back until its JSON fits the request body cap, keeping the newest work', () => {
  const big = 'x'.repeat(1600);
  const tasks = Array.from({ length: 100 }, (_, index) =>
    makeTask(`t_${String(index).padStart(3, '0')}`, { description: big, updatedAt: index }));
  const doc = buildMirrorDoc(tasks, [], 1);
  assert.ok(JSON.stringify(doc).length <= 50_000, 'mirror must fit the 64k request envelope');
  // A cut happened: descriptions were shortened or dropped, every task still listed.
  assert.ok(doc.tasks.every((view) => view.description.length <= 400));
  // Tasks ordered oldest first, the whole set still present.
  assert.equal(doc.tasks.length, 100);
  assert.equal(doc.tasks[0]!.id, 't_000');
  // A truly huge board is truncated, not pushed: oldest tasks give way, the
  // newest always survives.
  const larger = Array.from({ length: 400 }, (_, index) =>
    makeTask(`t_${String(index).padStart(3, '0')}`, { description: big, updatedAt: index }));
  const cutDoc = buildMirrorDoc(larger, [], 1);
  const ids = cutDoc.tasks.map((view) => view.id);
  assert.ok(ids.includes('t_399'), 'the newest task survives any cut');
  assert.ok(!ids.includes('t_000'), 'the oldest gives way first');
  assert.ok(JSON.stringify(cutDoc).length <= 50_000);
});

// ---- applying the journal ----

test('creates resolve their project (entry pick first, then directory), land at the column end, and get board ids', () => {
  const boardTasks = [makeTask('t_aaa')];
  const projects = [{ id: 'p1', directory: '/repo' }];
  const plan = planPendingApply(
    [
      entry({ id: 'a_1', projectId: 'p1', status: 'todo' }),
      entry({ id: 'a_2', projectId: 'gone', directory: '/repo/worktrees/w1' }),
      entry({ id: 'a_3', directory: '/nowhere' }),
    ],
    boardTasks,
    projects,
    () => 't_newab12',
    2000,
  );
  assert.equal(plan.creates.length, 3);
  assert.deepEqual(plan.dropped, []);
  assert.equal(plan.creates[0]!.entryId, 'a_1');
  assert.equal(plan.creates[0]!.task.projectId, 'p1');
  assert.equal(plan.creates[0]!.task.status, 'todo');
  assert.equal(plan.creates[1]!.task.projectId, 'p1', 'the entry pick no longer exists — the directory resolves instead');
  assert.equal(plan.creates[2]!.task.projectId, null, 'nothing matched — unplaced, not misplaced');
  // `todo` has no tasks yet → column's first step rank; `backlog` holds one task (rank 1) → appended after it.
  assert.equal(plan.creates[0]!.task.rank, 1024);
  assert.equal(plan.creates[1]!.task.rank, 1025);
  assert.equal(plan.creates[2]!.task.rank, 1025);
  const roundTrip = plan.creates.map((created) => parseTask(created.task));
  assert.equal(roundTrip.length, 3);
});

test('notes fold onto their task; unknown tasks drop with an ack; a note storm keeps the newest', () => {
  const boardTasks = [makeTask('t_aaa')];
  const single = planPendingApply(
    [noteEntry({ id: 'a_1', taskId: 't_aaa', text: ' done. ' })],
    boardTasks, [], () => 't_x', 5000,
  );
  assert.deepEqual(single.dropped, []);
  assert.equal(single.notes.length, 1);
  assert.deepEqual(single.notes[0]!.entryIds, ['a_1']);

  const unknown = planPendingApply(
    [noteEntry({ id: 'a_2', taskId: 't_gone' })],
    boardTasks, [], () => 't_x', 5000,
  );
  assert.deepEqual(unknown.dropped, ['a_2']);
  assert.deepEqual(unknown.notes, []);

  // Five notes to one task in one pull: one patched task, all entries listed for the ack.
  const many = planPendingApply(
    Array.from({ length: 5 }, (_, index) => noteEntry({ id: `a_n${index}`, taskId: 't_aaa', text: `note ${index}` })),
    boardTasks, [], () => 't_x', 5000,
  );
  assert.deepEqual(many.notes[0]!.entryIds, ['a_n0', 'a_n1', 'a_n2', 'a_n3', 'a_n4']);
  assert.equal(many.notes[0]!.task.agentNotes?.length, 5);
  assert.equal(many.notes[0]!.task.agentNotes?.[0]!.text, 'note 0');
});
