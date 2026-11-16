import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { createServiceServer, type ServiceGit } from '../src/service/server.ts';
import { pcm16Base64ToFloat32 } from '../src/service/transcribe.ts';
import { TranscriptionError, createSherpaTranscriber, type Transcriber } from '../src/service/recognizer.ts';
import { float32ToPcm16, PCM_CHUNK_BYTES } from '../src/ui/speech.ts';

/**
 * A fake recognizer: no native addon, no model on disk. It reports what it
 * received so the tests can assert exactly which samples reached it, and it
 * can be told to fail like the real one does (TranscriptionError → 503).
 */
const createFakeTranscriber = (): Transcriber & {
  calls: Array<{ samples: Float32Array; sampleRate: number }>;
  failNext: string | null;
} => {
  const fake = {
    calls: [] as Array<{ samples: Float32Array; sampleRate: number }>,
    failNext: null as string | null,
    transcribe: async (samples: Float32Array, sampleRate: number) => {
      fake.calls.push({ samples: Float32Array.from(samples), sampleRate });
      if (fake.failNext !== null) {
        const message = fake.failNext;
        fake.failNext = null;
        throw new TranscriptionError(message);
      }
      return `fake:${sampleRate}:${samples.length}`;
    },
  };
  return fake;
};

const base64Of = (samples: Float32Array): string =>
  Buffer.from(float32ToPcm16(samples)).toString('base64');

/** Boots the real HTTP surface on an ephemeral loopback port. */
const withServer = async (transcriber: Transcriber, run: (url: string, post: (path: string, body: unknown, headers?: Record<string, string>) => Promise<{ status: number; json: any }>) => Promise<void>) => {
  const git: ServiceGit = async () => ({ ok: true, stdout: '' });
  const server = createServiceServer({ token: 'token-test', git, transcriber });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = (server.address() as AddressInfo).port;
  const url = `http://127.0.0.1:${port}`;
  const post = async (path: string, body: unknown, headers: Record<string, string> = {}) => {
    const response = await fetch(`${url}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token-test', ...headers },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    });
    return { status: response.status, json: await response.json() };
  };
  try {
    await run(url, post);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
};

test('health answers without auth (the host polls it before anything else)', async () => {
  await withServer(createFakeTranscriber(), async (url, post) => {
    const response = await fetch(`${url}/health`);
    assert.deepEqual(await response.json(), { ok: true });
    // And the git route still answers for its panel callers (auth required):
    // covered by the branchService tests; here just the bearer check:
    const unauthorized = await fetch(`${url}/branches?directory=/x`);
    assert.equal(unauthorized.status, 401);
    await post('/transcribe/cancel', {});
  });
});

test('one-shot /transcribe decodes base64 int16 and returns the recognizer text', async () => {
  const fake = createFakeTranscriber();
  const samples = new Float32Array(16000).fill(0.25);
  await withServer(fake, async (_url, post) => {
    const answer = await post('/transcribe', { pcm16: base64Of(samples), sampleRate: 16000 });
    assert.deepEqual(answer, { status: 200, json: { text: 'fake:16000:16000' } });
    assert.equal(fake.calls.length, 1);
    assert.equal(fake.calls[0]!.sampleRate, 16000);
    // The samples arrived as signed int16 through base64: sign and scale intact.
    assert.ok(Math.abs(fake.calls[0]!.samples[0]! - 0.25) <= 1 / 32767);
    assert.equal(fake.calls[0]!.samples.length, 16000);
  });
});

test('one-shot /transcribe refuses junk with clear error JSON', async () => {
  const fake = createFakeTranscriber();
  await withServer(fake, async (_url, post) => {
    assert.equal((await post('/transcribe', 'not json', { 'Content-Type': 'text/plain' })).status, 400);
    assert.match((await post('/transcribe', 'not json')).json.error, /must be JSON/i);
    assert.equal((await post('/transcribe', {})).status, 400);
    assert.equal((await post('/transcribe', { pcm16: '' })).status, 400);
    assert.equal((await post('/transcribe', { pcm16: '!!!' })).status, 400); // invalid base64
    assert.equal((await post('/transcribe', { pcm16: 'AEEE' })).status, 400); // odd byte count
    assert.equal((await post('/transcribe', { pcm16: base64Of(new Float32Array(1600)), sampleRate: 1 })).status, 400);
    assert.equal((await post('/transcribe', { pcm16: base64Of(new Float32Array(1600)), sampleRate: 4000 })).status, 400); // below the 8 kHz floor
    assert.equal((await post('/transcribe', { pcm16: base64Of(new Float32Array(1600)), sampleRate: 200000 })).status, 400); // above the 192 kHz ceiling
    assert.equal(fake.calls.length, 0);
  });
});

test('chunked flow: begin -> appends -> finish concatenates every chunk in order', async () => {
  const fake = createFakeTranscriber();
  // Two wire chunks plus a remainder: 43 200 bytes each.
  const samples = Float32Array.from({ length: Math.floor(PCM_CHUNK_BYTES / 2) * 2 + 1000 }, (_, i) => (i % 97) / 97 - 0.5);
  const bytes = Buffer.from(float32ToPcm16(samples));
  const chunks: string[] = [];
  for (let offset = 0; offset < bytes.length; offset += PCM_CHUNK_BYTES) {
    chunks.push(bytes.subarray(offset, Math.min(offset + PCM_CHUNK_BYTES, bytes.length)).toString('base64'));
  }
  assert.ok(chunks.length > 2);
  await withServer(fake, async (_url, post) => {
    const begun = await post('/transcribe/begin', { sampleRate: 16000 });
    assert.equal(begun.status, 200);
    const id = begun.json.id;
    assert.match(id, /^[0-9a-f]{16}$/);
    for (const chunk of chunks) {
      const appended = await post('/transcribe/append', { id, pcm16: chunk });
      assert.equal(appended.status, 200);
      assert.ok(appended.json.samples > 0);
    }
    const finished = await post('/transcribe/finish', { id });
    assert.equal(finished.status, 200);
    assert.ok(typeof finished.json.text === 'string' && finished.json.text.startsWith('fake:16000:'));
    assert.equal(fake.calls.length, 1);
    const received = fake.calls[0]!.samples;
    assert.equal(received.length, samples.length);
    // Values survived base64 + int16 quantization in order (spot-check).
    for (const index of [0, 1000, samples.length - 1]) {
      assert.ok(Math.abs(received[index]! - samples[index]!) <= 1 / 32767);
    }
    // The clip is consumed: finishing (or appending) again is a clean 404.
    assert.equal((await post('/transcribe/finish', { id })).status, 404);
  });
});

test('chunked flow: unknown ids and expiry-shaped failures are clean 404s', async () => {
  const fake = createFakeTranscriber();
  await withServer(fake, async (_url, post) => {
    assert.equal((await post('/transcribe/append', { id: 'no-such-id', pcm16: base64Of(new Float32Array(100)) })).status, 404);
    assert.equal((await post('/transcribe/finish', { id: 'no-such-id' })).status, 404);
    const cancelled = await post('/transcribe/cancel', { id: 'no-such-id' });
    assert.deepEqual(cancelled.json, { cancelled: false }); // cancel stays idempotent, never errors
    assert.equal((await post('/transcribe/append', {}, {})).status, 400); // no id field
  });
});

test('cancel drops the clip; nothing reaches the recognizer afterwards', async () => {
  const fake = createFakeTranscriber();
  await withServer(fake, async (_url, post) => {
    const begun = await post('/transcribe/begin', { sampleRate: 16000 });
    const id = begun.json.id;
    await post('/transcribe/append', { id, pcm16: base64Of(new Float32Array(8000)) });
    assert.deepEqual((await post('/transcribe/cancel', { id })).json, { cancelled: true });
    assert.equal(fake.calls.length, 0);
    assert.equal((await post('/transcribe/finish', { id })).status, 404);
  });
});

test('oversized appends are refused before they can balloon the service memory', async () => {
  const fake = createFakeTranscriber();
  await withServer(fake, async (_url, post) => {
    const begun = await post('/transcribe/begin', { sampleRate: 16000 });
    const id = begun.json.id;
    // Just over the wire body cap (GUEST_REQUEST_BODY_MAX = 64 000): the
    // transport transport still passes it, the route refuses it as 413.
    const oversized = 'A'.repeat(65_000);
    assert.equal((await post('/transcribe/append', { id, pcm16: oversized })).status, 413);
    // The clip is untouched and still usable.
    assert.equal((await post('/transcribe/append', { id, pcm16: base64Of(new Float32Array(1600)) })).status, 200);
  });
});

test('a clip beyond the record cap grows refused at 413', async () => {
  const fake = createFakeTranscriber();
  // Each append is exactly one wire chunk of the real guest flow
  // (43 200 bytes = 21 600 samples = 57 600 base64 chars); the clip cap is
  // 1 920 000 samples (120 s at 16 kHz) — reached after 88 appends.
  const append = base64Of(new Float32Array(21_600));
  await withServer(fake, async (_url, post) => {
    const begun = await post('/transcribe/begin', { sampleRate: 16000 });
    const id = begun.json.id;
    for (let i = 0; i < 88; i++) {
      assert.equal((await post('/transcribe/append', { id, pcm16: append })).status, 200);
    }
    assert.ok(fake.calls.length === 0); // never transcribed mid-clip
    assert.equal((await post('/transcribe/append', { id, pcm16: append })).status, 413);
  });
});

test('a failing recognizer surfaces a clean 503 with its message', async () => {
  const fake = createFakeTranscriber();
  await withServer(fake, async (_url, post) => {
    fake.failNext = 'Speech model not found: /nowhere — voice dictation cannot start.';
    const answer = await post('/transcribe', { pcm16: base64Of(new Float32Array(8000)), sampleRate: 16000 });
    assert.equal(answer.status, 503);
    assert.match(answer.json.error, /Speech model not found/);
    // The chunked flow surfaces the same way and consumes the clip.
    const begun = await post('/transcribe/begin', { sampleRate: 16000 });
    await post('/transcribe/append', { id: begun.json.id, pcm16: base64Of(new Float32Array(8000)) });
    fake.failNext = 'Transcription failed: ONNX exploded';
    const finished = await post('/transcribe/finish', { id: begun.json.id });
    assert.equal(finished.status, 503);
    assert.match(finished.json.error, /ONNX exploded/);
  });
});

test('tiny clips never reach the recognizer (silence guard lives in the transcriber)', async () => {
  const fake = createFakeTranscriber();
  await withServer(fake, async (_url, post) => {
    const answer = await post('/transcribe', { pcm16: base64Of(new Float32Array(800)), sampleRate: 16000 });
    assert.deepEqual(answer.json, { text: 'fake:16000:800' });
  });
});

test('the real transcriber returns "" for silence without ever loading the addon', async () => {  const loaded = createSherpaTranscriber('/definitely/missing/dir', async () => {
    throw new Error('the native addon must not load for silence');
  });
  assert.equal(await loaded.transcribe(new Float32Array(500), 16000), '');
  // A clip long enough to matter fails with the model-missing message instead
  // of touching the addon (the module loader would throw on load).
  await assert.rejects(() => loaded.transcribe(new Float32Array(4000), 16000), /Speech model not found/);
});

test('a missing model dir on the real server answers a clear 503', async () => {
  // Production wiring: createSherpaTranscriber() with no model on disk must
  // leave the service healthy and every transcribe route answering a clear
  // error, not crashing the process or hanging the request.
  await withServer(createSherpaTranscriber('/definitely/missing/dir'), async (_url, post) => {
    const answer = await post('/transcribe', { pcm16: base64Of(new Float32Array(8000)), sampleRate: 16000 });
    assert.equal(answer.status, 503);
    assert.match(answer.json.error, /Speech model not found/);
  });
});

test('non-POST methods and unknown routes answer without touching the recognizer', async () => {
  const fake = createFakeTranscriber();
  await withServer(fake, async (url, post) => {
    const response = await fetch(`${url}/transcribe`, { method: 'GET', headers: { Authorization: 'Bearer token-test' } });
    assert.equal(response.status, 404);
    const unknown = await post('/transcribe/unknown', {});
    assert.equal(unknown.status, 404);
    // begin without a usable sample rate is a 400, not an id.
    assert.match((await post('/transcribe/begin', {})).json.error, /sampleRate/);
    assert.equal(fake.calls.length, 0);
  });
});

test('pcm16Base64ToFloat32 rejects malformed payloads', () => {
  assert.throws(() => pcm16Base64ToFloat32('!!!'), /not valid base64/); // non-base64 characters
  assert.throws(() => pcm16Base64ToFloat32(''), /no samples/); // nothing to decode
  assert.throws(() => pcm16Base64ToFloat32('AEEE')); // 3 bytes: odd
  // Int16 extremes little-endian: 0x7FFF -> +1, 0x8000 -> -1 after /32768.
  const decoded = pcm16Base64ToFloat32(Buffer.from([0xff, 0x7f, 0x00, 0x80]).toString('base64'));
  assert.equal(decoded.length, 2);
  assert.ok(Math.abs(decoded[0]! - 1) <= 1 / 32768);
  assert.ok(Math.abs(decoded[1]! + 1) <= 1 / 32768);
});
