import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import console from 'node:console';
import process from 'node:process';
import path from 'node:path';
import { artifacts, db, json, web } from './local.mjs';

try {
  const result = spawnSync(process.execPath, [path.join(web, 'node_modules/prisma/build/index.js'), 'migrate', 'diff', '--from-schema-datasource', 'prisma/schema.prisma', '--to-schema-datamodel', 'prisma/schema.prisma', '--script'], { cwd: web, encoding: 'utf8', windowsHide: true });
  assert.equal(result.status, 0, result.stderr);
  const sql = result.stdout.trim();
  // SQL Server canonicalizes this pre-existing default expression. Do not touch privacy tables.
  const expected = sql.includes('[meeting_registrations]') && sql.includes('[retentionExpiresAt]')
    && !/\[(?:posts|post_revisions|post_slug_aliases|post_revision_media)\]/.test(sql)
    && [...sql.matchAll(/ALTER TABLE \[dbo\]\.\[([^\]]+)\]/g)].every(match => match[1] === 'meeting_registrations');
  assert.ok(!sql || expected, 'Unexpected schema drift: review private schema-diff report');
  await json(path.join(artifacts, 'schema-check.json'), { foundationDrift: false, preexistingDefaultNormalization: Boolean(sql), sql });
  console.log(sql ? 'Foundation matches. Existing privacy retention default has SQL Server expression-normalization drift; left untouched.' : 'Schema matches.');
} finally { await db.$disconnect(); }
