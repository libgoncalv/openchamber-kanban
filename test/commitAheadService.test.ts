import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { createServiceServer, type ServiceGit } from '../src/service/server.ts';

/**
 * The commits-ahead route (the auto-done rule's one host-side git call):
 * a scripted fake `git` records every invocation so the tests assert the
 * exact argv the route composes — and that a bad ref never reaches git.
 */
const withServer = async (git: ServiceGit, run: (get: (path: string, headers?: Record<string, string>) => Promise<{ status: number; json: any }>, calls: Array<{ directory: string; args: string[] }>) => Promise<void>) => {
  const calls: Array<{ directory: string; args: string[] }> = [];
  const recordingGit: ServiceGit = async (directory, args) => {
    calls.push({ directory, args });
    return git(directory, args);
  };
  const server = createServiceServer({ token: 'token-test', git: recordingGit, transcriber: { transcribe: async () => 'x' } });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = (server.address() as AddressInfo).port;
  const url = `http://127.0.0.1:${port}`;
  const get = async (path: string, headers: Record<string, string> = {}) => {
    const response = await fetch(`${url}${path}`, { headers: { Authorization: 'Bearer token-test', ...headers } });
    return { status: response.status, json: await response.json() };
  };
  try {
    await run(get, calls);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
};

/** git answers its two scripted calls in order: rev-list first, rev-parse second. */
type GitAnswer = Awaited<ReturnType<ServiceGit>>;
const countingGit = (counts: GitAnswer[]): ServiceGit => {
  const queue = [...counts];
  return async () => queue.shift() ?? { ok: false, status: 500, error: 'script exhausted' };
};

test('commits-ahead runs rev-list then rev-parse, and trims the answers', async () => {
  await withServer(
    countingGit([{ ok: true, stdout: '3\n' }, { ok: true, stdout: 'abc123def\n' }]),
    async (get, calls) => {
      const answer = await get('/commits-ahead?directory=/wt&base=main');
      assert.deepEqual(answer, { status: 200, json: { ahead: 3, head: 'abc123def' } });
      assert.deepEqual(calls, [
        { directory: '/wt', args: ['rev-list', '--count', 'main..HEAD'] },
        { directory: '/wt', args: ['rev-parse', 'HEAD'] },
      ]);
    },
  );
});

test('commits-ahead refuses anything that is not a plain ref or directory before git runs', async () => {
  await withServer(
    countingGit([]),
    async (get, calls) => {
      assert.equal((await get('/commits-ahead?directory=relative/wt&base=main')).status, 400);
      assert.equal((await get('/commits-ahead?directory=/wt&base=-upstream')).status, 400, 'a leading dash would be an arg, not a ref');
      assert.equal((await get('/commits-ahead?directory=/wt&base=a..b')).status, 400, 'the range composes its own ..');
      assert.equal((await get('/commits-ahead?directory=/wt&base=%20')).status, 400);
      assert.deepEqual(calls, [], 'nothing reaches git');
    },
  );
});

test('commits-ahead passes git failures through, and answers 500 on unparseable counts', async () => {
  await withServer(
    countingGit([{ ok: false, status: 422, error: 'not a git repository' }]),
    async (get) => {
      const answer = await get('/commits-ahead?directory=/wt&base=main');
      assert.deepEqual(answer, { status: 422, json: { error: 'not a git repository' } });
    },
  );
  await withServer(
    countingGit([{ ok: true, stdout: '2\n' }, { ok: false, status: 500, error: 'fatal: bad revision' }]),
    async (get) => {
      const answer = await get('/commits-ahead?directory=/wt&base=main');
      assert.deepEqual(answer, { status: 500, json: { error: 'fatal: bad revision' } }, 'a failed rev-parse is the same unknown evidence');
    },
  );
  await withServer(
    countingGit([{ ok: true, stdout: 'NaN-ish\n' }, { ok: true, stdout: 'abc\n' }]),
    async (get) => {
      const answer = await get('/commits-ahead?directory=/wt&base=main');
      assert.equal(answer.status, 500);
    },
  );
});

test('commits-ahead stays host-only and requires the bearer like every git route', async () => {
  await withServer(
    countingGit([{ ok: true, stdout: '1\n' }, { ok: true, stdout: 'abc\n' }]),
    async (get) => {
      const unauthorized = await get('/commits-ahead?directory=/wt&base=main', { Authorization: 'Bearer wrong' });
      assert.equal(unauthorized.status, 401);
    },
  );
});

// ---- The project-root evidence mode: commits newer than the session-link anchor ----

/** Pins the exact `--since` date format the route composes: git's space-separated ISO in UTC. */
const sinceIsoUtc = (ms: number): string => {
  const iso = new Date(ms).toISOString();
  return `${iso.slice(0, 10)} ${iso.slice(11, 19)} +0000`;
};

test('commits-ahead answers since mode with the same shape, counting commits newer than the anchor', async () => {
  const anchor = 1795_051_680_000;
  await withServer(
    countingGit([{ ok: true, stdout: '4\n' }, { ok: true, stdout: 'def456abc\n' }]),
    async (get, calls) => {
      const answer = await get(`/commits-ahead?directory=/proj&since=${anchor}`);
      assert.deepEqual(answer, { status: 200, json: { ahead: 4, head: 'def456abc' } });
      assert.deepEqual(calls, [
        { directory: '/proj', args: ['rev-list', '--count', `--since=${sinceIsoUtc(anchor)}`, 'HEAD'] },
        { directory: '/proj', args: ['rev-parse', 'HEAD'] },
      ]);
    },
  );
  await withServer(
    countingGit([{ ok: true, stdout: '0\n' }, { ok: true, stdout: 'def456abc\n' }]),
    async (get) => {
      const answer = await get(`/commits-ahead?directory=/proj&since=${anchor}`);
      assert.deepEqual(answer, { status: 200, json: { ahead: 0, head: 'def456abc' } }, 'no commits since the anchor is simply not a candidate');
    },
  );
});

test('commits-ahead takes exactly one evidence mode, and a bad since never reaches git', async () => {
  await withServer(
    countingGit([]),
    async (get, calls) => {
      assert.equal((await get('/commits-ahead?directory=/proj')).status, 400, 'neither mode');
      assert.equal((await get('/commits-ahead?directory=/proj&base=main&since=1795050000000')).status, 400, 'both modes');
      assert.equal((await get('/commits-ahead?directory=/proj&since=-5')).status, 400);
      assert.equal((await get('/commits-ahead?directory=/proj&since=5abc')).status, 400, 'a digit run only');
      assert.equal((await get('/commits-ahead?directory=/proj&since=12345678901234567')).status, 400, 'more digits than any real epoch');
      assert.equal((await get('/commits-ahead?directory=/proj&since=')).status, 400, 'an empty since is the neither-mode case');
      assert.deepEqual(calls, [], 'nothing reaches git');
    },
  );
});

test('commits-ahead passes git failures through in since mode too', async () => {
  await withServer(
    countingGit([{ ok: false, status: 422, error: 'not a git repository' }]),
    async (get) => {
      const answer = await get('/commits-ahead?directory=/proj&since=1795050000000');
      assert.deepEqual(answer, { status: 422, json: { error: 'not a git repository' } });
    },
  );
});
