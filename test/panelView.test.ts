import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTask, type Task } from '../src/domain/task.ts';
import {
  buildSections,
  countUnseen,
  describeActivity,
  effectiveStatus,
  liveStateFor,
  visibleTasks,
  type SessionLiveState,
} from '../src/domain/panelView.ts';

const task = (title: string, status: Task['status'], rank: number, extra: Partial<Task> = {}): Task => ({
  ...createTask({ title, status }, rank, 1000, `t_${title.replace(/[^a-z0-9]/gi, '').padEnd(6, '0').slice(0, 6)}`),
  ...extra,
});

const state = (over: Partial<SessionLiveState> = {}): SessionLiveState =>
  ({ projectId: 'p1', activity: 'running', outcome: null, updatedAt: 5000, ...over });

test('rows group by stored status in rank order when nothing live is known', () => {
  const a = task('a', 'todo', 2048);
  const b = task('b', 'todo', 1024);
  const sections = buildSections([a, b], new Map());
  assert.deepEqual(sections.todo.map((item) => item.task.title), ['b', 'a']);
  assert.equal(sections.backlog.length, 0);
  assert.equal(sections.review.length, 0);
  assert.equal(sections.in_progress[0]?.displayStatus, undefined);
});

test('a running agent moves the row to In Progress for display only, without flagging it', () => {
  const t = task('wip', 'todo', 1, { sessionId: 's1', projectId: 'p1' });
  const live = new Map([['s1', state()]]);
  const sections = buildSections([t], live);
  assert.equal(sections.in_progress.length, 1);
  const item = sections.in_progress[0]!;
  assert.equal(item.displayStatus, 'in_progress');
  assert.equal(item.movedByAgent, true);
  assert.equal(item.attention, false);
  assert.equal(item.attentionSince, null);
});

test('an agent that finished lands the row in Review, flagged unseen, leading the section', () => {
  const finished = task('fin', 'in_progress', 1, { sessionId: 's2', projectId: 'p1' });
  // A review task already seen: no marker, must sink below the unseen one.
  const seen = task('seen', 'review', 2);
  const live = new Map([['s2', state({ activity: 'idle', outcome: 'completed', updatedAt: 7000 })]]);
  const sections = buildSections([seen, finished], live);
  assert.deepEqual(sections.review.map((item) => item.task.title), ['fin', 'seen']);
  const item = sections.review[0]!;
  assert.equal(item.displayStatus, 'review');
  assert.equal(item.movedByAgent, true);
  assert.equal(item.attention, true);
  // No board was open to persist the marker, so the session's own last change stands in.
  assert.equal(item.attentionSince, 7000);
});

test('a waiting agent (question or permission) lands in Review and is flagged unseen', () => {
  for (const activity of ['waiting-question', 'waiting-permission'] as const) {
    const t = task(`w-${activity}`, 'todo', 1, { sessionId: 'sq', projectId: 'p1' });
    const live = new Map([['sq', state({ activity, updatedAt: 900 })]]);
    const sections = buildSections([t], live);
    assert.equal(sections.review[0]?.attention, true, activity);
    assert.equal(sections.in_progress.length, 0, activity);
  }
});

test('Done is never moved by the agent, and a stale marker there does not count as unseen', () => {
  const t = task('done', 'done', 1, { sessionId: 's3', projectId: 'p1', needsAttentionSince: 2000 });
  const live = new Map([['s3', state()]]);
  const sections = buildSections([t], live);
  assert.equal(sections.done[0]?.displayStatus, 'done');
  assert.equal(sections.done[0]?.movedByAgent, false);
  assert.equal(sections.done[0]?.attention, true, 'stored marker is still on the row');
  assert.equal(countUnseen(sections), 0, 'but Done is deliberate work, not open attention');
});

test('the newest unseen marker leads the Review section, seen rows sort by rank after all unseen', () => {
  const older = task('older', 'review', 1, { needsAttentionSince: 3000 });
  const newer = task('newer', 'review', 2, { needsAttentionSince: 4000 });
  const seenHigh = task('seen-high', 'review', 50);
  const seenLow = task('seen-low', 'review', 10);
  const sections = buildSections([older, seenHigh, seenLow, newer], new Map());
  assert.deepEqual(sections.review.map((item) => item.task.title), ['newer', 'older', 'seen-low', 'seen-high']);
});

test('an unknown activity or a missing snapshot leaves the stored status', () => {
  const t = task('x', 'in_progress', 1, { sessionId: 's4', projectId: 'p1' });
  const unknownLive = new Map([['s4', state({ activity: 'unknown' })]]);
  assert.equal(effectiveStatus(t, unknownLive.get('s4')!), 'in_progress');
  assert.equal(effectiveStatus(t, null), 'in_progress');
  assert.equal(liveStateFor(t, new Map()), null);
  assert.equal(liveStateFor({ ...t, sessionId: null }, unknownLive), null);
});

test('an idle session with no outcome moves nothing', () => {
  const t = task('calm', 'todo', 1, { sessionId: 's5', projectId: 'p1' });
  const live = new Map([['s5', state({ activity: 'idle', outcome: null })]]);
  const sections = buildSections([t], live);
  assert.equal(sections.todo[0]?.displayStatus, 'todo');
  assert.equal(sections.todo[0]?.movedByAgent, false);
});

test('countUnseen counts flagged rows across sections, excluding Done', () => {
  const flagged = task('flagged', 'review', 1, { needsAttentionSince: 100 });
  const moved = task('moved', 'in_progress', 2, { sessionId: 's6', projectId: 'p1' });
  const calm = task('calm', 'todo', 3);
  const live = new Map([['s6', state({ activity: 'idle', outcome: 'completed', updatedAt: 600 })]]);
  const sections = buildSections([flagged, moved, calm], live);
  assert.equal(countUnseen(sections), 2);
});

test('visibleTasks narrows to the open project; with none open everything shows', () => {
  const mine = task('mine', 'todo', 1, { projectId: 'p1' });
  const other = task('other', 'todo', 2, { projectId: 'p2' });
  const orphan = task('orphan', 'todo', 3, { projectId: null });
  assert.deepEqual(visibleTasks([mine, other, orphan], 'p1').map((t) => t.id), [mine.id]);
  assert.equal(visibleTasks([mine, other, orphan], null).length, 3);
  // null projectId never matches an open project id.
  assert.deepEqual(visibleTasks([orphan], 'p1'), []);
});

test('describeActivity maps every observable state to a row line and tone', () => {
  assert.deepEqual(describeActivity(state()), { text: 'running', tone: 'running' });
  assert.deepEqual(describeActivity(state({ activity: 'retrying' })), { text: 'retrying', tone: 'running' });
  assert.deepEqual(describeActivity(state({ activity: 'waiting-question' })), { text: 'needs your answer', tone: 'waiting' });
  assert.deepEqual(describeActivity(state({ activity: 'waiting-permission' })), { text: 'needs permission', tone: 'waiting' });
  assert.deepEqual(describeActivity(state({ activity: 'idle', outcome: 'completed' })), { text: 'finished', tone: 'idle' });
  assert.deepEqual(describeActivity(state({ activity: 'idle', outcome: 'failed' })), { text: 'failed', tone: 'failed' });
  assert.deepEqual(describeActivity(state({ activity: 'idle', outcome: null })), { text: 'idle', tone: 'idle' });
  assert.equal(describeActivity(state({ activity: 'unknown' })), null);
});
