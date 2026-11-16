// Runs under the app's Node runtime, on 127.0.0.1, only reachable through
// the host proxy (never directly by the sandboxed panel). Two jobs:
// 1. `git for-each-ref` with optional locks off, so it never blocks the
//    user's own git commands, and only for an absolute directory the panel
//    already knows about (one of the registered projects).
// 2. Voice dictation: local sherpa-onnx speech-to-text over /transcribe
//    routes (see server.ts / transcribe.ts) — fully offline, the model is
//    read from the user's config directory, never downloaded.
import { execFile } from 'node:child_process';
import { createServiceServer, type ServiceGit } from './server.ts';
import { createSherpaTranscriber } from './recognizer.ts';

const port = Number(process.env.OPENCHAMBER_SERVICE_PORT);
const token = process.env.OPENCHAMBER_SERVICE_TOKEN ?? '';
if (!port || !token) {
  console.error('OPENCHAMBER_SERVICE_PORT and OPENCHAMBER_SERVICE_TOKEN are required');
  process.exit(1);
}

type GitResult = { ok: true; stdout: string } | { ok: false; status: number; error: string };

const git: ServiceGit = (directory, args) => new Promise((resolve) => {
  execFile('git', ['-C', directory, ...args], {
    timeout: 8_000,
    maxBuffer: 2 * 1024 * 1024,
    env: { ...process.env, GIT_OPTIONAL_LOCKS: '0', GIT_TERMINAL_PROMPT: '0' },
  }, (error, stdout, stderr) => {
    if (!error) { resolve({ ok: true, stdout }); return; }
    if ('code' in error && error.code === 'ENOENT') { resolve({ ok: false, status: 500, error: 'git is not installed' }); return; }
    if (/not a git repository/i.test(stderr)) { resolve({ ok: false, status: 422, error: 'not a git repository' }); return; }
    resolve({ ok: false, status: 500, error: stderr.trim() || error.message });
  });
});

const server = createServiceServer({ token, git, transcriber: createSherpaTranscriber() });
server.listen(port, '127.0.0.1');
