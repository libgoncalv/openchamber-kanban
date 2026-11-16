// Dictation routes for the local service. Audio never leaves the machine:
// the panel posts base64 Int16 PCM at 16 kHz, the service decodes it and runs
// the local sherpa-onnx recognizer. A request body is capped well under the
// host's GUEST_REQUEST_BODY_MAX (64 000 characters) by the sender, so longer
// clips arrive as ordered chunks: /transcribe/begin, several /transcribe/append
// calls, then /transcribe/finish. The one-shot POST /transcribe remains for
// callers that have a whole short clip in one body.
import type { Transcriber } from './recognizer.ts';

const SAMPLE_RATE_MIN = 8000;
const SAMPLE_RATE_MAX = 192000;
/** Largest base64 `pcm16` one request may carry — the wire body cap itself
 * (GUEST_REQUEST_BODY_MAX, 64 000 characters): nothing bigger can arrive. */
const REQUEST_BASE64_MAX = 64_000;
/** Hard ceiling per clip, 120 s of 16 kHz — everything past it is refused. */
const CLIP_SAMPLES_MAX = 120 * 16_000;
/** Concurrent clip sessions; far more than one panel can produce at once. */
const SESSIONS_MAX = 4;
/** Idle clips expire; the panel normally finishes or cancels long before. */
const SESSION_TTL_MS = 5 * 60_000;

export type RouteAnswer = { status: number; json: Record<string, unknown> };

const ok = (json: Record<string, unknown>, status = 200): RouteAnswer => ({ status, json });
const fail = (status: number, error: string): RouteAnswer => ({ status, json: { error } });

/** Int16 little-endian base64 -> Float32 in [-1, 1]. */
export const pcm16Base64ToFloat32 = (base64: string): Float32Array => {
  // The panel's btoa output is always plain base64; anything else is a
  // malformed request (Buffer's decoder silently skips bad characters).
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64)) throw new Error('pcm16 is not valid base64');
  const bytes = Buffer.from(base64, 'base64');
  if (bytes.length === 0) throw new Error('pcm16 decodes to no samples');
  if (bytes.length % 2 !== 0) throw new Error('pcm16 payload has an odd number of bytes');
  const samples = new Float32Array(bytes.length / 2);
  for (let i = 0; i < samples.length; i++) {
    samples[i] = bytes.readInt16LE(i * 2) / 32768;
  }
  return samples;
};

const isPositiveInt = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value > 0;

const parseBody = (body: string): Record<string, unknown> | null => {
  try {
    const parsed: unknown = JSON.parse(body);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
};

type ClipSession = { samples: Float32Array; sampleRate: number; touchedAt: number };

/**
 * The route handlers, parameterised by the recognizer so tests can inject a
 * fake without the native addon or the model on disk.
 */
export const createTranscribeRoutes = (transcriber: Transcriber) => {
  const sessions = new Map<string, ClipSession>();

  const newSessionId = (): string =>
    Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

  const expire = (now: number = Date.now()): void => {
    for (const [id, session] of sessions) {
      if (now - session.touchedAt > SESSION_TTL_MS) sessions.delete(id);
    }
  };

  const transcribeSessionSamples = async (session: ClipSession): Promise<RouteAnswer> => {
    try {
      const text = await transcriber.transcribe(session.samples, session.sampleRate);
      return ok({ text });
    } catch (error) {
      return fail(503, error instanceof Error ? error.message : String(error));
    }
  };

  const handle = async (method: string, pathname: string, body: string): Promise<RouteAnswer> => {
    if (method !== 'POST') return fail(404, 'not-found');
    const input = parseBody(body);

    // One-shot: the whole clip in a single body (small clips only, the wire
    // body cap applies).
    if (pathname === '/transcribe') {
      if (!input) return fail(400, 'Request body must be JSON');
      const { pcm16, sampleRate } = input;
      if (typeof pcm16 !== 'string' || pcm16.length === 0) return fail(400, 'pcm16 (base64 string) is required');
      if (pcm16.length > REQUEST_BASE64_MAX) return fail(413, `Clip too large for one request — use the chunked flow (${pcm16.length} > ${REQUEST_BASE64_MAX} characters)`);
      if (!isPositiveInt(sampleRate) || sampleRate < SAMPLE_RATE_MIN || sampleRate > SAMPLE_RATE_MAX) {
        return fail(400, `sampleRate must be an integer between ${SAMPLE_RATE_MIN} and ${SAMPLE_RATE_MAX}`);
      }
      let samples: Float32Array;
      try {
        samples = pcm16Base64ToFloat32(pcm16);
      } catch (error) {
        return fail(400, `Invalid pcm16: ${error instanceof Error ? error.message : String(error)}`);
      }
      try {
        const text = await transcriber.transcribe(samples, sampleRate);
        return ok({ text });
      } catch (error) {
        return fail(503, error instanceof Error ? error.message : String(error));
      }
    }

    if (pathname === '/transcribe/begin' && method === 'POST') {
      if (!input) return fail(400, 'Request body must be JSON');
      const { sampleRate } = input;
      if (!isPositiveInt(sampleRate) || sampleRate < SAMPLE_RATE_MIN || sampleRate > SAMPLE_RATE_MAX) {
        return fail(400, `sampleRate must be an integer between ${SAMPLE_RATE_MIN} and ${SAMPLE_RATE_MAX}`);
      }
      expire();
      if (sessions.size >= SESSIONS_MAX) return fail(429, 'Too many clips in flight — finish or cancel one first');
      const id = newSessionId();
      sessions.set(id, { samples: new Float32Array(0), sampleRate, touchedAt: Date.now() });
      return ok({ id });
    }

    // Appends below need an id and a payload; finish needs only the id.
    const session = (() => {
      if (pathname === '/transcribe/append' || pathname === '/transcribe/finish' || pathname === '/transcribe/cancel') {
        if (!input) return undefined;
        const id = input.id;
        if (typeof id !== 'string') return undefined;
        // Expire before the lookup so a stale id is "not found", not a crash.
        expire(Date.now());
        return { id, clip: sessions.get(id) };
      }
      return undefined;
    })();

    if (pathname === '/transcribe/finish') {
      if (!session?.clip) return fail(404, 'Unknown clip id — begin or append first, or the clip expired');
      sessions.delete(session.id);
      return transcribeSessionSamples(session.clip);
    }

    if (pathname === '/transcribe/cancel') {
      if (!session || !sessions.has(session.id)) return ok({ cancelled: false });
      sessions.delete(session.id);
      return ok({ cancelled: true });
    }

    if (pathname === '/transcribe/append') {
      if (!session) return fail(400, 'id (string) is required');
      const { pcm16 } = input ?? {};
      if (typeof pcm16 !== 'string' || pcm16.length === 0) return fail(400, 'pcm16 (base64 string) is required');
      if (pcm16.length > REQUEST_BASE64_MAX) return fail(413, `pcm16 too large (${pcm16.length} > ${REQUEST_BASE64_MAX} characters)`);
      let samples: Float32Array;
      try {
        samples = pcm16Base64ToFloat32(pcm16);
      } catch (error) {
        return fail(400, `Invalid pcm16: ${error instanceof Error ? error.message : String(error)}`);
      }
      if (!session.clip) return fail(404, 'Unknown clip id — begin or append first, or the clip expired');
      const clip = session.clip;
      if (clip.sampleRate !== undefined && samples.length > 0 && clip.samples.length + samples.length > CLIP_SAMPLES_MAX) {
        return fail(413, `Clip exceeds ${CLIP_SAMPLES_MAX / 16000}s at 16 kHz`);
      }
      clip.samples = concatFloat32(clip.samples, samples);
      clip.touchedAt = Date.now();
      return ok({ samples: clip.samples.length });
    }

    return fail(404, 'not-found');
  };

  return { handle, sessions };
};

const concatFloat32 = (a: Float32Array, b: Float32Array): Float32Array => {
  if (a.length === 0) return b;
  const out = new Float32Array(a.length + b.length);
  out.set(a);
  out.set(b, a.length);
  return out;
};
