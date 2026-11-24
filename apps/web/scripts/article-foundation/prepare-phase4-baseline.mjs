import { cp, readFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import console from 'node:console';
import { artifacts, db, hash, json, web } from './local.mjs';
try {
  assert.equal(path.basename(artifacts), 'phase4-2026-11-24');
  const original = path.join(web, 'private/article-foundation/2026-11-24');
  await cp(path.join(original, 'before'), path.join(artifacts, 'before'), {recursive: true, force: false});
  await cp(path.join(original, 'inventory.json'), path.join(artifacts, 'inventory.json'), {force: false});
  const previous = JSON.parse(await readFile(path.join(web, 'private/article-foundation/phase3-2026-11-24/reviewed-source-changes.json'), 'utf8'));
  const reviewed = [...Object.keys(previous), 'src/components/site/site-header.tsx'];
  await json(path.join(artifacts, 'reviewed-source-changes.json'), Object.fromEntries(await Promise.all(reviewed.map(async file => [file, hash(await readFile(path.join(web, file)))]))));
  console.log('Approved original baseline retained; 7 prior admin/writer changes and optional preview header prop recorded.');
} finally {await db.$disconnect();}
