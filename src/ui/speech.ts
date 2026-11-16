/**
 * Pure audio helpers for local voice dictation, shared by the UI and tested in
 * node without any DOM or SDK import. The guest receives mono Float32 samples
 * from the host's microphone capture at the frame's AudioContext rate (about
 * 48 kHz in practice), downsamples them to 16 kHz, encodes Int16 PCM, and
 * splits the result into base64 chunks small enough for `serviceRequest`
 * (the wire caps a request body at GUEST_REQUEST_BODY_MAX characters).
 */

/** The STT model is trained on 16 kHz audio; every service request uses it. */
export const TARGET_SAMPLE_RATE = 16_000;

/**
 * Per-request PCM budget. Base64 inflates 3 bytes into 4 characters, and the
 * body string carries JSON around it (`{"id":"…","pcm16":"…"}`), so the chunk
 * is chosen so that chunk + overhead stays under the wire cap with headroom.
 * 43 200 bytes = 21 600 samples = 1.35 s of 16 kHz audio per request.
 */
export const PCM_CHUNK_BYTES = 43_200;

/** How long a single dictation may record before auto-stopping. */
export const MAX_CLIP_SECONDS = 120;

/**
 * A 0..1 loudness level for mono samples, metered the way OpenChamber's own
 * dictation capture does it: root mean square scaled by 2 and clamped, so
 * quiet speech lands around 0.1 and normal speech around 0.3–0.6. Feeds the
 * recording panel's live bars; pure math so it stays testable in node.
 */
export const levelFromSamples = (samples: Float32Array): number => {
  if (samples.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < samples.length; i++) {
    const sample = samples[i] ?? 0;
    sum += sample * sample;
  }
  const rms = Math.sqrt(sum / samples.length);
  return Math.min(1, Math.max(0, rms * 2));
};

/**
 * Downsample (or resample) mono samples to `target`. When the rates divide
 * evenly (48 kHz → 16 kHz) the samples in each box are averaged, which acts
 * as a cheap low-pass against aliasing; otherwise falls back to linear
 * interpolation. Returns the input unchanged when rates already match.
 */
export const resample = (samples: Float32Array, fromRate: number, toRate: number): Float32Array => {
  if (!Number.isFinite(fromRate) || fromRate <= 0 || !Number.isFinite(toRate) || toRate <= 0) {
    throw new Error(`Invalid sample rates: ${fromRate} -> ${toRate}`);
  }
  if (fromRate === toRate) return samples;
  if (samples.length === 0) return new Float32Array(0);
  if (fromRate % toRate === 0) {
    const factor = fromRate / toRate;
    const out = new Float32Array(Math.ceil(samples.length / factor));
    for (let i = 0; i < out.length; i++) {
      const start = Math.round(i * factor);
      const end = Math.min(Math.round((i + 1) * factor), samples.length);
      let sum = 0;
      for (let j = start; j < end; j++) sum += samples[j] ?? 0;
      out[i] = sum / (end - start);
    }
    return out;
  }
  const outLength = Math.max(1, Math.round((samples.length * toRate) / fromRate));
  const out = new Float32Array(outLength);
  const step = fromRate / toRate;
  for (let i = 0; i < outLength; i++) {
    const position = i * step;
    const before = Math.floor(position);
    const after = Math.min(before + 1, samples.length - 1);
    const weight = position - before;
    out[i] = (samples[before] ?? 0) * (1 - weight) + (samples[after] ?? 0) * weight;
  }
  return out;
};

/** Clamp a float sample to the Int16 range and round to nearest. */
const toInt16 = (sample: number): number => {
  const clamped = Math.max(-1, Math.min(1, sample));
  // Symmetric to the /32768 decode: full-scale 1 clamps one step down.
  return Math.max(-32768, Math.min(32767, Math.round(clamped * 32768)));
};

/** Mono Float32 samples in [-1, 1] as little-endian Int16PCM bytes. */
export const float32ToPcm16 = (samples: Float32Array): Uint8Array => {
  const bytes = new Uint8Array(samples.length * 2);
  for (let i = 0; i < samples.length; i++) {
    const value = toInt16(samples[i] ?? 0);
    bytes[i * 2] = value & 0xff;
    bytes[i * 2 + 1] = (value >> 8) & 0xff;
  }
  return bytes;
};

// base64 of the PCM bytes, chunk-safe for the serviceRequest body cap.
const btoa = (value: string): string => {
  const globalBtoa = globalThis.btoa;
  if (typeof globalBtoa === 'function') return globalBtoa(value);
  return Buffer.from(value, 'binary').toString('base64');
};

/** Int16 PCM bytes as base64, in chunks of at most `PCM_CHUNK_BYTES`. */
export const pcm16ChunkedBase64 = (bytes: Uint8Array): string[] => {
  const chunks: string[] = [];
  for (let offset = 0; offset < bytes.length; offset += PCM_CHUNK_BYTES) {
    const slice = bytes.subarray(offset, Math.min(offset + PCM_CHUNK_BYTES, bytes.length));
    let binary = '';
    for (let i = 0; i < slice.length; i += 8192) {
      binary += String.fromCharCode(...slice.subarray(i, Math.min(i + 8192, slice.length)));
    }
    chunks.push(btoa(binary));
  }
  return chunks;
};

/** The guest-side one-shot encode: downsample, Int16, chunked base64. */
export const prepareClipChunks = (clip: Float32Array, sampleRate: number): { chunks: string[]; sampleRate: number } => {
  const resampled = resample(clip, sampleRate, TARGET_SAMPLE_RATE);
  return { chunks: pcm16ChunkedBase64(float32ToPcm16(resampled)), sampleRate: TARGET_SAMPLE_RATE };
};

/** One chunk must always fit into a serviceRequest body: JSON wrapper + base64. */
export const maxChunkBodyChars = (chunkBase64: string): number =>
  chunkBase64.length + 64; // `{"id":"<id>","pcm16":"<base64>"}` overhead, id ≤ 40 chars
