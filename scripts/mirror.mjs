// Copy this repo's tracked files into the AI_Games collection (../AI_Games/fragline) and push both.
// `npm run mirror` after committing here; that repo keeps the collection README and the old snapshots.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const HERE = path.resolve(import.meta.dirname, '..');
const MIRROR = path.resolve(HERE, '..', 'AI_Games'), DEST = path.join(MIRROR, 'fragline');
const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();

if (git(HERE, 'status', '--porcelain')) { console.error('commit here first — the working tree is dirty'); process.exit(1); }
if (!fs.existsSync(path.join(MIRROR, '.git'))) { console.error(`no repo at ${MIRROR}`); process.exit(1); }

const files = git(HERE, 'ls-files').split('\n').filter(Boolean);
fs.rmSync(DEST, { recursive: true, force: true }); // drop files that no longer exist here
for (const f of files) {
  const to = path.join(DEST, f);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(path.join(HERE, f), to);
}
git(MIRROR, 'add', '-A', 'fragline');
if (!git(MIRROR, 'status', '--porcelain', 'fragline')) { console.log('mirror already up to date'); process.exit(0); }

const subject = git(HERE, 'log', '-1', '--format=%s');
git(MIRROR, 'commit', '-m', `Zombie Holdout: ${subject[0].toLowerCase()}${subject.slice(1)}\n\nCo-Authored-By: Claude Opus 5 <noreply@anthropic.com>`);
git(MIRROR, 'push', 'origin', 'HEAD');
console.log(`mirrored ${files.length} files and pushed ${git(MIRROR, 'log', '--oneline', '-1')}`);
