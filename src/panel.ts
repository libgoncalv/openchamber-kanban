import { connectHost } from '@openchamber/sdk';
import { applyHostReady } from '@openchamber/sdk/ui';
import { mountKanbanMirror } from './panelMirror.ts';

/**
 * The fixed-width rail entry: one mirror for the frame's whole lifetime (the
 * logic lives in `panelMirror.ts`, where the adaptive frame entry mounts the
 * same factory). The shipped manifest points the panel at `panel/frame.html`
 * (`src/frame.ts`), which swaps between this mirror and the interactive
 * board by width and device; this entry and its `panel/index.html` stay as
 * the single-surface shell the mirror code was built for.
 */
const host = connectHost();
const root = document.querySelector('#root');
if (!root) throw new Error('Missing #root');

let mounted: { dispose: () => void } | null = null;
host.onReady((ctx) => {
  applyHostReady(ctx, document.documentElement);
  if (mounted) return;
  mounted = mountKanbanMirror(host, root, { directory: ctx.directory });
});

window.addEventListener('pagehide', () => {
  mounted?.dispose();
  host.dispose();
});
