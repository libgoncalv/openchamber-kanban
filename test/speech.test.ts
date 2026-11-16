import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GUEST_REQUEST_BODY_MAX } from '@openchamber/sdk';
import {
  float32ToPcm16,
  levelFromSamples,
  maxChunkBodyChars,
  pcm16ChunkedBase64,
  prepareClipChunks,
  resample,
  TARGET_SAMPLE_RATE,
} from '../src/ui/speech.ts';

test('resample is identity at matching rates and rejects invalid rates', () => {
  const samples = new Float32Array([0.1, 0.5, -0.3]);
  assert.equal(resample(samples, 16000, 16000), samples);
  assert.throws(() => resample(samples, 0, 16000));
  assert.throws(() => resample(samples, 48000, NaN));
});

test('resample averages whole boxes for an integer ratio (48 kHz -> 16 kHz)', () => {
  // One box of 1s, one of 0s, one of -1s.
  const samples = new Float32Array([...Array(48000).fill(1), ...Array(48000).fill(0), ...Array(48000).fill(-1)]);
  const out = resample(samples, 48000, 16000);
  assert.equal(out.length, 48000);
  assert.equal(out[0], 1);
  assert.equal(out[16000], 0);
  assert.equal(out[32000], -1);
  // A partial tail box average still lands (48 full/step samples + 2 leftovers).
  const uneven = new Float32Array([...Array(48).fill(0.5), ...Array(2).fill(1)]);
  const unevenOut = resample(uneven, 48000, 16000);
  assert.equal(unevenOut.length, 17);
  assert.equal(unevenOut[15], 0.5);
  assert.equal(unevenOut[16], 1);
});
test('resample interpolates linearly for a non-integer ratio (44.1 kHz -> 16 kHz)', () => {
  // A constant signal survives resampling within rounding error.
  const samples = new Float32Array(44100).fill(0.25);
  const out = resample(samples, 44100, 16000);
  assert.equal(out.length, Math.round((44100 * 16000) / 44100));
  assert.ok(Math.abs(out[100]! - 0.25) < 1e-6);
  // And a ramp reproduces positions proportionally: the ramp holds indices
  // 0..4410 as values, so output position 1500 reads ramp input 4134.375.
  const ramp = Float32Array.from({ length: 4410 }, (_, i) => i / 4410);
  const resampled = resample(ramp, 44100, 16000);
  const position = (1500 * 44100) / 16000;
  const expected = position / 4410;
  assert.ok(Math.abs(resampled[1500]! - expected) < 1e-3);
});

test('resample keeps an empty input empty', () => {
  assert.equal(resample(new Float32Array(0), 48000, 16000).length, 0);
});

test('float32ToPcm16 clamps and encodes little-endian Int16', () => {
  const bytes = float32ToPcm16(new Float32Array([0, 1, -1, 0.5, -0.5, 2, -2]));
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  assert.equal(view.getInt16(0 * 2, true), 0);
  assert.equal(view.getInt16(1 * 2, true), 32767); // full scale clamps one step down
  assert.equal(view.getInt16(2 * 2, true), -32768);
  assert.equal(view.getInt16(3 * 2, true), 16384);
  assert.equal(view.getInt16(4 * 2, true), -16384);
  assert.equal(view.getInt16(5 * 2, true), 32767);
  assert.equal(view.getInt16(6 * 2, true), -32768);
});

test('pcm16ChunkedBase64 splits into wire-sized chunks that round-trip', () => {
  const samples = Float32Array.from({ length: 48000 * 3 }, (_, i) => Math.sin(i / 100)); // 3 s at 48 kHz
  const encoded = pcm16ChunkedBase64(float32ToPcm16(samples));
  assert.ok(encoded.length > 2);
  for (const chunk of encoded) {
    assert.ok(maxChunkBodyChars(chunk) <= GUEST_REQUEST_BODY_MAX, `chunk of ${chunk.length} chars exceeds the serviceRequest body cap`);
  }
  // Every chunk but the last is exactly ceil(PCM_CHUNK_BYTES / 3) * 4 chars.
  const fullChunkChars = Math.ceil((43_200 / 3)) * 4;
  for (const chunk of encoded.slice(0, -1)) assert.equal(chunk.length, fullChunkChars);
  // Decode the base64 back: sample values within one int16 step.
  const bytes = Buffer.from(encoded.map((c) => Buffer.from(c, 'base64')).reduce((all, part) => Buffer.concat([all, part])));
  const decoded = new Float32Array(bytes.length / 2);
  for (let i = 0; i < decoded.length; i++) decoded[i] = bytes.readInt16LE(i * 2) / 32768;
  assert.equal(decoded.length, samples.length);
  for (let i = 0; i < decoded.length; i++) assert.ok(Math.abs(decoded[i]! - samples[i]!) <= 1 / 32767, `sample ${i} drifted`);
});

test('prepareClipChunks downsamples to 16 kHz before encoding', () => {
  const clip = new Float32Array(48000).fill(0.5); // 1 s at 48 kHz
  const { chunks, sampleRate } = prepareClipChunks(clip, 48000);
  assert.equal(sampleRate, TARGET_SAMPLE_RATE);
  assert.equal(chunks.length, 1);
  const decoded = Buffer.from(chunks[0]!, 'base64');
  assert.equal(decoded.length / 2, 16000); // 16 000 samples for one second
  const first = decoded.readInt16LE(0) / 32768;
  assert.ok(Math.abs(first - 0.5) < 1 / 32767);
  // An already-16 kHz clip does not change sample count.
  const same = prepareClipChunks(new Float32Array(8000), 16000);
  assert.equal(Buffer.from(same.chunks[0]!, 'base64').length / 2, 8000);
});

test('levelFromSamples meters RMS like OpenChamber (×2, clamped to 0..1)', () => {
  assert.equal(levelFromSamples(new Float32Array(0)), 0);
  assert.equal(levelFromSamples(new Float32Array(1000)), 0); // silence
  // A constant 0.25 signal has rms 0.25 → level 0.5.
  assert.ok(Math.abs(levelFromSamples(new Float32Array(1000).fill(0.25)) - 0.5) < 1e-9);
  // Full-scale and half-scale noise both clamp at the top.
  assert.equal(levelFromSamples(new Float32Array(1000).fill(1)), 1);
  assert.equal(levelFromSamples(new Float32Array(1000).fill(0.75)), 1);
});
