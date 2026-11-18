// Installs the Kanban agent skill into OpenCode's global skills dir, so every
// OpenCode session (OpenChamber's included) sees it: `node scripts/install-skill.mjs`.
// Overwrites in place — re-run after updating the skill in this repo.
import { cp, mkdir } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoSkill = join(dirname(fileURLToPath(import.meta.url)), '..', 'skill', 'kanban');
const target = join(homedir(), '.config', 'opencode', 'skills', 'kanban');
await mkdir(dirname(target), { recursive: true });
await cp(repoSkill, target, { recursive: true });
console.log(`Installed the agent skill: ${target}`);
console.log('Sessions pick it up on their next start; /reload forces it in an open one.');
