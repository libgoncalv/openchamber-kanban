import { test } from 'node:test';
import assert from 'node:assert/strict';
import { statusForSession } from '../src/domain/sync.ts';

test('a task marked Done is never moved, regardless of activity or agent', () => {
  for (const agent of ['build', 'plan', null]) {
    for (const activity of ['running', 'retrying', 'waiting-question', 'waiting-permission', 'idle'] as const) {
      assert.equal(statusForSession('done', activity, 'completed', agent), null);
      assert.equal(statusForSession('done', activity, 'failed', agent), null);
    }
  }
});

test('running or retrying moves to in_progress from anywhere except done, whatever the agent', () => {
  for (const agent of ['build', 'plan', null]) {
    for (const status of ['backlog', 'todo', 'review'] as const) {
      assert.equal(statusForSession(status, 'running', null, agent), 'in_progress');
      assert.equal(statusForSession(status, 'retrying', null, agent), 'in_progress');
    }
    assert.equal(statusForSession('in_progress', 'running', null, agent), null, 'no redundant write when already there');
  }
});

test('a clarifying question moves to review only when the session runs as build', () => {
  assert.equal(statusForSession('in_progress', 'waiting-question', null, 'build'), 'review');
  assert.equal(statusForSession('todo', 'waiting-question', null, 'build'), 'review');
  assert.equal(statusForSession('review', 'waiting-question', null, 'build'), null);
  // The host's own case shaping must not slip past the gate.
  assert.equal(statusForSession('in_progress', 'waiting-question', null, 'Build'), 'review');
  for (const agent of ['plan', 'brainstorm', 'custom-agent']) {
    assert.equal(statusForSession('in_progress', 'waiting-question', null, agent), null, agent);
  }
  // A host older than the agent field keeps the old behavior: unknown, absent or blank all read as "not gated".
  assert.equal(statusForSession('in_progress', 'waiting-question', null, null), 'review');
  assert.equal(statusForSession('in_progress', 'waiting-question', null, ''), 'review');
});

test('a permission prompt moves to review only when the option is enabled and the session runs as build', () => {
  assert.equal(statusForSession('in_progress', 'waiting-permission', null, 'build', { waitingPermissionMeansReview: true, failedMeansReview: true }), 'review');
  assert.equal(statusForSession('in_progress', 'waiting-permission', null, 'build', { waitingPermissionMeansReview: false, failedMeansReview: true }), null);
  assert.equal(statusForSession('in_progress', 'waiting-permission', null, 'plan', { waitingPermissionMeansReview: true, failedMeansReview: true }), null);
  assert.equal(statusForSession('in_progress', 'waiting-permission', null, null, { waitingPermissionMeansReview: true, failedMeansReview: true }), 'review');
});

test('an idle turn with a completed outcome moves to review only for the build agent', () => {
  assert.equal(statusForSession('in_progress', 'idle', 'completed', 'build'), 'review');
  assert.equal(statusForSession('review', 'idle', 'completed', 'build'), null);
  assert.equal(statusForSession('in_progress', 'idle', 'completed', null), 'review', 'a host without the agent field keeps the old behavior');
  assert.equal(statusForSession('in_progress', 'idle', null, 'build'), null);
  for (const agent of ['plan', 'brainstorm']) {
    assert.equal(statusForSession('in_progress', 'idle', 'completed', agent), null, agent);
  }
});

test('a failed turn moves to review only when the option is enabled and the session runs as build', () => {
  assert.equal(statusForSession('in_progress', 'idle', 'failed', 'build', { waitingPermissionMeansReview: true, failedMeansReview: true }), 'review');
  assert.equal(statusForSession('in_progress', 'idle', 'failed', 'build', { waitingPermissionMeansReview: true, failedMeansReview: false }), null);
  assert.equal(statusForSession('in_progress', 'idle', 'failed', 'plan', { waitingPermissionMeansReview: true, failedMeansReview: true }), null);
  assert.equal(statusForSession('in_progress', 'idle', 'failed', null, { waitingPermissionMeansReview: true, failedMeansReview: true }), 'review');
});

test('the gate blocks only entry: a card already in Review is neither renewed nor pulled out', () => {
  for (const agent of ['build', 'plan']) {
    for (const activity of ['waiting-question', 'waiting-permission'] as const) {
      assert.equal(statusForSession('review', activity, null, agent), null);
    }
    assert.equal(statusForSession('review', 'idle', 'completed', agent), null);
  }
});

test('an unknown activity never moves the task', () => {
  assert.equal(statusForSession('todo', 'unknown', null, 'build'), null);
  assert.equal(statusForSession('todo', 'unknown', null, null), null);
});
