// src/service/main.ts
import { execFile } from "node:child_process";

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

// src/service/server.ts
var BODY_MAX = 131072;
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
var createServiceServer = ({ token: token2, git: git2, transcriber }) => {
  const transcribe = createTranscribeRoutes(transcriber);
  return http.createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://127.0.0.1");
    if (url.pathname === "/health") {
      json(res, 200, { ok: true });
      return;
    }
    if (req.headers.authorization !== `Bearer ${token2}`) {
      json(res, 401, { error: "unauthorized" });
      return;
    }
    void (async () => {
      try {
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
var server = createServiceServer({ token, git, transcriber: createSherpaTranscriber() });
server.listen(port, "127.0.0.1");
