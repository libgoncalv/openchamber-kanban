/**
 * The screenshot harness: serves this repo's built panel over loopback inside
 * a fake OpenChamber frame, so the board renders with sample data for README
 * screenshots without a running OpenChamber.
 *
 *   node scripts/mock-host.mjs                 # http://127.0.0.1:8907
 *
 * URLs (under /mock):
 *   /mock/page?openTask=1        the full board page (?openTask=1 auto-opens
 *                                the Review card's detail dialog)
 *   /mock/panel                  the rail panel, locked to the sample project
 *   &device=phone|desktop        the ready context's form factor
 *
 * The outer page plays the host side of the SDK guest wire (the shapes in
 * `@openchamber/sdk/dist/protocol.js`): hello → ready (with this repo's real
 * theme tokens, derived the way the app derives them — see the token block),
 * workspace-subscribe → ack + snapshot push, storage over an in-memory map,
 * service-request → an empty agent journal. Read-only by design: prompt and
 * openSession are acknowledged as no-ops and startSession refuses, so a click
 * writes nothing to any real OpenChamber.
 *
 * Fragility note: the envelopes ride `OPENCHAMBER_SDK_CHANNEL`/`v` from the
 * SDK (duplicated inline here because the harness runs outside the bundler);
 * a future SDK bump of either must be tracked here.
 */
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PANEL_DIR = join(ROOT, 'panel');
const PORT = Number(process.env.MOCK_PORT ?? 8907);

const CHANNEL = 'openchamber.sdk';
const V = 1;

// ---- Theme tokens ----------------------------------------------------------
// The app's default "openchamber-light" palette, as the guest payload carries
// it: statuses' *Text are the tinted, contrast-lifted variants the app derives
// for its guests (the app's own Fl/d1 math, replicated outside the bundle).
const TOKENS = {
  background: '#fdfcfa',
  elevated: '#f3f2f0',
  foreground: '#262521',
  muted: '#696960',
  subtle: '#f7f6f4',
  border: '#e5e1debf',
  hover: '#0000000a',
  selection: '#26252120',
  focus: '#b3501755',
  primary: '#b35017',
  mutedSurface: '#f7f6f4',
  elevatedForeground: '#262521',
  active: 'rgba(38,37,33,0.12)',
  selectionForeground: '#8d8d8a',
  primaryForeground: '#000000',
  primaryText: '#934113',
  successText: '#496a2f',
  warningText: '#785c12',
  errorText: '#a04037',
  infoText: '#2761a7',
  success: '#517734',
  warning: '#886914',
  error: '#b7493f',
  info: '#2c6ebd',
  font: '"SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
  mono: 'ui-monospace, "SFMono-Regular", "Menlo", "Cascadia Mono", "Segoe UI Mono", monospace',
  fontSize: '14px',
  radius: '0.5625rem',
};

// ---- Sample data -----------------------------------------------------------

const PROJECT_ID = 'p_openchamber-kanban';
const PROJECT_DIRECTORY = '/home/libio/openchamber-kanban';

const now = Date.now();
const minutesAgo = (m) => now - m * 60_000;
const hoursAgo = (h) => now - h * 3_600_000;
const daysAgo = (d) => now - d * 86_400_000;

const SESSIONS = [
  {
    id: 's_hover-clipping', title: 'Fix the drag ghost clipping', projectId: PROJECT_ID, directory: PROJECT_DIRECTORY,
    agent: 'build', parentId: null, createdAt: minutesAgo(42), updatedAt: minutesAgo(2), archivedAt: null, worktree: null,
    activity: 'running', outcome: null, items: [],
  }, {
    id: 's_status-segments', title: 'Status strip: keyboard focus ring', projectId: PROJECT_ID, directory: PROJECT_DIRECTORY,
    agent: 'build', parentId: null, createdAt: daysAgo(1), updatedAt: minutesAgo(14), archivedAt: null, worktree: null,
    activity: 'waiting-question', outcome: null, items: [], unread: true,
  }, {
    id: 's_dnd-refactor', title: 'Plan: split insertTarget out of dnd.ts', projectId: PROJECT_ID, directory: PROJECT_DIRECTORY,
    agent: 'plan', parentId: null, createdAt: daysAgo(2), updatedAt: minutesAgo(38), archivedAt: null, worktree: null,
    activity: 'idle', outcome: 'failed', items: [],
  }, {
    id: 's_archive-dialog', title: 'Archive dialog: armed Empty purge', projectId: PROJECT_ID, directory: PROJECT_DIRECTORY,
    agent: 'build', parentId: null, createdAt: daysAgo(3), updatedAt: hoursAgo(20), archivedAt: null, worktree: null,
    activity: 'idle', outcome: 'completed', items: [], unread: false,
  }, {
    id: 's_mirror-push', title: 'Mirror push: debounce the burst', projectId: PROJECT_ID, directory: PROJECT_DIRECTORY,
    agent: 'build', parentId: null, createdAt: daysAgo(4), updatedAt: daysAgo(2), archivedAt: null, worktree: null,
    activity: 'idle', outcome: 'completed', items: [], unread: false,
  },
];

const task = (overrides) => ({
  schemaVersion: 1,
  id: 't_sample',
  title: 'Untitled task',
  description: '',
  status: 'backlog',
  rank: 0,
  projectId: null,
  sourceBranch: null,
  worktree: null,
  sessionId: null,
  createdAt: daysAgo(5),
  updatedAt: daysAgo(5),
  needsAttentionSince: null,
  autoDoneCommit: null,
  sessionLinkedAt: null,
  doneAt: null,
  ...overrides,
});

const TASKS = [
  task({
    id: 't_backlogplus', title: 'Rail plus glyph: focus ring too tight',
    description: 'The new-chat plus on a rail row needs a wider focus-visible offset; it clips under the row border.',
    status: 'backlog', rank: 1, projectId: PROJECT_ID, createdAt: minutesAgo(30), updatedAt: minutesAgo(30),
  }),
  task({
    id: 't_todopill', title: 'Agent pill: give permission its own glyph',
    description: 'Waiting-on-permission sessions read like questions today; give the pill its own glyph.',
    status: 'todo', rank: 2, projectId: PROJECT_ID, createdAt: daysAgo(1), updatedAt: daysAgo(1),
  }),
  task({
    id: 't_runningghost', title: 'Fix the drag ghost clipping',
    description: 'Half a dragged card vanishes past the column edge while over the last column. Start with the z-index on .kb-dragging, then check the scroll container.',
    status: 'in_progress', rank: 3, projectId: PROJECT_ID, sessionId: 's_hover-clipping',
    sessionLinkedAt: minutesAgo(40), createdAt: daysAgo(2), updatedAt: minutesAgo(3),
  }),
  task({
    id: 't_statusfocus', title: 'Status strip: keyboard focus ring',
    description: 'After a click the strip re-renders and focus lands nowhere. Keep the focus on the strip itself (query the pressed button) and verify with a tab-only pass over the detail dialog.',
    status: 'in_progress', rank: 4, projectId: PROJECT_ID, sessionId: 's_status-segments',
    sessionLinkedAt: daysAgo(1), createdAt: daysAgo(2), updatedAt: minutesAgo(14),
  }),
  task({
    id: 't_reviewdnd', title: 'Split insertTarget out of dnd.ts',
    description: 'The insertion math is tested but lives next to DOM wiring; lift it to a pure module.',
    status: 'review', rank: 5, projectId: PROJECT_ID, needsAttentionSince: minutesAgo(38),
    sessionId: 's_dnd-refactor', sessionLinkedAt: daysAgo(2), createdAt: daysAgo(3), updatedAt: minutesAgo(41),
    agentNotes: [{ at: minutesAgo(40), text: 'Blocked: dnd.ts is imported from three call sites (page column bodies, rail section bodies, archive rows). The lift needs one more seam — proposal queued, not started yet.' }],
  }),
  task({
    id: 't_reviewarch', title: 'Archive dialog: armed Empty purge',
    description: 'The Empty press arms like the selection bar; the second press purges the list through the count toast.',
    status: 'review', rank: 6, projectId: PROJECT_ID, needsAttentionSince: hoursAgo(20),
    agentNotes: [{ at: hoursAgo(20), text: 'Wrap-up: the purge walks deleteTasksWithDismissal per id; the two-press confirm rides the archive foot. No storage migration needed.' }],
    createdAt: daysAgo(6), updatedAt: hoursAgo(20), doneAt: daysAgo(1),
  }),
  task({
    id: 't_donemirror', title: 'Mirror push: debounce the burst',
    description: 'A rapid edit/save burst pushed one PUT per save; the mirror now debounces 500ms and re-tries once.',
    status: 'done', rank: 7, projectId: PROJECT_ID, sessionId: 's_mirror-push', sessionLinkedAt: daysAgo(4),
    autoDoneCommit: '4e63251', doneAt: daysAgo(2), createdAt: daysAgo(7), updatedAt: daysAgo(2),
  }),
  task({
    id: 't_archivedold', title: 'Old column-head purge (superseded)',
    description: 'Replaced by the archive dialog\'s Empty. Retired for the record.',
    status: 'archived', rank: 8, projectId: PROJECT_ID, doneAt: daysAgo(20),
    createdAt: daysAgo(30), updatedAt: daysAgo(16),
  }),
];

// ---- Everything the fake host needs, as one JSON blob ----------------------

/** The blob is built per request: `openTask` pre-seeds the persisted open-task pref. */
const buildBlob = (params) => {
  const storage = new Map();
  const put = (key, value) => storage.set(key, structuredClone(value));
  const openTaskId = params.get('openTask') ? 't_reviewarch' : null;
  put('prefs', { projectId: '__all__', openTaskId });
  put('orphan-watermark', hoursAgo(6));
  put('dismissed-sessions', []);
  for (const t of TASKS) put(`task:${t.id}`, t);
  return {
    surface: params.has('panel') ? 'panel' : 'page',
    directory: params.get('directory') ?? PROJECT_DIRECTORY,
    device: params.get('device') ?? 'desktop',
    tokens: TOKENS,
    storage: Object.fromEntries(storage),
    snapshots: {
      projects: {
        kind: 'projects', state: 'ready',
        projects: [{ id: PROJECT_ID, name: 'openchamber-kanban', directory: PROJECT_DIRECTORY }],
      },
      sessions: {
        [PROJECT_ID]: {
          kind: 'sessions', projectId: PROJECT_ID, state: 'ready', coverage: [],
          sessions: SESSIONS.map((session) => ({ ...session })),
        },
      },
      worktrees: {
        [PROJECT_ID]: { kind: 'worktrees', projectId: PROJECT_ID, state: 'ready', worktrees: [] },
      },
    },
  };
};

const pageScript = (blob) => `
(() => {
  const BLOB = ${JSON.stringify(blob)};
  const CHANNEL = ${JSON.stringify(CHANNEL)}, V = ${JSON.stringify(V)};
  const frame = document.getElementById('frame');
  const send = (message) => frame.contentWindow.postMessage(message, '*');
  const RESULT = (id, payload) => ({ channel: CHANNEL, v: V, type: 'result', id, ok: true, ...(payload ? { payload } : {}) });
  const FAIL = (id, code, message) => ({ channel: CHANNEL, v: V, type: 'result', id, ok: false, error: message ?? code, code });

  const snapshotFor = (query) => {
    if (query.kind === 'projects') return BLOB.snapshots.projects;
    return BLOB.snapshots[query.kind]?.[query.projectId] ?? null;
  };

  const ready = () => send({
    channel: CHANNEL, v: V, type: 'ready',
    payload: {
      theme: { mode: 'light', tokens: BLOB.tokens },
      locale: 'en',
      directory: BLOB.directory,
      session: { id: 's_kanban-chat', title: 'Kanban board', busy: false, agent: 'build' },
      surface: BLOB.surface,
      connection: { connected: true, account: 'libio' },
      settings: {},
      item: null,
      features: { popovers: true, microphone: true },
      device: { formFactor: BLOB.device, pointer: 'fine', insets: { top: 0, right: 0, bottom: 0, left: 0 }, keyboard: 0 },
    },
  });

  window.addEventListener('message', (event) => {
    if (event.source !== frame.contentWindow) return;
    const m = event.data;
    if (!m || m.channel !== CHANNEL || m.v !== V) return;
    switch (m.type) {
      case 'hello': ready(); return;
      case 'workspace-subscribe': {
        send(RESULT(m.id));
        const snapshot = snapshotFor(m.payload.query);
        if (snapshot) send({ channel: CHANNEL, v: V, type: 'workspace', payload: { subscriptionId: m.payload.subscriptionId, snapshot } });
        return;
      }
      case 'workspace-unsubscribe': send(RESULT(m.id)); return;
      case 'workspace-read': {
        const snapshot = snapshotFor(m.payload);
        send(snapshot ? RESULT(m.id, snapshot) : FAIL(m.id, 'NOT_FOUND', 'Mock host has no such snapshot'));
        return;
      }
      case 'storage': {
        const { op, key, value } = m.payload;
        if (op === 'get') send(RESULT(m.id, BLOB.storage[key] !== undefined
          ? { storage: true, op: 'get', found: true, value: BLOB.storage[key] }
          : { storage: true, op: 'get', found: false }));
        else if (op === 'set') { BLOB.storage[key] = value; send(RESULT(m.id, { storage: true, op: 'set' })); }
        else if (op === 'delete') { delete BLOB.storage[key]; send(RESULT(m.id, { storage: true, op: 'delete' })); }
        else send(RESULT(m.id, { storage: true, op: 'keys', keys: Object.keys(BLOB.storage) }));
        return;
      }
      case 'service-request': {
        const path = String(m.payload.path);
        if (path === '/agent/pending') send(RESULT(m.id, { status: 200, body: JSON.stringify({ pending: [] }) }));
        else if (path === '/agent/mirror') send(RESULT(m.id, { status: 200, body: JSON.stringify({}) }));
        else if (path === '/agent/pending/ack') send(RESULT(m.id, { status: 200, body: JSON.stringify({}) }));
        else send(RESULT(m.id, { status: 404, body: '' }));
        return;
      }
      case 'prompt': send(RESULT(m.id, { sent: 'skipped' })); return;
      // Refused on purpose: the harness never starts chats.
      case 'start-session': send(FAIL(m.id, 'DISABLED', 'The screenshot harness never starts chats.')); return;
      // No navigation in the harness; opening a chat is acknowledged, nothing more.
      case 'open-session': send(RESULT(m.id)); return;
      case 'close': return; // The board asks to close its frame; the harness ignores it.
      default: send(RESULT(m.id));
    }
  });
})();
`;

const outerPage = (panel, params) => {
  const blob = buildBlob(params);
  if (panel) blob.surface = 'panel'; else blob.surface = 'page';
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>kanban mock — ${panel ? 'panel' : 'page'}</title>
<style>
  html, body { margin: 0; height: 100%; background: #fdfcfa; overflow: hidden; }
  /* The fake shell: the guest frame fills the viewport; the rail keeps a
     fixed width so the mirror renders at rail proportions on any viewport. */
  .stage { height: 100dvh; display: flex; justify-content: center; }
  .stage > iframe { height: 100%; border: 0; }
  .stage.mode-page > iframe { width: 100%; }
  .stage.mode-panel > iframe { width: 400px; box-shadow: 0 0 0 1px rgba(0,0,0,.08); }
</style>
</head>
<body>
<div class="stage mode-${panel ? 'panel' : 'page'}">
<iframe id="frame" title="OpenChamber guest" src="/${panel ? 'frame' : 'page'}.html"></iframe>
</div>
<script>${pageScript(blob)}</script>
</body>
</html>`;
};

// ---- Server ----------------------------------------------------------------

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  if (url.pathname === '/mock/page' || url.pathname === '/mock/panel') {
    res.writeHead(200, MIME['.html']);
    res.end(outerPage(url.pathname === '/mock/panel', url.searchParams));
    return;
  }
  if (url.pathname === '/healthz') {
    res.writeHead(200, MIME['.js']);
    res.end('ok');
    return;
  }
  const relative = normalize(decodeURIComponent(url.pathname)).replace(/^([/\\]|\.\.)+/, '');
  const file = join(PANEL_DIR, relative);
  try {
    const body = await readFile(file);
    res.writeHead(200, MIME[relative.split('.').pop()] ?? MIME['.html']);
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`screenshot harness on http://127.0.0.1:${PORT}/mock/page`);
});
