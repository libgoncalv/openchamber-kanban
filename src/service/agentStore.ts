import { mkdir, readFile, rename, appendFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { AGENT_JOURNAL_MAX, parseJournalEntry, type AgentJournalEntry, type MirrorDoc } from '../domain/agentChannel.ts';

/**
 * The agent channel's persistent state, in the service's own data dir
 * (`OPENCHAMBER_SERVICE_DATA_DIR` — the host creates and deletes it with the
 * extension). Two files:
 *
 * - `mirror.json` — the last task summary a surface pushed. The service
 *   holds no host.storage access, so agents read whatever was last pushed.
 * - `journal.jsonl` — accepted agent writes, one line each, waiting for an
 *   open surface to apply them into host.storage (`store/agentApply.ts`,
 *   the rail and the page alike; the service process itself may also stop
 *   idle, so the journal must be on disk, not in memory).
 *
 * Writes serialize through one promise chain (the practical concurrency here
 * is a handful of agents); every full rewrite is atomic (temp file + rename).
 * A crash between append and ack can replay an entry, and the stamps the
 * apply writes on the records it creates (`agentEntryIds`) make that replay
 * safe everywhere else — this file's ordering still matters, it just no
 * longer leans on the caller: entries are removed from the file only after
 * a surface confirmed it applied them (ack-before-rewrite), so the file
 * never shrinks on a promise.
 */
export type AgentStore = {
  readMirror: () => Promise<MirrorDoc | null>;
  writeMirror: (doc: MirrorDoc) => Promise<void>;
  pendingCount: () => Promise<number>;
  readPending: () => Promise<AgentJournalEntry[]>;
  /** Appends entries, refusing when the journal is full (the board must catch up first). Returns the count kept. */
  appendPending: (entries: readonly AgentJournalEntry[]) => Promise<void>;
  /** Removes exactly the acknowledged ids; unknown ids are simply absent. */
  ackPending: (ids: readonly string[]) => Promise<void>;
};

const BODY_MAX_BYTES = 8 * 1024 * 1024;

export const createAgentStore = ({ dataDir }: { dataDir: string }): AgentStore => {
  const mirrorPath = join(dataDir, 'mirror.json');
  const journalPath = join(dataDir, 'journal.jsonl');
  let ready = mkdir(dataDir, { recursive: true }).catch(() => undefined);

  /** Full rewrites serialize; appends go straight through (single line each). */
  let chain: Promise<unknown> = Promise.resolve();
  const serialized = <T>(operation: () => Promise<T>): Promise<T> => {
    const next = chain.catch(() => undefined).then(operation);
    chain = next.catch(() => undefined);
    return next;
  };

  const atomicWrite = async (path: string, content: string, mode: number) => {
    const temp = `${path}.tmp`;
    await writeFile(temp, content, { encoding: 'utf8', mode });
    await rename(temp, path);
  };

  return {
    readMirror: async () => {
      await ready;
      try {
        const raw = await readFile(mirrorPath, 'utf8');
        if (raw.length > BODY_MAX_BYTES) return null;
        try { return JSON.parse(raw) as MirrorDoc; } catch { return null; }
      } catch { return null; }
    },
    writeMirror: (doc) => serialized(async () => {
      await ready;
      await atomicWrite(mirrorPath, JSON.stringify(doc), 0o600);
    }),
    pendingCount: async () => {
      await ready;
      return (await readPendingInner(journalPath)).length;
    },
    readPending: async () => {
      await ready;
      return readPendingInner(journalPath);
    },
    appendPending: (entries) => serialized(async () => {
      await ready;
      const existing = await readPendingInner(journalPath);
      if (existing.length + entries.length > AGENT_JOURNAL_MAX) throw new Error('Journal is full');
      const lines = entries.map((entry) => `${JSON.stringify(entry)}\n`).join('');
      await appendFile(journalPath, lines, { encoding: 'utf8' });
    }),
    ackPending: (ids) => serialized(async () => {
      await ready;
      const existing = await readPendingInner(journalPath);
      if (existing.length === 0) return;
      const acked = new Set(ids);
      const kept = existing.filter((entry) => !acked.has(entry.id));
      // Removing the acknowledged lines is the whole durability contract:
      // until this rewrite lands, the entries stay pending and a repeated
      // pull returns them (the board's apply must therefore tolerate a
      // replay — its plan is idempotent per entry id).
      await atomicWrite(journalPath, kept.map((entry) => `${JSON.stringify(entry)}\n`).join(''), 0o600);
    }),
  };
};

const readPendingInner = async (journalPath: string): Promise<AgentJournalEntry[]> => {
  let raw: string;
  try { raw = await readFile(journalPath, 'utf8'); }
  catch { return []; }
  if (raw.length > BODY_MAX_BYTES) return [];
  const entries: AgentJournalEntry[] = [];
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try { entries.push(parseJournalEntry(JSON.parse(trimmed))); }
    catch { /* one corrupt line never takes the journal down */ }
  }
  return entries;
};
