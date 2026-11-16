import { connectHost } from '@openchamber/sdk';
import { applyHostReady } from '@openchamber/sdk/ui';
import { mountKanbanBoard } from './ui/board.ts';

const host = connectHost();
const root = document.querySelector('#root');
if (!root) throw new Error('Missing #root');

let mounted: { dispose: () => void } | null = null;
host.onReady((ctx) => {
  applyHostReady(ctx, document.documentElement);
  if (mounted) return;
  // The mic button only renders when this host actually offers microphone
  // capture (ready.features.microphone); everywhere else — including the
  // native mobile app, which does not load guest capabilities yet — the
  // documented fallback is the OS keyboard's own dictation.
  mounted = mountKanbanBoard(host, root, { microphoneSupported: ctx.features?.microphone === true });
});

window.addEventListener('pagehide', () => {
  mounted?.dispose();
  host.dispose();
});
