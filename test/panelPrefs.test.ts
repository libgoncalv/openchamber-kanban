import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { HostClient, JsonValue } from '@openchamber/sdk';
import { DEFAULT_PANEL_PREFS, loadPanelPrefs, PANEL_PREFS_KEY, parsePanelPrefs, savePanelPrefs } from '../src/store/panelPrefs.ts';

const fakeHost = () => {
  const data = new Map<string, string>();
  const host: Pick<HostClient, 'storage'> = {
    storage: {
      get: async (key) => (data.has(key) ? (JSON.parse(data.get(key)!) as JsonValue) : undefined),
      set: async (key, value) => { data.set(key, JSON.stringify(value)); },
      delete: async (key) => { data.delete(key); },
      keys: async () => [...data.keys()],
    },
  };
  return { host, data };
};

test('panel prefs round-trip and fall back to defaults on junk', async () => {
  const { host, data } = fakeHost();
  assert.deepEqual(await loadPanelPrefs(host), DEFAULT_PANEL_PREFS);
  await savePanelPrefs(host, { collapsed: ['review', 'in_progress'] });
  data.set(PANEL_PREFS_KEY, JSON.stringify({ collapsed: ['review', 'in_progress'] }));
  assert.deepEqual(await loadPanelPrefs(host), { collapsed: ['review', 'in_progress'] });
  data.set(PANEL_PREFS_KEY, JSON.stringify(['junk']));
  assert.deepEqual(await loadPanelPrefs(host), DEFAULT_PANEL_PREFS);
  data.set(PANEL_PREFS_KEY, JSON.stringify({ collapsed: 'nope' }));
  assert.deepEqual(await loadPanelPrefs(host), DEFAULT_PANEL_PREFS);
  data.set(PANEL_PREFS_KEY, JSON.stringify({ unrelated: true }));
  assert.deepEqual(await loadPanelPrefs(host), DEFAULT_PANEL_PREFS);
});

test('unknown statuses are dropped, duplicates de-duplicated, order kept', () => {
  assert.deepEqual(
    parsePanelPrefs({ collapsed: ['nope', 'review', 'done', 'review', 3, 'todo'] }),
    { collapsed: ['review', 'done', 'todo'] },
  );
  // An array that is genuinely empty means "everything expanded", not defaults.
  assert.deepEqual(parsePanelPrefs({ collapsed: [] }), { collapsed: [] });
});
