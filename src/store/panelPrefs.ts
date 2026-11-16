import type { HostClient } from '@openchamber/sdk';
import { isStatus, type TaskStatus } from '../domain/task.ts';

type Storage = Pick<HostClient, 'storage'>;

export const PANEL_PREFS_KEY = 'panel-prefs';

export type PanelPrefs = {
  /** Sections folded up in the rail panel. Unknown or duplicate entries are dropped. */
  collapsed: TaskStatus[];
};

export const DEFAULT_PANEL_PREFS: PanelPrefs = { collapsed: ['backlog', 'todo', 'done'] };

export const parsePanelPrefs = (value: unknown): PanelPrefs => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { collapsed: [...DEFAULT_PANEL_PREFS.collapsed] };
  }
  const record = value as Record<string, unknown>;
  if (!Array.isArray(record.collapsed)) return { collapsed: [...DEFAULT_PANEL_PREFS.collapsed] };
  const collapsed = [...new Set(record.collapsed.filter((entry): entry is TaskStatus => isStatus(entry)))];
  return { collapsed };
};

export const loadPanelPrefs = async (host: Storage) => parsePanelPrefs(await host.storage.get(PANEL_PREFS_KEY));

export const savePanelPrefs = (host: Storage, prefs: PanelPrefs) =>
  host.storage.set(PANEL_PREFS_KEY, { collapsed: prefs.collapsed });
