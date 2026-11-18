import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createAgentStore } from '../src/service/agentStore.ts';
import { buildMirrorDoc, type AgentJournalEntry } from '../src/domain/agentChannel.ts';
import { createTask } from '../src/domain/task.ts';

const withStore = async (run: (store: ReturnType<typeof createAgentStore>, dir: string) => Promise<void>) => {
  const dir = await mkdtemp(join(tmpdir(), 'kanban-agent-'));
  try {
    await run(createAgentStore({ dataDir: dir }), dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
};

const createEntry = (index: number): AgentJournalEntry => ({
  id: `a_${index.toString(16).padStart(16, '0')}`, v: 1, kind: 'create', at: 1000, title: `Task ${index}`, description: '',
  directory: null, projectId: null, status: 'backlog',
});

test('the mirror round-trips through disk; a corrupt or missing mirror reads as null', async () => {
  await withStore(async (store, dir) => {
    assert.equal(await store.readMirror(), null);
    const doc = buildMirrorDoc([createTask({ title: 'Task one' }, 1)], [], 42);
    await store.writeMirror(doc);
    assert.deepEqual(await store.readMirror(), doc);
    // The write is atomic (temp + rename) and leaves no temp file behind.
    const listing = await readdirSafe(dir);
    assert.ok(!listing.includes('mirror.json.tmp'), 'temp files do not survive a write');
    await writeFile(join(dir, 'mirror.json'), 'not json{', 'utf8');
    assert.equal(await store.readMirror(), null);
  });
});

test('journal appends, pending reads, and acks remove exactly the acknowledged ids', async () => {
  await withStore(async (store, dir) => {
    assert.deepEqual(await store.readPending(), []);
    assert.equal(await store.pendingCount(), 0);
    await store.appendPending([createEntry(1), createEntry(2)]);
    let pending = await store.readPending();
    assert.deepEqual(pending.map((entry) => entry.id), [createEntry(1).id, createEntry(2).id]);
    await store.appendPending([createEntry(3)]);
    assert.equal(await store.pendingCount(), 3);
    // An unknown id is a no-op; the file content stays valid JSON lines.
    await store.ackPending(['a_ffffffffffffffff', createEntry(2).id]);
    pending = await store.readPending();
    assert.deepEqual(pending.map((entry) => entry.id), [createEntry(1).id, createEntry(3).id]);
    // Acking everything leaves an empty (not corrupt) journal.
    await store.ackPending([createEntry(1).id, createEntry(3).id]);
    assert.deepEqual(await store.readPending(), []);
    const raw = await readFile(join(dir, 'journal.jsonl'), 'utf8');
    assert.equal(raw.trim(), '');
    assert.equal(await store.pendingCount(), 0);
  });
});

test('a corrupt journal line is skipped, never fatal; the file keeps its mode', async () => {
  await withStore(async (store, dir) => {
    await store.appendPending([createEntry(1)]);
    // Simulate a torn write: junk between good lines.
    const raw = await readFile(join(dir, 'journal.jsonl'), 'utf8');
    const torn = `${raw}{"id":"a_2"}\n\n[broken\n${JSON.stringify(createEntry(3))}\n`;
    await writeFile(join(dir, 'journal.jsonl'), torn, 'utf8');
    const pending = await store.readPending();
    assert.deepEqual(pending.map((entry) => entry.id), [createEntry(1).id, createEntry(3).id]);
    await store.ackPending([createEntry(1).id, createEntry(3).id]);
    assert.deepEqual(await store.readPending(), []);
  });
});

test('the journal refuses to grow past its cap — the board must catch up first', async () => {
  await withStore(async (store) => {
    for (let index = 0; index < 200; index += 1) {
      await store.appendPending([createEntry(index)]);
    }
    assert.equal(await store.pendingCount(), 200);
    await assert.rejects(() => store.appendPending([createEntry(1000)]), /full/i);
    await store.ackPending([createEntry(0).id]);
    // After catching up there is room again.
    await store.appendPending([createEntry(1000)]);
    assert.equal(await store.pendingCount(), 200);
  });
});

const readdirSafe = async (dir: string): Promise<string[]> => {
  try { return await readdir(dir); }
  catch { return []; }
};
