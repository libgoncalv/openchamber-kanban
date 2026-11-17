import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { StartSessionResult } from '@openchamber/sdk';
import { createTask } from '../src/domain/task.ts';
import {
  EXTENSION_ID,
  buildLinkPatch,
  buildStartSessionRequest,
  taskUrl,
} from '../src/domain/chatLink.ts';

const base = createTask({ title: 'Fix login', description: 'The login form rejects valid sessions' }, 1);

test('buildStartSessionRequest attaches an empty chat to the card, rooted in the project', () => {
  const task = { ...base, projectId: 'p1' };
  const request = buildStartSessionRequest(task);
  assert.equal(request.providerId, EXTENSION_ID);
  assert.equal(request.id, task.id);
  assert.equal(request.title, 'Fix login');
  assert.equal(request.url, taskUrl(task.id));
  assert.equal(request.projectId, 'p1');
  assert.equal(request.navigation, 'preserve');
  assert.ok(!('text' in request), 'no first message: the rail starts an empty chat');
  assert.equal(request.worktree, false, 'no worktree of its own: the project root');
});

test('buildStartSessionRequest reuses the task worktree and derives the title of an unrenamed task', () => {
  const task = {
    ...createTask({ title: 'New task', description: 'first line\nsecond' }, 1),
    projectId: 'p1',
    worktree: { directory: '/repo/.worktrees/w1', branch: null },
  };
  const request = buildStartSessionRequest(task);
  assert.deepEqual(request.worktree, { kind: 'existing', directory: '/repo/.worktrees/w1' });
  assert.equal(request.title, 'first line');
});

test('buildStartSessionRequest omits the project of a projectless task instead of guessing', () => {
  const request = buildStartSessionRequest(base);
  assert.ok(!('projectId' in request));
});

test('buildLinkPatch links the session and echoes the worktree the host used', () => {
  const task = { ...base, projectId: 'p1', worktree: { directory: '/repo/.worktrees/w1', branch: 'fix' } };
  const request = buildStartSessionRequest(task);
  const result: StartSessionResult = {
    sessionId: 'ses_1',
    sent: 'skipped',
    worktree: { directory: '/repo/.worktrees/w1', branch: 'fix', name: 'w1', status: 'ready' },
  };
  const patch = buildLinkPatch(request, result);
  assert.equal(patch.sessionId, 'ses_1');
  assert.deepEqual(patch.worktree, { directory: '/repo/.worktrees/w1', branch: 'fix' });
  assert.ok(!('status' in patch), 'the rail never writes a status');
});

test('buildLinkPatch falls back to the requested worktree directory the host did not echo', () => {
  const task = { ...base, projectId: 'p1', worktree: { directory: '/repo/.worktrees/w2', branch: null } };
  const request = buildStartSessionRequest(task);
  const result: StartSessionResult = { sessionId: 'ses_2', sent: 'skipped' };
  const patch = buildLinkPatch(request, result);
  assert.equal(patch.sessionId, 'ses_2');
  assert.deepEqual(patch.worktree, { directory: '/repo/.worktrees/w2', branch: null });
});
