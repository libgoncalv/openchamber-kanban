import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { PromptResult } from '@openchamber/sdk';
import { fillComposerAfterOpen, type PromptFillHost } from '../src/host/promptFill.ts';

const skipped: PromptResult = { sent: 'skipped' };

const tick = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** A host that records every prompt text and answers per the given implementation. */
const hostRecording = (
  impl: PromptFillHost['prompt'] = async () => skipped,
): { host: PromptFillHost; texts: string[] } => {
  const texts: string[] = [];
  const host: PromptFillHost = {
    prompt: async (request) => {
      texts.push(request.text);
      return impl(request);
    },
  };
  return { host, texts };
};

test('fillComposerAfterOpen writes the same text immediately and once more after the settle', async () => {
  const { host, texts } = hostRecording();
  fillComposerAfterOpen(host, 'the description', { settledMs: 5 });
  assert.deepEqual(texts, ['the description'], 'the immediate write goes out at once');
  await tick(30);
  assert.deepEqual(texts, ['the description', 'the description'], 'the settled write repeats it once');
});

test('a first write failing is recovered silently; no loss is reported', async () => {
  let reports = 0;
  let index = 0;
  const { host } = hostRecording(async () => {
    index += 1;
    if (index <= 1) throw new Error('the surface died before the write left');
    return skipped;
  });
  fillComposerAfterOpen(host, 'text', { settledMs: 5, onLost: () => { reports += 1; } });
  await tick(30);
  assert.equal(reports, 0);
});

test('a settled write that fails is the lost fill: the caller is told exactly once', async () => {
  let reports = 0;
  const { host } = hostRecording(async () => {
    throw new Error('gone');
  });
  fillComposerAfterOpen(host, 'text', { settledMs: 5, onLost: () => { reports += 1; } });
  await tick(30);
  assert.equal(reports, 1, 'the settled write is the last one ever attempted');
});
