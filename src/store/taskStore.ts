import type { HostClient, JsonValue } from '@openchamber/sdk';
import { parseTask, type Task } from '../domain/task.ts';

type Storage = Pick<HostClient, 'storage'>;

export const TASK_KEY_PREFIX = 'task:';
const READ_BATCH = 16;

export const taskKey = (id: string) => `${TASK_KEY_PREFIX}${id}`;

export type LoadResult = { tasks: Task[]; failedKeys: string[] };

/** One record per task, so editing one task can never clobber another. */
export const loadTasks = async (host: Storage): Promise<LoadResult> => {
  const keys = (await host.storage.keys()).filter((key) => key.startsWith(TASK_KEY_PREFIX));
  const tasks: Task[] = [];
  const failedKeys: string[] = [];
  for (let offset = 0; offset < keys.length; offset += READ_BATCH) {
    await Promise.all(keys.slice(offset, offset + READ_BATCH).map(async (key) => {
      try {
        const task = parseTask(await host.storage.get(key));
        if (taskKey(task.id) !== key) throw new Error('Task id does not match its key');
        tasks.push(task);
      } catch {
        failedKeys.push(key);
      }
    }));
  }
  return { tasks, failedKeys };
};

export const saveTask = async (host: Storage, task: Task) => {
  const checked = parseTask(task);
  await host.storage.set(taskKey(checked.id), checked as unknown as JsonValue);
};

export const deleteTask = (host: Storage, id: string) => host.storage.delete(taskKey(id));

/**
 * Retries a critical link-save a few times before giving up. Used only where
 * a session exists for real already — just created (`startSession` succeeded)
 * or deliberately linked — and a transient storage failure (the kind that
 * produced "HOST_REJECTED" once before) must not silently lose the link: the
 * session is real, possibly already in use by an agent or its user, and a
 * lost link would leave it
 * on neither path (not on the task, never adopted either).
 */
export const saveTaskRetrying = async (host: Storage, task: Task, attempts = 3): Promise<void> => {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try { await saveTask(host, task); return; }
    catch (error) {
      if (attempt === attempts) throw error;
      await new Promise((resolve) => setTimeout(resolve, 300 * attempt));
    }
  }
};
