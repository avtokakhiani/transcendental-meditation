import assert from 'node:assert/strict';
import { cp, readFile } from 'node:fs/promises';
import path from 'node:path';
import console from 'node:console';
import { artifacts, db, hash, json, web } from './local.mjs';
try {
  assert.equal(path.basename(artifacts), 'phase3-2026-11-24');
  const original = path.join(web, 'private/article-foundation/2026-11-24');
  // Copy approved evidence, never regenerate the before side from changed code.
  await cp(path.join(original, 'before'), path.join(artifacts, 'before'), { recursive: true, force: false });
  await cp(path.join(original, 'inventory.json'), path.join(artifacts, 'inventory.json'), { force: false });
  const reviewed = [
    'src/app/admin/(panel)/posts/[id]/page.tsx', 'src/app/admin/(panel)/posts/actions.ts',
    'src/app/admin/(panel)/posts/new/page.tsx', 'src/components/admin/post-form.tsx',
    'src/app/admin/(panel)/posts/page.tsx',
    'src/components/admin/rich-text-editor.tsx', 'src/server/services/posts.ts',
  ];
  await json(path.join(artifacts, 'reviewed-source-changes.json'), Object.fromEntries(await Promise.all(reviewed.map(async file => [file, hash(await readFile(path.join(web, file)))]))));
  console.log('Approved original public baseline copied; seven authorized admin/writer changes recorded for source review.');
} finally { await db.$disconnect(); }
