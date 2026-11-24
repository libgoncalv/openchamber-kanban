import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { HostClient, JsonValue } from '@openchamber/sdk';
import { createTask, type Task } from '../src/domain/task.ts';
import { loadTasks } from '../src/store/taskStore.ts';
import { applyAgentJournal } from '../src/store/agentApply.ts';
import type { AgentJournalEntry } from '../src/domain/agentChannel.ts';

/**
 * The journal-apply's shared-op suite. The fake host is the taskOps suite's
 * storage plus a loopback `/agent/pending` + `/agent/pending/ack`: the pull
 * answers what the journal still holds, the ack removes exactly the given
 * ids, both exactly like the service routes do. `onProjects` stands ready
 * for the op's ask-once fallback, though every test here passes a project
 * list and never trips it.
 */
const fakeHost = ({ failPull = false, failAck = false } = {}) => {
  const data = new Map<string, string>();
  const acked = new Set<string>();
  const ackCalls: string[][] = [];
  let journal: AgentJournalEntry[] = [];
  const host: Pick<HostClient, 'storage' | 'serviceRequest' | 'onProjects'> = {
    storage: {
      get: async (key) => (data.has(key) ? (JSON.parse(data.get(key)!) as JsonValue) : undefined),
      set: async (key, value) => { data.set(key, JSON.stringify(value)); },
      delete: async (key) => { data.delete(key); },
      keys: async () => [...data.keys()],
    },
    serviceRequest: (async ({ method, path, body }: { method: string; path: string; body?: string }) => {
      if (path === '/agent/pending' && method === 'GET') {
        if (failPull) return { status: 500, body: JSON.stringify({ error: 'down' }) };
        return { status: 200, body: JSON.stringify({ pending: journal.filter((entry) => !acked.has(entry.id)) }) };
      }
      if (path === '/agent/pending/ack' && method === 'POST') {
        const ids = (JSON.parse(body ?? '{}') as { ids: string[] }).ids;
        ackCalls.push(ids);
        if (failAck) return { status: 500, body: JSON.stringify({ error: 'ack lost' }) };
        for (const id of ids) acked.add(id);
        return { status: 200, body: JSON.stringify({ acked: ids.length, remaining: 0 }) };
      }
      return { status: 404, body: JSON.stringify({ error: 'not-found' }) };
    }) as HostClient['serviceRequest'],
    onProjects: ((listener: (snapshot: { state: string; projects: unknown[] }) => void) => {
      listener({ state: 'ready', projects: [{ id: 'p1', name: 'Repo', directory: '/repo' }] });
      return Promise.resolve(() => undefined);
    }) as HostClient['onProjects'],
  };
  return { host, data, acked, ackCalls, setJournal: (entries: AgentJournalEntry[]) => { journal = entries; } };
};

let entrySeed = 0;
const createEntry = (title: string, over: Partial<Extract<AgentJournalEntry, { kind: 'create' }>> = {}): Extract<AgentJournalEntry, { kind: 'create' }> => ({
  id: `a_${(++entrySeed).toString(16).padStart(16, '0')}`, v: 1, kind: 'create', at: 1000,
  title, description: '', directory: null, projectId: 'p1', status: 'todo',
  ...over,
});
const noteEntry = (taskId: string, text: string, over: Partial<Extract<AgentJournalEntry, { kind: 'note' }>> = {}): Extract<AgentJournalEntry, { kind: 'note' }> => ({
  id: `a_${(++entrySeed).toString(16).padStart(16, '0')}`, v: 1, kind: 'note', at: 1000, taskId, text,
  ...over,
});

/** Deterministic, valid task ids (t_ + base36, 8 chars, the pattern's minimum met): applies inject their own mint. */
let taskSeed = 0;
const stored = (title: string, rank: number, status: Task['status'], extra: Partial<Task> = {}): Task =>
  ({ ...createTask({ title, status }, rank, 1000, `t_${(++taskSeed).toString(36).padStart(8, '0')}`), needsAttentionSince: null, ...extra });

const seed = async (host: Pick<HostClient, 'storage'>, tasks: Task[]) => {
  for (const task of tasks) await host.storage.set(`task:${task.id}`, task as unknown as JsonValue);
};

const PROJECTS = [{ id: 'p1', directory: '/repo' }];

test('an empty journal answers null and writes nothing', async () => {
  const { host } = fakeHost();
  await seed(host, [stored('seed', 100, 'todo')]);
  assert.equal(await applyAgentJournal(host, { projects: PROJECTS, newId: () => 't_new0001' }), null);
  assert.deepEqual((await loadTasks(host)).tasks.map((task) => task.title), ['seed']);
});

test('an unreachable journal answers null: the channel is optional', async () => {
  const { host } = fakeHost({ failPull: true });
  assert.equal(await applyAgentJournal(host, { projects: PROJECTS, newId: () => 't_new0001' }), null);
});

test('a queued create lands at the column end, stamped with its entry, and is acked', async () => {
  const entry = createEntry('From an agent');
  const { host, acked, ackCalls, setJournal } = fakeHost();
  await seed(host, [stored('seed', 100, 'todo')]);
  setJournal([entry]);
  const outcome = await applyAgentJournal(host, { projects: PROJECTS, newId: () => 't_new0001', now: 2000 });
  assert.equal(outcome?.applied, true);
  assert.equal(outcome?.created.length, 1);
  assert.equal(outcome?.created[0]?.adopted, true);
  assert.equal(outcome?.failures, 0);
  assert.equal(outcome?.ackLanded, true);
  const { tasks } = await loadTasks(host);
  assert.equal(tasks.length, 2);
  const made = tasks.find((task) => task.id === 't_new0001')!;
  assert.equal(made.title, 'From an agent');
  assert.equal(made.status, 'todo');
  assert.equal(made.rank, 100 + 1024, 'appended at the end of the target column');
  assert.deepEqual(made.agentEntryIds, [entry.id]);
  assert.ok(acked.has(entry.id), 'applied entries are acknowledged');
  assert.ok(ackCalls.at(-1)!.includes(entry.id));
  assert.equal(await applyAgentJournal(host, { projects: PROJECTS, newId: () => 't_new0002' }), null, 'the drained journal answers null');
});

test('an entry another surface already stamped acks without reapplying — no duplicate card', async () => {
  const entry = createEntry('Arrived twice');
  const { host, acked, setJournal } = fakeHost();
  await seed(host, [stored('already', 100, 'todo', { agentEntryIds: [entry.id] })]);
  setJournal([entry]);
  const outcome = await applyAgentJournal(host, { projects: PROJECTS, newId: () => 't_second01' });
  assert.equal(outcome?.applied, false, 'someone else announced it; this call converges silently');
  assert.equal(outcome?.created.length, 0);
  assert.equal(outcome?.alreadyLanded, 1);
  assert.equal(outcome?.updated.length, 1, 'the caller still converges on the record that carries the entry');
  assert.equal(outcome?.updated[0]?.title, 'already');
  assert.equal((await loadTasks(host)).tasks.length, 1, 'no second card');
  assert.ok(acked.has(entry.id));
});

test('a note folds onto its task, stamps the entry, and a replayed pull (lost ack) folds nothing twice', async () => {
  const entry = noteEntry('t_target', 'wrap-up');
  const { host, acked, setJournal } = fakeHost();
  await seed(host, [stored('target', 100, 'in_progress', { id: 't_target' })]);
  setJournal([entry]);
  const first = await applyAgentJournal(host, { projects: PROJECTS, newId: () => 't_new0001', now: 2000 });
  assert.equal(first?.applied, true);
  assert.deepEqual(first?.noted, ['target']);
  const folded = (await loadTasks(host)).tasks.find((task) => task.id === 't_target')!;
  assert.equal(folded.agentNotes?.[0]?.text, 'wrap-up');
  assert.deepEqual(folded.agentEntryIds, [entry.id]);
  assert.ok(acked.has(entry.id));

  // The ack was "lost": the journal still lists the entry, the plan reads
  // the stamp and answers `alreadyLanded` — never a second note.
  acked.clear();
  const replay = await applyAgentJournal(host, { projects: PROJECTS, newId: () => 't_new0002', now: 3000 });
  assert.equal(replay?.applied, false);
  assert.equal(replay?.alreadyLanded, 1);
  const healed = (await loadTasks(host)).tasks.find((task) => task.id === 't_target')!;
  assert.equal(healed.agentNotes?.length, 1, 'one note, exactly');
  assert.ok(acked.has(entry.id), 'the replay is acked');
});

test('twin saves for the same entry converge on the smallest task id, and both calls ack', async () => {
  const entry = createEntry('Raced');
  const { host, acked, ackCalls, setJournal } = fakeHost();
  setJournal([entry]);
  // Two open surfaces pulling the same journal before either acknowledged:
  // both fetches resolve before either op reaches its ack (the ack is each
  // op's last await), so each plans its own mint and saves its own record.
  const [loser, winner] = await Promise.all([
    applyAgentJournal(host, { projects: PROJECTS, newId: () => 't_zbbb02', now: 2000 }),
    applyAgentJournal(host, { projects: PROJECTS, newId: () => 't_yaaa01', now: 2000 }),
  ]);
  assert.equal(loser?.updated.at(-1)?.id, 't_yaaa01', 'the losing call converges on the winner');
  assert.equal(loser?.created.length, 0, 'it announces nothing — the winner says so');
  assert.equal(winner?.created.length, 1);
  assert.equal(winner?.created[0]?.task.id, 't_yaaa01');
  assert.equal(winner?.created[0]?.adopted, true);
  const tasks = (await loadTasks(host)).tasks;
  assert.equal(tasks.length, 1, 'exactly one record carries the entry');
  assert.deepEqual(tasks[0]?.agentEntryIds, [entry.id]);
  assert.equal(tasks[0]?.title, 'Raced');
  assert.equal(ackCalls.length, 2, 'both calls acknowledge; acks are idempotent');
  assert.ok(ackCalls.every((ids) => ids.includes(entry.id)));
  assert.ok(acked.has(entry.id));
});

test('a failed create save keeps its entry pending and reports the failure', async () => {
  const entry = createEntry('Will fail');
  const { host, acked, setJournal } = fakeHost();
  const failingSet = async (key: string, value: JsonValue) => {
    if (key.startsWith('task:t_new0001')) throw new Error('storage down');
    await host.storage.set(key, value);
  };
  const failingHost: typeof host = { ...host, storage: { ...host.storage, set: failingSet } };
  setJournal([entry]);
  const outcome = await applyAgentJournal(failingHost, { projects: PROJECTS, newId: () => 't_new0001' });
  assert.equal(outcome?.applied, false);
  assert.equal(outcome?.failures, 1);
  assert.equal(outcome?.created.length, 0);
  assert.equal(acked.has(entry.id), false, 'the entry stays pending — the next pull retries it');
  assert.equal((await loadTasks(host)).tasks.length, 0, 'nothing half-landed');
});

test('a lost ack after an applied pull answers ackLanded false: the caller reloads, the replay is safe', async () => {
  const entry = createEntry('Applied, ack lost');
  const { host, setJournal } = fakeHost({ failAck: true });
  setJournal([entry]);
  const outcome = await applyAgentJournal(host, { projects: PROJECTS, newId: () => 't_new0001' });
  assert.equal(outcome?.applied, true, 'the card landed before the ack failed');
  assert.equal(outcome?.ackLanded, false);
  assert.equal((await loadTasks(host)).tasks.length, 1);
});

test('a note naming a deleted task answers dropped and acks without a write', async () => {
  const ghost = noteEntry('t_ghost01', 'wrap-up');
  const { host, acked, setJournal } = fakeHost();
  await seed(host, [stored('live', 100, 'todo')]);
  setJournal([ghost]);
  const outcome = await applyAgentJournal(host, { projects: PROJECTS, newId: () => 't_new0001' });
  assert.equal(outcome?.applied, false);
  assert.equal(outcome?.dropped, 1);
  assert.equal(outcome?.failures, 0);
  assert.deepEqual((await loadTasks(host)).tasks.map((task) => task.title), ['live']);
  assert.ok(acked.has(ghost.id));
});
