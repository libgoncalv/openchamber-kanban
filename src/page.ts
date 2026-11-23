import { connectHost } from '@openchamber/sdk';
import { applyHostReady } from '@openchamber/sdk/ui';
import { mountKanbanBoard } from './ui/board.ts';

const host = connectHost();
const root = document.querySelector('#root');
if (!root) throw new Error('Missing #root');

let mounted: { dispose: () => void } | null = null;
// The device the frame is drawn on, refreshed by every re-ready (`device` is
// re-sent with ready when it changes). Holds why the board reads the form
// factor through a getter at start time rather than taking a static value:
// the ready that mounts this page and the one a later rotation re-sends are
// both caught, and the start flow always sees the latest.
const deviceFormFactor = { current: 'desktop' as 'phone' | 'tablet' | 'desktop' };
host.onReady((ctx) => {
  deviceFormFactor.current = ctx.device?.formFactor ?? 'desktop';
  applyHostReady(ctx, document.documentElement);
  if (mounted) return;
  // The mic button only renders when this host actually offers microphone
  // capture (ready.features.microphone); everywhere else — including the
  // native mobile app, which does not load guest capabilities yet — the
  // documented fallback is the OS keyboard's own dictation.
  mounted = mountKanbanBoard(host, root, {
    microphoneSupported: ctx.features?.microphone === true,
    deviceFormFactor: () => deviceFormFactor.current,
  });
});

window.addEventListener('pagehide', () => {
  mounted?.dispose();
  host.dispose();
});
