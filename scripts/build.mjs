import { build } from 'esbuild';

const browserEntries = [
  ['src/page.ts', 'panel/page.js'],
  ['src/panel.ts', 'panel/main.js'],
];

for (const [entry, outfile] of browserEntries) {
  await build({
    entryPoints: [entry],
    outfile,
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: 'es2022',
    minify: true,
    legalComments: 'none',
    logLevel: 'warning',
  });
}

// The local git-branch + dictation service runs under the app's own Node
// runtime, not a browser sandbox — same `--node` settings the SDK's own
// bundler uses for a service entry (ESM, Node platform, Node built-ins left
// as plain imports rather than bundled, unminified for readability since it's
// not shipped to a browser). `sherpa-onnx-node` stays external too: it loads
// a native .node binding (and platform shared libraries) at runtime through
// its own package, which esbuild cannot bundle — the bare import resolves
// from this package's node_modules (the platform package
// sherpa-onnx-linux-x64 carries the libshera binaries and the binding).
await build({
  entryPoints: ['src/service/main.ts'],
  outfile: 'service/main.js',
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node18',
  minify: false,
  external: ['sherpa-onnx-node'],
  legalComments: 'none',
  logLevel: 'warning',
});

console.log(`built ${browserEntries.map(([, out]) => out).join(', ')}, service/main.js`);
