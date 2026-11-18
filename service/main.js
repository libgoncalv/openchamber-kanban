// src/service/main.ts
import { execFile } from "node:child_process";
import { randomBytes as randomBytes2 } from "node:crypto";
import { chmod, readFile as readFile2, rename as rename2, rm, writeFile as writeFile2 } from "node:fs/promises";
import { join as join2 } from "node:path";

// node_modules/@openchamber/sdk/dist/scrollbar-style.js
var GUEST_SCROLLING_ATTRIBUTE = "data-oc-scrolling";
var GUEST_SCROLLBAR_CSS = `
:root {
  /* Quiet at rest like the app's own thumbs; hover gives a clear grab target. */
  --oc-scrollbar-thumb: color-mix(in srgb, var(--oc-muted, currentColor) 18%, transparent);
  --oc-scrollbar-thumb-hover: color-mix(in srgb, var(--oc-muted, currentColor) 36%, transparent);
  scrollbar-gutter: stable;
}
* {
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}
:hover, [${GUEST_SCROLLING_ATTRIBUTE}] {
  scrollbar-color: var(--oc-scrollbar-thumb) transparent;
}
/* Chromium's standard scrollbar properties otherwise override its pseudo-elements. */
@supports selector(::-webkit-scrollbar) {
  *, :hover, [${GUEST_SCROLLING_ATTRIBUTE}] { scrollbar-width: auto; scrollbar-color: auto; }
  ::-webkit-scrollbar { width: 6px; height: 6px; background: transparent; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 999px;
    min-width: 24px;
    min-height: 24px;
  }
  :hover::-webkit-scrollbar-thumb, [${GUEST_SCROLLING_ATTRIBUTE}]::-webkit-scrollbar-thumb { background: var(--oc-scrollbar-thumb); }
  ::-webkit-scrollbar-thumb:hover { background: var(--oc-scrollbar-thumb-hover); }
  ::-webkit-scrollbar-corner { background: transparent; }
  ::-webkit-scrollbar-button { display: none; width: 0; height: 0; }
}
@media (forced-colors: active) {
  *, :hover, [${GUEST_SCROLLING_ATTRIBUTE}] { scrollbar-color: auto; }
  ::-webkit-scrollbar-thumb, ::-webkit-scrollbar-thumb:hover { background: CanvasText; }
}
`;
function installGuestScrollbarActivity(doc) {
  const root = doc.documentElement;
  if (root.hasAttribute("data-oc-scrollbar-activity"))
    return;
  root.setAttribute("data-oc-scrollbar-activity", "");
  const timers = /* @__PURE__ */ new WeakMap();
  doc.addEventListener("scroll", (event) => {
    const target = event.target === doc ? root : event.target;
    if (!(target instanceof Element))
      return;
    if (!target.hasAttribute("data-oc-scrolling"))
      target.setAttribute("data-oc-scrolling", "");
    const pending = timers.get(target);
    if (pending !== void 0)
      clearTimeout(pending);
    timers.set(target, setTimeout(() => {
      timers.delete(target);
      target.removeAttribute("data-oc-scrolling");
    }, 1e3));
  }, { capture: true, passive: true });
}
var GUEST_SCROLLBAR_SCRIPT = `(${installGuestScrollbarActivity.toString()})(document);`;

// node_modules/@openchamber/sdk/dist/manifest.js
var GUEST_PROVIDER_LOGO_BYTES_MAX = 1024 * 1024;
var TRACKER_URL_TOKENS = ["{id}", "{segment}", "{segments+}"];
var TRACKER_URL_TOKEN_SET = new Set(TRACKER_URL_TOKENS);

// node_modules/@openchamber/sdk/dist/session-events.js
var GUEST_SESSION_EVENT_TYPES = [
  "turn-finished",
  "turn-failed",
  "permission-asked",
  "question-asked",
  "turn-started",
  "session-created",
  "session-archived",
  "session-deleted"
];
var SESSION_EVENTS_IDLE_MS = 10 * 6e4;
var EVENT_TYPES = new Set(GUEST_SESSION_EVENT_TYPES);

// node_modules/@openchamber/sdk/dist/service-host.js
var SERVICE_HOST_PATH = "/service/call";
var OPENCHAMBER_HOST_CALLBACK_URL_ENV = "OPENCHAMBER_HOST_CALLBACK_URL";
var SERVICE_HOST_TIMEOUT_MS = 3e4;
var SERVICE_SCHEDULE_IDLE_MS = 10 * 6e4;
var MENTIONS_IDLE_MS = 10 * 6e4;
var ServiceHostError = class extends Error {
  code;
  status;
  constructor(message, code, status) {
    super(message);
    this.name = "ServiceHostError";
    this.code = code;
    this.status = status;
  }
};
var createServiceHost = ({ env }) => {
  const call = async (method, input) => {
    const base = env[OPENCHAMBER_HOST_CALLBACK_URL_ENV];
    const token2 = env.OPENCHAMBER_SERVICE_TOKEN;
    if (!base || !token2)
      throw new ServiceHostError("This service was not started by OpenChamber.", "HOST_UNAVAILABLE", 0);
    let response;
    try {
      response = await fetch(`${base.replace(/\/+$/, "")}${SERVICE_HOST_PATH}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token2}`, "Content-Type": "application/json" },
        body: JSON.stringify({ method, input }),
        signal: AbortSignal.timeout(SERVICE_HOST_TIMEOUT_MS)
      });
    } catch {
      throw new ServiceHostError("OpenChamber did not answer.", "HOST_UNAVAILABLE", 0);
    }
    const body = await response.json().catch(() => null);
    if (response.ok && body?.result !== void 0)
      return body.result;
    throw new ServiceHostError(body?.error?.message ?? `OpenChamber answered HTTP ${response.status}.`, body?.error?.code ?? "HOST_UNAVAILABLE", response.status);
  };
  return {
    sessions: {
      start: (input) => call("sessions.start", input),
      send: (sessionId, prompt) => call("sessions.send", { sessionId, prompt }),
      retry: (sessionId) => call("sessions.retry", { sessionId }),
      status: (sessionId) => call("sessions.status", { sessionId }),
      lastReply: (sessionId) => call("sessions.lastReply", { sessionId }),
      stop: (sessionId) => call("sessions.stop", { sessionId }),
      answerPermission: (sessionId, requestId, answer) => call("sessions.answerPermission", { sessionId, requestId, ...answer }),
      answerForm: (sessionId, formId, values, message) => call("sessions.answerForm", { sessionId, formId, values, ...message === void 0 ? {} : { message } })
    },
    setInstructions: (directory, text) => call("instructions.set", { directory, text }),
    emit: (topic, data) => call("panels.emit", { topic, data }),
    readSettings: () => call("settings.read", {}).then(({ settings }) => settings),
    needsConfiguration: (message) => call("status.set", { needsConfiguration: message }),
    setMark: (target, mark) => call("marks.set", { target, mark })
  };
};

// node_modules/@openchamber/sdk/dist/contract.js
var GUEST_FILE_STAT_KINDS = ["file", "directory", "other", "missing"];
var GUEST_GENERATE_LATE_KEEP_MS = 60 * 6e4;
var HOST_REQUEST_ERROR_CODES = [
  "HOST_UNAVAILABLE",
  "HOST_TIMEOUT",
  "HOST_REJECTED",
  "DISCONNECTED",
  "DISABLED",
  "BAD_PATH",
  "NO_INTEGRATION",
  "NO_SERVICE",
  "SERVICE_FAILED",
  "REQUEST_FAILED",
  "RESPONSE_TOO_LARGE",
  "NO_SESSION",
  "SESSION_BUSY",
  "NOT_GRANTED",
  "NO_DIRECTORY",
  "NOT_FOUND",
  "FILE_TOO_LARGE",
  "DENIED",
  "NO_MODEL",
  "MODEL_FAILED",
  "UNSUPPORTED"
];
var SERVICE_STATUS_VALUES = ["stopped", "starting", "ready", "failed"];
var hostRequestErrorCodeSet = new Set(HOST_REQUEST_ERROR_CODES);
var serviceStatusSet = new Set(SERVICE_STATUS_VALUES);
var fileStatKindSet = new Set(GUEST_FILE_STAT_KINDS);

// node_modules/@openchamber/sdk/dist/service-providers.js
var BROWSER_CONTROL_ACTIONS = [
  "browser.open",
  "browser.snapshot",
  "browser.click",
  "browser.type",
  "browser.select",
  "browser.scroll",
  "browser.back",
  "browser.forward",
  "browser.inspect",
  "browser.capture",
  "browser.resize",
  "browser.close"
];
var BROWSER_PROVIDER_IDLE_MS = 10 * 6e4;
var CONTROL_ACTIONS = new Set(BROWSER_CONTROL_ACTIONS);
var SOURCE_CONTROL_PROVIDER_IDLE_MS = 10 * 6e4;
var NOTIFICATIONS_PROVIDER_IDLE_MS = 10 * 6e4;
var TRACKER_PROVIDER_IDLE_MS = 10 * 6e4;
var QUOTA_PROVIDER_IDLE_MS = 10 * 6e4;

// node_modules/@openchamber/sdk/dist/service-surface.js
var SURFACE_CONTROLLERS = ["none", "agent", "user"];
var CONTROLLERS = new Set(SURFACE_CONTROLLERS);

// src/service/server.ts
import http from "node:http";
import path from "node:path";

// src/domain/worktree.ts
var parseGitRefOutput = (stdout) => {
  const branches = [];
  for (const line of stdout.split("\n").map((l) => l.trim()).filter(Boolean)) {
    if (line.startsWith("refs/heads/")) branches.push({ name: line.slice("refs/heads/".length), kind: "local" });
    else if (line.startsWith("refs/remotes/")) {
      const name = line.slice("refs/remotes/".length);
      if (!name.endsWith("/HEAD")) branches.push({ name, kind: "remote" });
    }
  }
  return branches;
};

// src/service/transcribe.ts
var SAMPLE_RATE_MIN = 8e3;
var SAMPLE_RATE_MAX = 192e3;
var REQUEST_BASE64_MAX = 64e3;
var CLIP_SAMPLES_MAX = 120 * 16e3;
var SESSIONS_MAX = 4;
var SESSION_TTL_MS = 5 * 6e4;
var ok = (json2, status = 200) => ({ status, json: json2 });
var fail = (status, error) => ({ status, json: { error } });
var pcm16Base64ToFloat32 = (base64) => {
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64)) throw new Error("pcm16 is not valid base64");
  const bytes = Buffer.from(base64, "base64");
  if (bytes.length === 0) throw new Error("pcm16 decodes to no samples");
  if (bytes.length % 2 !== 0) throw new Error("pcm16 payload has an odd number of bytes");
  const samples = new Float32Array(bytes.length / 2);
  for (let i = 0; i < samples.length; i++) {
    samples[i] = bytes.readInt16LE(i * 2) / 32768;
  }
  return samples;
};
var isPositiveInt = (value) => typeof value === "number" && Number.isInteger(value) && value > 0;
var parseBody = (body) => {
  try {
    const parsed = JSON.parse(body);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
};
var createTranscribeRoutes = (transcriber) => {
  const sessions = /* @__PURE__ */ new Map();
  const newSessionId = () => Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  const expire = (now = Date.now()) => {
    for (const [id, session] of sessions) {
      if (now - session.touchedAt > SESSION_TTL_MS) sessions.delete(id);
    }
  };
  const transcribeSessionSamples = async (session) => {
    try {
      const text = await transcriber.transcribe(session.samples, session.sampleRate);
      return ok({ text });
    } catch (error) {
      return fail(503, error instanceof Error ? error.message : String(error));
    }
  };
  const handle = async (method, pathname, body) => {
    if (method !== "POST") return fail(404, "not-found");
    const input = parseBody(body);
    if (pathname === "/transcribe") {
      if (!input) return fail(400, "Request body must be JSON");
      const { pcm16, sampleRate } = input;
      if (typeof pcm16 !== "string" || pcm16.length === 0) return fail(400, "pcm16 (base64 string) is required");
      if (pcm16.length > REQUEST_BASE64_MAX) return fail(413, `Clip too large for one request \u2014 use the chunked flow (${pcm16.length} > ${REQUEST_BASE64_MAX} characters)`);
      if (!isPositiveInt(sampleRate) || sampleRate < SAMPLE_RATE_MIN || sampleRate > SAMPLE_RATE_MAX) {
        return fail(400, `sampleRate must be an integer between ${SAMPLE_RATE_MIN} and ${SAMPLE_RATE_MAX}`);
      }
      let samples;
      try {
        samples = pcm16Base64ToFloat32(pcm16);
      } catch (error) {
        return fail(400, `Invalid pcm16: ${error instanceof Error ? error.message : String(error)}`);
      }
      try {
        const text = await transcriber.transcribe(samples, sampleRate);
        return ok({ text });
      } catch (error) {
        return fail(503, error instanceof Error ? error.message : String(error));
      }
    }
    if (pathname === "/transcribe/begin" && method === "POST") {
      if (!input) return fail(400, "Request body must be JSON");
      const { sampleRate } = input;
      if (!isPositiveInt(sampleRate) || sampleRate < SAMPLE_RATE_MIN || sampleRate > SAMPLE_RATE_MAX) {
        return fail(400, `sampleRate must be an integer between ${SAMPLE_RATE_MIN} and ${SAMPLE_RATE_MAX}`);
      }
      expire();
      if (sessions.size >= SESSIONS_MAX) return fail(429, "Too many clips in flight \u2014 finish or cancel one first");
      const id = newSessionId();
      sessions.set(id, { samples: new Float32Array(0), sampleRate, touchedAt: Date.now() });
      return ok({ id });
    }
    const session = (() => {
      if (pathname === "/transcribe/append" || pathname === "/transcribe/finish" || pathname === "/transcribe/cancel") {
        if (!input) return void 0;
        const id = input.id;
        if (typeof id !== "string") return void 0;
        expire(Date.now());
        return { id, clip: sessions.get(id) };
      }
      return void 0;
    })();
    if (pathname === "/transcribe/finish") {
      if (!session?.clip) return fail(404, "Unknown clip id \u2014 begin or append first, or the clip expired");
      sessions.delete(session.id);
      return transcribeSessionSamples(session.clip);
    }
    if (pathname === "/transcribe/cancel") {
      if (!session || !sessions.has(session.id)) return ok({ cancelled: false });
      sessions.delete(session.id);
      return ok({ cancelled: true });
    }
    if (pathname === "/transcribe/append") {
      if (!session) return fail(400, "id (string) is required");
      const { pcm16 } = input ?? {};
      if (typeof pcm16 !== "string" || pcm16.length === 0) return fail(400, "pcm16 (base64 string) is required");
      if (pcm16.length > REQUEST_BASE64_MAX) return fail(413, `pcm16 too large (${pcm16.length} > ${REQUEST_BASE64_MAX} characters)`);
      let samples;
      try {
        samples = pcm16Base64ToFloat32(pcm16);
      } catch (error) {
        return fail(400, `Invalid pcm16: ${error instanceof Error ? error.message : String(error)}`);
      }
      if (!session.clip) return fail(404, "Unknown clip id \u2014 begin or append first, or the clip expired");
      const clip = session.clip;
      if (clip.sampleRate !== void 0 && samples.length > 0 && clip.samples.length + samples.length > CLIP_SAMPLES_MAX) {
        return fail(413, `Clip exceeds ${CLIP_SAMPLES_MAX / 16e3}s at 16 kHz`);
      }
      clip.samples = concatFloat32(clip.samples, samples);
      clip.touchedAt = Date.now();
      return ok({ samples: clip.samples.length });
    }
    return fail(404, "not-found");
  };
  return { handle, sessions };
};
var concatFloat32 = (a, b) => {
  if (a.length === 0) return b;
  const out = new Float32Array(a.length + b.length);
  out.set(a);
  out.set(b, a.length);
  return out;
};

// src/service/agentRoutes.ts
import { randomBytes } from "node:crypto";

// src/domain/task.ts
var TITLE_MAX = 200;
var DESCRIPTION_MAX = 16e3;
var AGENT_NOTE_MAX = 2e3;

// src/domain/agentChannel.ts
var AGENT_CHANNEL_VERSION = 1;
var AGENT_JOURNAL_MAX = 200;
var AGENT_NOTE_WIRE_MAX = AGENT_NOTE_MAX;
var AGENT_CREATE_STATUSES = ["backlog", "todo"];
var ENTRY_ID_PATTERN = /^a_[0-9a-f]{8,64}$/;
var parseJournalEntry = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Journal entry is not an object");
  const record = value;
  if (record.v !== AGENT_CHANNEL_VERSION) throw new Error(`Unsupported journal entry version ${String(record.v)}`);
  if (typeof record.id !== "string" || !ENTRY_ID_PATTERN.test(record.id)) throw new Error("Journal entry id is invalid");
  if (typeof record.at !== "number" || !Number.isFinite(record.at) || record.at < 0) throw new Error("Journal entry at must be a timestamp");
  if (record.kind === "create") {
    if (typeof record.title !== "string" || !record.title.trim() || record.title.length > TITLE_MAX) throw new Error("Journal create title is invalid");
    if (typeof record.description !== "string" || record.description.length > DESCRIPTION_MAX) throw new Error("Journal create description is invalid");
    if (record.directory !== null && typeof record.directory !== "string") throw new Error("Journal create directory is invalid");
    if (record.projectId !== null && typeof record.projectId !== "string") throw new Error("Journal create projectId is invalid");
    if (!AGENT_CREATE_STATUSES.includes(record.status)) throw new Error("Journal create status is invalid");
    return {
      id: record.id,
      v: AGENT_CHANNEL_VERSION,
      kind: "create",
      at: record.at,
      title: record.title,
      description: record.description,
      directory: record.directory,
      projectId: record.projectId,
      status: record.status
    };
  }
  if (record.kind === "note") {
    if (typeof record.taskId !== "string" || record.taskId.length > 64) throw new Error("Journal note taskId is invalid");
    if (typeof record.text !== "string" || record.text.length > AGENT_NOTE_WIRE_MAX) throw new Error("Journal note text is invalid");
    return { id: record.id, v: AGENT_CHANNEL_VERSION, kind: "note", at: record.at, taskId: record.taskId, text: record.text };
  }
  throw new Error("Journal entry kind is invalid");
};
var parseAgentCreateRequest = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Request body must be a JSON object");
  const record = value;
  if (typeof record.title !== "string" || !record.title.trim()) throw new Error("A task needs a title");
  const title = record.title.trim();
  if (title.length > TITLE_MAX) throw new Error(`Title is limited to ${TITLE_MAX} characters`);
  if (record.description !== void 0 && typeof record.description !== "string") throw new Error("Description must be text");
  const description = record.description ?? "";
  if (description.length > DESCRIPTION_MAX) throw new Error(`Description is limited to ${DESCRIPTION_MAX} characters`);
  if (record.directory !== void 0 && record.directory !== null && typeof record.directory !== "string") throw new Error("directory must be a string or null");
  const directory = record.directory ?? null;
  const status = record.status ?? "backlog";
  if (!AGENT_CREATE_STATUSES.includes(status)) throw new Error("status must be 'backlog' or 'todo'");
  return { title, description, directory, status };
};
var parseAgentNoteRequest = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Request body must be a JSON object");
  const record = value;
  if (typeof record.text !== "string" || !record.text.trim()) throw new Error("A note needs text");
  if (record.text.length > AGENT_NOTE_MAX) throw new Error(`A note is limited to ${AGENT_NOTE_MAX} characters`);
  return { text: record.text };
};
var parseMirrorDoc = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value;
  if (record.v !== AGENT_CHANNEL_VERSION || typeof record.savedAt !== "number" || !Number.isFinite(record.savedAt)) return null;
  const projects = Array.isArray(record.projects) ? record.projects.flatMap((raw) => {
    if (!raw || typeof raw !== "object") return [];
    const one = raw;
    if (typeof one.id !== "string" || typeof one.name !== "string") return [];
    if (one.directory !== null && typeof one.directory !== "string") return [];
    return [{ id: one.id, name: one.name, directory: one.directory }];
  }) : [];
  const tasks = Array.isArray(record.tasks) ? record.tasks.flatMap((raw) => {
    if (!raw || typeof raw !== "object") return [];
    const one = raw;
    if (typeof one.id !== "string" || typeof one.title !== "string" || typeof one.description !== "string") return [];
    if (typeof one.updatedAt !== "number" || !Number.isFinite(one.updatedAt)) return [];
    return [{
      id: one.id,
      title: one.title,
      description: one.description,
      status: one.status === "backlog" || one.status === "todo" || one.status === "in_progress" || one.status === "review" || one.status === "done" ? one.status : "backlog",
      projectId: typeof one.projectId === "string" ? one.projectId : null,
      projectName: typeof one.projectName === "string" ? one.projectName : null,
      sessionId: typeof one.sessionId === "string" ? one.sessionId : null,
      updatedAt: one.updatedAt,
      notes: Array.isArray(one.notes) ? one.notes.flatMap((note) => {
        if (!note || typeof note !== "object") return [];
        const n = note;
        if (typeof n.at !== "number" || !Number.isFinite(n.at) || typeof n.text !== "string") return [];
        return [{ at: n.at, text: n.text }];
      }) : []
    }];
  }) : [];
  return { v: AGENT_CHANNEL_VERSION, savedAt: record.savedAt, projects, tasks };
};
var resolveDirectoryToProject = (projects, directory) => {
  if (!directory) return null;
  const exact = projects.find((project) => project.directory !== null && project.directory === directory);
  if (exact) return exact.id;
  let best = null;
  for (const project of projects) {
    if (project.directory === null) continue;
    if (!directory.startsWith(project.directory.endsWith("/") ? project.directory : `${project.directory}/`)) continue;
    if (best === null || project.directory.length > best.length) best = { id: project.id, length: project.directory.length };
  }
  return best?.id ?? null;
};

// src/service/agentRoutes.ts
var TASK_ID_PATTERN = /^t_[a-z0-9]{6,40}$/;
var ok2 = (json2) => ({ status: 200, json: json2 });
var fail2 = (status, error) => ({ status, json: { error } });
var parseBody2 = (body) => {
  try {
    const parsed = JSON.parse(body);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
    return null;
  } catch {
    return null;
  }
};
var newEntryId = () => `a_${randomBytes(16).toString("hex")}`;
var createAgentTaskRoutes = ({ store, notifyChange }) => {
  const handle = async (method, pathname, body, scope) => {
    if (!pathname.startsWith("/agent/")) return null;
    const isHost = scope === "host";
    if (pathname === "/agent/mirror" && method === "PUT") {
      if (!isHost) return fail2(403, "The mirror is written by the board; agents read it via GET /agent/tasks");
      const parsed = body ? parseBody2(body) : null;
      const doc = parsed ? parseMirrorDoc(parsed) : null;
      if (doc === null) return fail2(400, "Request body must be a mirror document");
      await store.writeMirror(doc);
      return ok2({ saved: true, tasks: doc.tasks.length });
    }
    if (pathname === "/agent/pending" && method === "GET") {
      if (!isHost) return fail2(403, "The pending journal is read by the board only");
      return ok2({ pending: await store.readPending() });
    }
    if (pathname === "/agent/pending/ack" && method === "POST") {
      if (!isHost) return fail2(403, "Acknowledging journal entries is the board's job");
      const parsed = body ? parseBody2(body) : null;
      const rawIds = parsed && Array.isArray(parsed.ids) ? parsed.ids : null;
      if (rawIds === null || rawIds.some((id) => typeof id !== "string")) return fail2(400, "Request body must be { ids: string[] }");
      const ids = rawIds.slice(0, AGENT_JOURNAL_MAX);
      await store.ackPending(ids);
      return ok2({ acked: ids.length, remaining: await store.pendingCount() });
    }
    if (pathname === "/agent/tasks" && method === "GET") {
      const mirror = await store.readMirror();
      return ok2({ tasks: mirror?.tasks ?? [], savedAt: mirror?.savedAt ?? null });
    }
    if (pathname === "/agent/tasks" && method === "POST") {
      const parsed = body ? parseBody2(body) : null;
      if (parsed === null) return fail2(400, "Request body must be JSON");
      let request;
      try {
        request = parseAgentCreateRequest(parsed);
      } catch (error) {
        return fail2(400, error instanceof Error ? error.message : "Invalid request");
      }
      const mirror = await store.readMirror();
      const projectId = resolveDirectoryToProject(mirror?.projects ?? [], request.directory);
      const entry = {
        id: newEntryId(),
        v: AGENT_CHANNEL_VERSION,
        kind: "create",
        at: Date.now(),
        title: request.title,
        description: request.description,
        directory: request.directory,
        projectId,
        status: request.status
      };
      return queue(entry, (queued) => ({
        projectId: queued.kind === "create" ? queued.projectId : void 0,
        projectName: mirror?.projects.find((project) => project.id === projectId)?.name ?? null,
        warning: request.directory !== null && projectId === null ? "directory did not match a project of this board \u2014 the task will be created without one" : void 0
      }));
    }
    if (pathname.startsWith("/agent/tasks/") && pathname.endsWith("/note") && method === "POST") {
      const taskId = decodeURIComponent(pathname.slice("/agent/tasks/".length, -"/note".length));
      if (!TASK_ID_PATTERN.test(taskId)) return fail2(404, "Unknown task id \u2014 GET /agent/tasks lists the board");
      const parsed = body ? parseBody2(body) : null;
      if (parsed === null) return fail2(400, "Request body must be JSON");
      let request;
      try {
        request = parseAgentNoteRequest(parsed);
      } catch (error) {
        return fail2(400, error instanceof Error ? error.message : "Invalid request");
      }
      const mirror = await store.readMirror();
      if (!mirror || !mirror.tasks.some((task) => task.id === taskId)) {
        return fail2(404, `No task ${taskId} on the board \u2014 GET /agent/tasks lists the board`);
      }
      const entry = {
        id: newEntryId(),
        v: AGENT_CHANNEL_VERSION,
        kind: "note",
        at: Date.now(),
        taskId,
        text: request.text
      };
      return queue(entry, () => ({}));
    }
    return null;
  };
  const queue = async (entry, extra) => {
    try {
      await store.appendPending([entry]);
    } catch {
      const count2 = await store.pendingCount().catch(() => 0);
      return fail2(
        429,
        `The board has ${count2} pending agent changes it has not applied yet \u2014 open the Kanban page once so the board catches up, then retry.`
      );
    }
    const count = await store.pendingCount().catch(() => 0);
    if (notifyChange) {
      try {
        notifyChange(count);
      } catch {
      }
    }
    return ok2({ queued: true, id: entry.id, at: entry.at, pending: count, ...extra(entry) });
  };
  return { handle };
};

// src/service/server.ts
var BODY_MAX = 131072;
var COMMIT_BASE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._/-]*$/;
var readBody = (req) => new Promise((resolve) => {
  let size = 0;
  const parts = [];
  let done = false;
  const finish = (value) => {
    if (!done) {
      done = true;
      resolve(value);
    }
  };
  req.on("data", (chunk) => {
    size += chunk.length;
    if (size > BODY_MAX) {
      finish(null);
      req.destroy();
      return;
    }
    parts.push(chunk);
  });
  req.on("end", () => finish(Buffer.concat(parts).toString("utf8")));
  req.on("error", () => finish(null));
});
var json = (res, status, body) => {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
};
var createServiceServer = ({ token: token2, git: git2, transcriber, agent: agent2 }) => {
  const transcribe = createTranscribeRoutes(transcriber);
  const agentRoutes = agent2 ? createAgentTaskRoutes({ store: agent2.store, notifyChange: agent2.notifyChange }) : null;
  return http.createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://127.0.0.1");
    if (url.pathname === "/health") {
      json(res, 200, { ok: true });
      return;
    }
    const authorization = req.headers.authorization;
    const hostAuth = authorization === `Bearer ${token2}`;
    const agentAuth = Boolean(agent2) && authorization === `Bearer ${agent2?.token}`;
    if (!hostAuth && !agentAuth) {
      json(res, 401, { error: "unauthorized" });
      return;
    }
    void (async () => {
      try {
        if (url.pathname.startsWith("/agent/")) {
          if (!agentRoutes) {
            json(res, 404, { error: "not-found" });
            return;
          }
          const body = req.method === "GET" ? "" : await readBody(req);
          if (body === null) {
            json(res, 413, { error: "Request body too large" });
            return;
          }
          const answer = await agentRoutes.handle(req.method ?? "", url.pathname, body, hostAuth ? "host" : "agent");
          if (answer === null) {
            json(res, 404, { error: "not-found" });
            return;
          }
          json(res, answer.status, answer.json);
          return;
        }
        if (!hostAuth) {
          json(res, 403, { error: "forbidden" });
          return;
        }
        if (req.method === "GET" && url.pathname === "/branches") {
          const directory = url.searchParams.get("directory") ?? "";
          if (!path.isAbsolute(directory)) {
            json(res, 400, { error: "bad-request" });
            return;
          }
          const result = await git2(directory, ["for-each-ref", "--sort=-committerdate", "--count=200", "--format=%(refname)", "refs/heads", "refs/remotes"]);
          if (!result.ok) {
            json(res, result.status, { error: result.error });
            return;
          }
          json(res, 200, { branches: parseGitRefOutput(result.stdout) });
          return;
        }
        if (req.method === "GET" && url.pathname === "/commits-ahead") {
          const directory = url.searchParams.get("directory") ?? "";
          const base = url.searchParams.get("base") ?? "";
          if (!path.isAbsolute(directory) || !COMMIT_BASE_PATTERN.test(base) || base.includes("..")) {
            json(res, 400, { error: "bad-request" });
            return;
          }
          const count = await git2(directory, ["rev-list", "--count", `${base}..HEAD`]);
          if (!count.ok) {
            json(res, count.status, { error: count.error });
            return;
          }
          const head = await git2(directory, ["rev-parse", "HEAD"]);
          if (!head.ok) {
            json(res, head.status, { error: head.error });
            return;
          }
          const ahead = Number.parseInt(count.stdout.trim(), 10);
          if (!Number.isInteger(ahead) || ahead < 0) {
            json(res, 500, { error: "unparseable rev-list output" });
            return;
          }
          json(res, 200, { ahead, head: head.stdout.trim() || null });
          return;
        }
        if (url.pathname.startsWith("/transcribe")) {
          const body = req.method === "POST" ? await readBody(req) : "";
          if (body === null) {
            json(res, 413, { error: "Request body too large" });
            return;
          }
          const routeAnswer = await transcribe.handle(req.method ?? "", url.pathname, body);
          json(res, routeAnswer.status, routeAnswer.json);
          return;
        }
        json(res, 404, { error: "not-found" });
      } catch (error) {
        json(res, 500, { error: error instanceof Error ? error.message : String(error) });
      }
    })();
  });
};

// src/service/agentStore.ts
import { mkdir, readFile, rename, appendFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
var BODY_MAX_BYTES = 8 * 1024 * 1024;
var createAgentStore = ({ dataDir: dataDir2 }) => {
  const mirrorPath = join(dataDir2, "mirror.json");
  const journalPath = join(dataDir2, "journal.jsonl");
  let ready = mkdir(dataDir2, { recursive: true }).catch(() => void 0);
  let chain = Promise.resolve();
  const serialized = (operation) => {
    const next = chain.catch(() => void 0).then(operation);
    chain = next.catch(() => void 0);
    return next;
  };
  const atomicWrite = async (path3, content, mode) => {
    const temp = `${path3}.tmp`;
    await writeFile(temp, content, { encoding: "utf8", mode });
    await rename(temp, path3);
  };
  return {
    readMirror: async () => {
      await ready;
      try {
        const raw = await readFile(mirrorPath, "utf8");
        if (raw.length > BODY_MAX_BYTES) return null;
        try {
          return JSON.parse(raw);
        } catch {
          return null;
        }
      } catch {
        return null;
      }
    },
    writeMirror: (doc) => serialized(async () => {
      await ready;
      await atomicWrite(mirrorPath, JSON.stringify(doc), 384);
    }),
    pendingCount: async () => {
      await ready;
      return (await readPendingInner(journalPath)).length;
    },
    readPending: async () => {
      await ready;
      return readPendingInner(journalPath);
    },
    appendPending: (entries) => serialized(async () => {
      await ready;
      const existing = await readPendingInner(journalPath);
      if (existing.length + entries.length > AGENT_JOURNAL_MAX) throw new Error("Journal is full");
      const lines = entries.map((entry) => `${JSON.stringify(entry)}
`).join("");
      await appendFile(journalPath, lines, { encoding: "utf8" });
    }),
    ackPending: (ids) => serialized(async () => {
      await ready;
      const existing = await readPendingInner(journalPath);
      if (existing.length === 0) return;
      const acked = new Set(ids);
      const kept = existing.filter((entry) => !acked.has(entry.id));
      await atomicWrite(journalPath, kept.map((entry) => `${JSON.stringify(entry)}
`).join(""), 384);
    })
  };
};
var readPendingInner = async (journalPath) => {
  let raw;
  try {
    raw = await readFile(journalPath, "utf8");
  } catch {
    return [];
  }
  if (raw.length > BODY_MAX_BYTES) return [];
  const entries = [];
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      entries.push(parseJournalEntry(JSON.parse(trimmed)));
    } catch {
    }
  }
  return entries;
};

// src/service/recognizer.ts
import fs from "node:fs";
import path2 from "node:path";
var TranscriptionError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "TranscriptionError";
  }
};
var MODEL_DIR = path2.join(
  process.env.HOME ?? "",
  ".config",
  "openchamber",
  "speech-models",
  "sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8"
);
var MODEL_FILES = ["encoder.int8.onnx", "decoder.int8.onnx", "joiner.int8.onnx", "tokens.txt"];
var MIN_SAMPLES = 1600;
var createSherpaTranscriber = (modelDir = MODEL_DIR, loadModule = async () => {
  const mod = await import("sherpa-onnx-node");
  return mod.default ?? mod;
}) => {
  let recognizer = null;
  const modelMissing = () => {
    if (!fs.existsSync(modelDir)) return `Speech model not found: ${modelDir}`;
    const missing = MODEL_FILES.filter((file) => !fs.existsSync(path2.join(modelDir, file)));
    return missing.length > 0 ? `Speech model is incomplete, missing ${missing.join(", ")} in ${modelDir}` : null;
  };
  const ensureRecognizer = async () => {
    if (recognizer) return recognizer;
    const missing = modelMissing();
    if (missing) throw new TranscriptionError(`${missing} \u2014 voice dictation cannot start.`);
    try {
      const sherpa = await loadModule();
      recognizer = new sherpa.OfflineRecognizer({
        featConfig: { sampleRate: 16e3, featureDim: 80 },
        modelConfig: {
          transducer: {
            encoder: path2.join(modelDir, "encoder.int8.onnx"),
            decoder: path2.join(modelDir, "decoder.int8.onnx"),
            joiner: path2.join(modelDir, "joiner.int8.onnx")
          },
          tokens: path2.join(modelDir, "tokens.txt"),
          numThreads: 2,
          provider: "cpu",
          debug: 0,
          modelType: "nemo_transducer"
        }
      });
      return recognizer;
    } catch (error) {
      throw new TranscriptionError(`Could not start the speech model: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  return {
    async transcribe(samples, sampleRate) {
      if (samples.length < MIN_SAMPLES) return "";
      const session = await ensureRecognizer();
      try {
        const stream = session.createStream();
        stream.acceptWaveform({ sampleRate, samples });
        session.decode(stream);
        return session.getResult(stream).text ?? "";
      } catch (error) {
        throw new TranscriptionError(`Transcription failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  };
};

// src/service/main.ts
var port = Number(process.env.OPENCHAMBER_SERVICE_PORT);
var token = process.env.OPENCHAMBER_SERVICE_TOKEN ?? "";
if (!port || !token) {
  console.error("OPENCHAMBER_SERVICE_PORT and OPENCHAMBER_SERVICE_TOKEN are required");
  process.exit(1);
}
var AGENT_TOKEN_FILE = "agent-token";
var DISCOVERY_FILE = "agent.json";
var dataDir = process.env.OPENCHAMBER_SERVICE_DATA_DIR;
var createAgentChannel = async (dataDir2, port2) => {
  let agentToken = "";
  try {
    agentToken = (await readFile2(join2(dataDir2, AGENT_TOKEN_FILE), "utf8")).trim();
  } catch {
  }
  if (!agentToken) {
    agentToken = randomBytes2(32).toString("hex");
    await writeFile2(join2(dataDir2, AGENT_TOKEN_FILE), agentToken, { encoding: "utf8", mode: 384 });
  } else {
    await chmod(join2(dataDir2, AGENT_TOKEN_FILE), 384).catch(() => void 0);
  }
  const store = createAgentStore({ dataDir: dataDir2 });
  const writeDiscovery = async () => {
    const temp = join2(dataDir2, `${DISCOVERY_FILE}.tmp`);
    await writeFile2(temp, JSON.stringify({ v: 1, port: port2, token: agentToken, pid: process.pid }), { encoding: "utf8", mode: 384 });
    await rename2(temp, join2(dataDir2, DISCOVERY_FILE));
  };
  await writeDiscovery();
  for (const signal of ["SIGTERM", "SIGINT"]) {
    process.on(signal, () => {
      void Promise.all([
        rm(join2(dataDir2, DISCOVERY_FILE), { force: true }),
        rm(join2(dataDir2, `${DISCOVERY_FILE}.tmp`), { force: true })
      ]).catch(() => void 0).finally(() => process.exit(0));
    });
  }
  let serviceHost = null;
  const notifyChange = (pendingCount) => {
    if (!serviceHost) serviceHost = createServiceHost({ env: process.env });
    void serviceHost.emit("kanban-agent-change", { pendingCount }).catch(() => void 0);
  };
  return { token: agentToken, store, notifyChange };
};
var agent = null;
if (dataDir) {
  try {
    agent = await createAgentChannel(dataDir, port);
  } catch (error) {
    console.error("Agent channel disabled:", error instanceof Error ? error.message : error);
  }
}
var git = (directory, args) => new Promise((resolve) => {
  execFile("git", ["-C", directory, ...args], {
    timeout: 8e3,
    maxBuffer: 2 * 1024 * 1024,
    env: { ...process.env, GIT_OPTIONAL_LOCKS: "0", GIT_TERMINAL_PROMPT: "0" }
  }, (error, stdout, stderr) => {
    if (!error) {
      resolve({ ok: true, stdout });
      return;
    }
    if ("code" in error && error.code === "ENOENT") {
      resolve({ ok: false, status: 500, error: "git is not installed" });
      return;
    }
    if (/not a git repository/i.test(stderr)) {
      resolve({ ok: false, status: 422, error: "not a git repository" });
      return;
    }
    resolve({ ok: false, status: 500, error: stderr.trim() || error.message });
  });
});
var server = createServiceServer({ token, git, transcriber: createSherpaTranscriber(), agent });
server.listen(port, "127.0.0.1");
