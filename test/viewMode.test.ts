import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PANEL_BOARD_WIDTH, PANEL_HYSTERESIS, viewModeFor } from '../src/domain/viewMode.ts';

test('a desktop panel mounts the board at the threshold, the mirror below it', () => {
  assert.equal(viewModeFor(null, PANEL_BOARD_WIDTH, 'desktop'), 'board');
  assert.equal(viewModeFor(null, PANEL_BOARD_WIDTH + 400, 'desktop'), 'board');
  assert.equal(viewModeFor(null, PANEL_BOARD_WIDTH - 1, 'desktop'), 'mirror');
  assert.equal(viewModeFor(null, 200, 'desktop'), 'mirror');
});

test('a phone or tablet mounts only the mirror, however wide its panel draws', () => {
  for (const formFactor of ['phone', 'tablet'] as const) {
    assert.equal(viewModeFor(null, 2000, formFactor), 'mirror');
    assert.equal(viewModeFor('mirror', 2000, formFactor), 'mirror');
    assert.equal(viewModeFor('board', 2000, formFactor), 'mirror');
  }
});

test('the mirror takes a clear step beyond the threshold before swapping to the board', () => {
  assert.equal(viewModeFor('mirror', PANEL_BOARD_WIDTH + PANEL_HYSTERESIS - 1, 'desktop'), 'mirror');
  assert.equal(viewModeFor('mirror', PANEL_BOARD_WIDTH + PANEL_HYSTERESIS, 'desktop'), 'board');
});

test('the board holds through a small collapse and only folds back below the dead band', () => {
  assert.equal(viewModeFor('board', PANEL_BOARD_WIDTH, 'desktop'), 'board');
  assert.equal(viewModeFor('board', PANEL_BOARD_WIDTH - PANEL_HYSTERESIS, 'desktop'), 'board');
  assert.equal(viewModeFor('board', PANEL_BOARD_WIDTH - PANEL_HYSTERESIS - 1, 'desktop'), 'mirror');
  assert.equal(viewModeFor('board', 200, 'desktop'), 'mirror');
});
