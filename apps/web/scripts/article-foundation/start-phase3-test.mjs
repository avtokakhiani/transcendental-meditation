import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { connection, db, web } from './local.mjs';

const backup = JSON.parse(await readFile(path.join(web, 'private/article-foundation', process.env.ARTICLE_BACKUP_RUN ?? 'phase3-2026-11-24', 'backup.json'), 'utf8'));
assert.match(backup.restoredDatabase, /^article_foundation_restore_\d+$/);
await db.$disconnect();
const declarationsPath = path.join(web, 'next-env.d.ts');
const originalDeclarations = await readFile(declarationsPath);
const child = spawn(process.execPath, [path.join(web, 'node_modules/next/dist/bin/next'), 'dev', '-p', '31998'], {
  cwd: web, stdio: 'inherit', windowsHide: true,
  env: { ...process.env, ARTICLE_TEST_SERVER: 'true', DATABASE_URL: connection.replace(/database=[^;]+/, `database=${backup.restoredDatabase}`) },
});
child.on('exit', async code => {
  const current = await readFile(declarationsPath, 'utf8');
  if (current.includes('.next/article-tests/')) await writeFile(declarationsPath, originalDeclarations);
  process.exitCode = code ?? 1;
});
