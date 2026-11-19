import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTask, type Task } from '../src/domain/task.ts';
import { ALL_PROJECTS, NO_PROJECT, type BoardFilter } from '../src/domain/board.ts';
import { DEFAULT_SYNC_OPTIONS } from '../src/domain/sync.ts';
import {
  buildBoardView,
  countOpen,
  countUnseen,
  badgeForCounts,
  describeActivity,
  effectiveStatus,
  liveStateFor,
  looksDoneFor,
  looksDoneTooltip,
  nextLooksDoneTickAt,
  autoDoneCandidate,
  LOOKS_DONE_QUIET_MS,
  type BoardItem,
  type SessionLiveState,
} from '../src/domain/boardView.ts';

const task = (title: string, status: Task['status'], rank: number, extra: Partial<Task> = {}): Task => ({
  ...createTask({ title, status }, rank, 1000, `t_${title.replace(/[^a-z0-9]/gi, '').padEnd(6, '0').slice(0, 6)}`),
  ...extra,
});

const ALL: BoardFilter = { projectId: ALL_PROJECTS };

const state = (over: Partial<SessionLiveState> = {}): SessionLiveState =>
  ({ projectId: 'p1', activity: 'running', outcome: null, agent: 'build', updatedAt: 5000, unread: null, title: 'ses_1', ...over });

test('rows group by stored status in rank order when nothing live is known', () => {
  const a = task('a', 'todo', 2048);
  const b = task('b', 'todo', 1024);
  const sections = buildBoardView([a, b], new Map(), ALL);
  assert.deepEqual(sections.todo.map((item) => item.task.title), ['b', 'a']);
  assert.equal(sections.backlog.length, 0);
  assert.equal(sections.review.length, 0);
  assert.equal(sections.in_progress[0]?.displayStatus, undefined);
});

test('a running agent moves the row to In Progress for display only, without flagging it', () => {
  const t = task('wip', 'todo', 1, { sessionId: 's1', projectId: 'p1' });
  const live = new Map([['s1', state()]]);
  const sections = buildBoardView([t], live, ALL);
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
  const sections = buildBoardView([seen, finished], live, ALL);
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
    const sections = buildBoardView([t], live, ALL);
    assert.equal(sections.review[0]?.attention, true, activity);
    assert.equal(sections.in_progress.length, 0, activity);
  }
});

test('a non-build agent never lands the row in Review; a legacy host keeps the old display', () => {
  for (const activity of ['waiting-question', 'waiting-permission'] as const) {
    const t = task(`p-${activity}`, 'todo', 1, { sessionId: 'sp', projectId: 'p1' });
    const live = new Map([['sp', state({ activity, agent: 'plan', updatedAt: 900 })]]);
    const sections = buildBoardView([t], live, ALL);
    assert.equal(sections.todo[0]?.displayStatus, 'todo', activity);
    assert.equal(sections.todo[0]?.movedByAgent, false, activity);
    assert.equal(sections.todo[0]?.attention, false, activity);
  }
  // A plan session that finished mid-turn stays where it ran.
  const finishedRun = task('fin-plan', 'in_progress', 1, { sessionId: 'sf', projectId: 'p1' });
  const planLive = new Map([['sf', state({ activity: 'idle', outcome: 'completed', agent: 'plan', updatedAt: 600 })]]);
  const planView = buildBoardView([finishedRun], planLive, ALL);
  assert.equal(planView.in_progress[0]?.displayStatus, 'in_progress');
  assert.equal(planView.in_progress[0]?.attention, false);
  // A host without the agent field keeps the old behavior.
  const legacy = task('legacy', 'in_progress', 1, { sessionId: 'sl', projectId: 'p1' });
  const legacyLive = new Map([['sl', state({ activity: 'idle', outcome: 'completed', agent: null, updatedAt: 600 })]]);
  const legacyView = buildBoardView([legacy], legacyLive, ALL);
  assert.equal(legacyView.review[0]?.displayStatus, 'review');
  assert.equal(legacyView.review[0]?.attention, true);
});

test('a Done card only leaves Done for a running session, and a stale marker there never counts as unseen anyway', () => {
  // Rework pull-back, displayed: the session runs again, the row regroups to In Progress.
  const reworking = task('rework', 'done', 1, { sessionId: 's3', projectId: 'p1' });
  const running = buildBoardView([reworking], new Map([['s3', state()]]), ALL);
  assert.equal(running.in_progress[0]?.displayStatus, 'in_progress');
  assert.equal(running.in_progress[0]?.movedByAgent, true);
  // Quiet again: the card keeps its Done, marker or not.
  const done = task('done', 'done', 1, { sessionId: 's3', projectId: 'p1', needsAttentionSince: 2000 });
  const live = new Map([['s3', state({ activity: 'idle', outcome: 'completed' })]]);
  const sections = buildBoardView([done], live, ALL);
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
  const sections = buildBoardView([older, seenHigh, seenLow, newer], new Map(), ALL);
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
  const sections = buildBoardView([t], live, ALL);
  assert.equal(sections.todo[0]?.displayStatus, 'todo');
  assert.equal(sections.todo[0]?.movedByAgent, false);
});

test('countUnseen counts flagged rows across sections, excluding Done', () => {
  const flagged = task('flagged', 'review', 1, { needsAttentionSince: 100 });
  const moved = task('moved', 'in_progress', 2, { sessionId: 's6', projectId: 'p1' });
  const calm = task('calm', 'todo', 3);
  const live = new Map([['s6', state({ activity: 'idle', outcome: 'completed', updatedAt: 600 })]]);
  const sections = buildBoardView([flagged, moved, calm], live, ALL);
  assert.equal(countUnseen(sections), 2);
});

test('project scope narrows like the page filter does; with no scope open everything shows', () => {
  const mine = task('mine', 'todo', 1, { projectId: 'p1' });
  const other = task('other', 'todo', 2, { projectId: 'p2' });
  const orphan = task('orphan', 'todo', 3, { projectId: null });
  const todo = (filter: BoardFilter) => buildBoardView([mine, other, orphan], new Map(), filter).todo.map((item) => item.task.title);
  assert.deepEqual(todo({ projectId: 'p1' }), ['mine'], 'the panel passes the project it is locked to');
  assert.deepEqual(todo({ projectId: ALL_PROJECTS }), ['mine', 'other', 'orphan'], 'All projects shows everything');
  assert.deepEqual(todo({ projectId: NO_PROJECT }), ['orphan']);
  // null projectId never matches an open project id — a task attached to
  // no project at all waits when a specific project is open.
  assert.deepEqual(todo({ projectId: 'p9' }), []);
});

test('countOpen excludes Done; badgeForCounts tips to warning only while unseen rows wait', () => {
  const done = task('done', 'done', 1, { needsAttentionSince: 100 });
  const open = task('open', 'review', 2, { needsAttentionSince: 200 });
  const sections = buildBoardView([done, open], new Map(), ALL);
  assert.equal(countOpen(sections), 1);
  assert.equal(countUnseen(sections), 1);
  assert.deepEqual(badgeForCounts(countOpen(sections), countUnseen(sections)), { label: '1 open · 1 unseen', tone: 'warning' });
  assert.deepEqual(badgeForCounts(3, 0), { label: '3 open', tone: 'neutral' });
});

test('describeActivity maps every observable state to a key, a row line and a tone', () => {
  // The key is what the pill renderer keys its tint and glyph on.
  assert.deepEqual(describeActivity(state()), { key: 'running', text: 'running', tone: 'running' });
  assert.deepEqual(describeActivity(state({ activity: 'retrying' })), { key: 'running', text: 'retrying', tone: 'running' });
  assert.deepEqual(describeActivity(state({ activity: 'waiting-question' })), { key: 'waiting-question', text: 'needs your answer', tone: 'waiting' });
  assert.deepEqual(describeActivity(state({ activity: 'waiting-permission' })), { key: 'waiting-permission', text: 'needs permission', tone: 'waiting' });
  assert.deepEqual(describeActivity(state({ activity: 'idle', outcome: 'completed' })), { key: 'finished', text: 'finished', tone: 'idle' });
  assert.deepEqual(describeActivity(state({ activity: 'idle', outcome: 'failed' })), { key: 'failed', text: 'failed', tone: 'failed' });
  assert.deepEqual(describeActivity(state({ activity: 'idle', outcome: null })), { key: 'idle', text: 'idle', tone: 'idle' });
  assert.equal(describeActivity(state({ activity: 'unknown' })), null);
});

// ---- The "looks done" affordance (Route A: a suggestion, never a write) ----

/** A task in Review whose linked session finished at `finishedAt`. */
const finishedReview = (extra: Partial<Task> = {}, status: Task['status'] = 'review'): Task =>
  task('looksdone', status, 1, { sessionId: 'sd', projectId: 'p1', ...extra });
const finished = (finishedAt: number): Map<string, SessionLiveState> =>
  new Map([['sd', state({ activity: 'idle', outcome: 'completed', updatedAt: finishedAt })]]);
/** Just past the quiet window. */
const QUIET_AT = (finishedAt: number) => finishedAt + LOOKS_DONE_QUIET_MS + 60_000;

test('a finished, quiet session suggests Done: tinted while unseen, muted once seen, nothing before the window', () => {
  const at = 100_000;
  const unseen = finishedReview({ needsAttentionSince: at });
  const seen = finishedReview();
  // Unseen (marker set) reads the clock from the marker; seen reads it from the session's own last change.
  assert.equal(looksDoneFor(unseen, finished(at).get('sd')!, QUIET_AT(at)), 'hint');
  assert.equal(looksDoneFor(seen, finished(at).get('sd')!, QUIET_AT(at)), 'quiet');
  // Still inside the quiet window: nothing shows yet — the finish itself is
  // already flagged as attention; the ✓ only earns its place through silence.
  assert.equal(looksDoneFor(unseen, finished(at).get('sd')!, at + 5 * 60_000), null);
  assert.equal(looksDoneFor(seen, finished(at).get('sd')!, at + 5 * 60_000), null);
});

test('looks-done requires the finish, the stored Review status, and a live state', () => {
  const at = 100_000;
  const s = finished(at).get('sd')!;
  assert.equal(looksDoneFor(finishedReview({}, 'in_progress'), s, QUIET_AT(at)), null, 'a row the display regroups is not enough — status converges from the page');
  assert.equal(looksDoneFor(finishedReview(), state({ activity: 'running' }), QUIET_AT(at)), null);
  assert.equal(looksDoneFor(finishedReview(), state({ activity: 'waiting-question' }), QUIET_AT(at)), null);
  assert.equal(looksDoneFor(finishedReview(), state({ activity: 'idle', outcome: null }), QUIET_AT(at)), null);
  assert.equal(looksDoneFor(finishedReview(), null, QUIET_AT(at)), null, 'no trusted snapshot, no ✓ — unknown is never new');
  assert.equal(looksDoneFor(finishedReview({}, 'done'), s, QUIET_AT(at)), null, 'Done is deliberate work; the suggestion never reaches it');
});

test('the view model carries the state and its tooltip; the ✓ rides the Review section under stored status', () => {
  const at = 100_000;
  const t = finishedReview({ needsAttentionSince: at });
  const sections = buildBoardView([t], finished(at), ALL, DEFAULT_SYNC_OPTIONS, QUIET_AT(at));
  const item = sections.review[0]!;
  assert.equal(item.looksDone, 'hint');
  assert.equal(item.looksDoneNote, 'Looks done · quiet 11m — click to mark Done');
  // A long-settled task drops the count: "quiet 4320m" would mean nothing.
  const settled = buildBoardView([t], finished(at), ALL, DEFAULT_SYNC_OPTIONS, at + 3 * 60 * 60_000);
  assert.equal(settled.review[0]?.looksDoneNote, 'Looks done — click to mark Done');
  // Before the window nothing shows, not even a note.
  const early = buildBoardView([t], finished(at), ALL, DEFAULT_SYNC_OPTIONS, at + 2 * 60_000);
  assert.equal(early.review[0]?.looksDone, null);
  assert.equal(early.review[0]?.looksDoneNote, null);
});

test('nextLooksDoneTickAt schedules the window crossing and the tooltip minutes, nothing else', () => {
  const at = 100_000;
  const t = finishedReview({ needsAttentionSince: at });
  const s = finished(at).get('sd')!;
  // Before the window: the next change is exactly the crossing, one instant.
  assert.equal(nextLooksDoneTickAt(t, s, at + 4 * 60_000), at + LOOKS_DONE_QUIET_MS);
  // While the tooltip counts: the next minute boundary.
  assert.equal(nextLooksDoneTickAt(t, s, at + LOOKS_DONE_QUIET_MS + 90_000), at + 12 * 60_000);
  // After the tooltip stops counting: no time-based change is left.
  assert.equal(nextLooksDoneTickAt(t, s, at + 61 * 60_000), null);
  // Nothing eligible: no tick at all — the snapshot drives those renders.
  assert.equal(nextLooksDoneTickAt(finishedReview(), state({ activity: 'running' }), at + 4 * 60_000), null);
  assert.equal(nextLooksDoneTickAt(t, null, at + 4 * 60_000), null);
});

// ---- The auto-done rule's predicate and the host-side visit signal ----

test('autoDoneCandidate gates on Review, visited, a stopped session, and something to check', () => {
  const base = task('ad', 'review', 1, { worktree: { directory: '/wt', branch: 'wt/a' }, sourceBranch: 'main' });
  // Unlinked and already seen (no marker — e.g. the user's own drag to Review): a candidate.
  assert.equal(autoDoneCandidate({ ...base, sessionId: null }, null), true);
  assert.equal(autoDoneCandidate({ ...base, sessionId: null, needsAttentionSince: 1000 }, null), false, 'unseen waits for a visit');
  // The host-side visit stands in for the Kanban one: its chat was opened anywhere.
  const afarSeen = { ...base, sessionId: 's1', needsAttentionSince: 1000 };
  assert.equal(autoDoneCandidate(afarSeen, state({ activity: 'idle', outcome: 'completed', unread: false })), true);
  assert.equal(autoDoneCandidate(afarSeen, state({ activity: 'running', unread: false })), false, 'running is never stopped');
  assert.equal(autoDoneCandidate(afarSeen, state({ activity: 'idle', outcome: 'failed', unread: false })), false, 'a failed turn is a deliberate review');
  assert.equal(autoDoneCandidate(afarSeen, state({ activity: 'waiting-question', unread: false })), false, 'the agent is mid-question, not done');
  assert.equal(autoDoneCandidate(afarSeen, null), false, 'linked but no trusted snapshot waits — it might be running');
  assert.equal(autoDoneCandidate({ ...afarSeen, needsAttentionSince: null }, state({ activity: 'idle', outcome: 'completed' })), true, 'seen here, idle there: candidate');
  // Nothing to check, however visited: no worktree, no source branch.
  assert.equal(autoDoneCandidate({ ...base, sessionId: null, worktree: null }, null), false);
  assert.equal(autoDoneCandidate({ ...base, sessionId: null, sourceBranch: null }, null), false);
  assert.equal(autoDoneCandidate(task('td', 'todo', 2, { worktree: { directory: '/wt', branch: null }, sourceBranch: 'main' }), null), false);
});

test('autoDoneCandidate takes the project-root evidence mode on a sessionLinkedAt anchor', () => {
  // The common card: session in the project root, no worktree, no recorded branch.
  const root = task('rd', 'review', 1, { sessionId: null, worktree: null, sourceBranch: null, sessionLinkedAt: 5000 });
  // The anchor is the work, the same visited and stop gates still hold.
  assert.equal(autoDoneCandidate(root, null), true, 'anchor present: a candidate even with no worktree');
  assert.equal(autoDoneCandidate({ ...root, sessionLinkedAt: null }, null), false, 'no anchor, no worktree: stays manual');
  assert.equal(autoDoneCandidate({ ...root, needsAttentionSince: 1000 }, null), false, 'unseen waits for a visit, root mode too');
  // A sessionless card keeps its anchor after an unlink — the evidence window survives the link.
  const unlinked = { ...root, sessionId: null, sessionLinkedAt: 5000 };
  assert.equal(autoDoneCandidate(unlinked, null), true);
  // A linked card still gates on the snapshot: unknown and running states wait, as anywhere.
  assert.equal(autoDoneCandidate({ ...root, sessionId: 's1' }, null), false);
  assert.equal(autoDoneCandidate({ ...root, sessionId: 's1' }, state({ activity: 'running' })), false);
  assert.equal(autoDoneCandidate({ ...root, sessionId: 's1' }, state({ activity: 'idle', outcome: 'completed' })), true);
  // Old records parse anchorless: they stay manual until the board's backfill lands the anchor.
  assert.equal(autoDoneCandidate({ ...root, sessionLinkedAt: null, worktree: { directory: '/wt', branch: 'wt/a' } }, null), false, 'a worktree without a recorded branch is no evidence either');
});

test('a host-side read (unread false) settles a review row the rail can see, and keeps the ✓ muted', () => {
  const at = 100_000;
  const t = finishedReview({ needsAttentionSince: at });
  const unseen = buildBoardView([t], new Map([['sd', state({ activity: 'idle', outcome: 'completed', unread: true, updatedAt: at })]]), ALL, DEFAULT_SYNC_OPTIONS, QUIET_AT(at));
  assert.equal(unseen.review[0]?.attention, true);
  assert.equal(unseen.review[0]?.looksDone, 'hint');
  assert.equal(countUnseen(unseen), 1);
  const openedElsewhere = new Map([['sd', state({ activity: 'idle', outcome: 'completed', unread: false, updatedAt: at })]]);
  const settled = buildBoardView([t], openedElsewhere, ALL, DEFAULT_SYNC_OPTIONS, QUIET_AT(at));
  assert.equal(settled.review[0]?.attention, false, 'the chat was opened somewhere else: not unseen on display either');
  assert.equal(settled.review[0]?.attentionSince, null, 'seen rows sink to their rank');
  assert.equal(settled.review[0]?.looksDone, 'quiet', 'the ✓ mutes exactly the way a local visit mutes it');
  assert.equal(countUnseen(settled), 0);
  // A host without the field keeps today's behavior: the marker stands.
  const oldHost = buildBoardView([t], new Map([['sd', state({ activity: 'idle', outcome: 'completed', unread: null, updatedAt: at })]]), ALL, DEFAULT_SYNC_OPTIONS, QUIET_AT(at));
  assert.equal(oldHost.review[0]?.attention, true);
});
