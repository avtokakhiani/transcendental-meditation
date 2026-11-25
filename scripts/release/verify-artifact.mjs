import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { lstat, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { parseEnv } from 'node:util';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';

const forbiddenName = /(^|\/)(?:\.env(?:[^/]*)?|private|backups?|erasures|logs|\.git|\.github|coverage)(\/|$)|\.(?:bak|enc|pem|key|pfx|p12|log|jsonl|tsbuildinfo)$/i;
const firstPartyTools = /^(?:apps\/web\/(?:src|content|tests?|scripts|docs)|packages\/|docs\/|scripts\/|output\/|.*\.next\/(?:cache|build|dev|article-tests|dev-recovery-[^/]+))(\/|$)/;
const runtimeRoot = /^(?:package\.json|node_modules\/|apps\/web\/(?:server\.js$|package\.json$|\.next\/|public\/|node_modules\/))/;
// Webpack retains this workspace identity for Next's package resolution. No
// workspace source, test, configuration or arbitrary sibling metadata is allowed.
const workspaceManifest = 'packages/shared/package.json';
const workspaceParents = new Set(['packages', 'packages/shared']);
const signatures = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----(?:\r?\n|\\n)[A-Za-z0-9+/=]{32,}/,
  /\bAKIA[A-Z0-9]{16}\b/, /\bgh[pousr]_[A-Za-z0-9]{30,}\b/,
  /\bsk-proj-[A-Za-z0-9_-]{20,}/, /\bre_[A-Za-z0-9]{24,}/,
  /LEARNTM_PRIVATE_CANARY_DO_NOT_SHIP/,
];

export function normalizedEntry(name) {
  const clean = name.replaceAll('\\', '/').replace(/^(?:\.\/)+/, '');
  assert(clean && !clean.startsWith('/') && !/^[a-z]:/i.test(clean), 'Artifact contains an absolute entry');
  assert(!clean.split('/').some(part => part === '..' || part === ''), 'Artifact contains an unsafe entry');
  return clean;
}

function checkFile(name, data, secrets, findings, inventory) {
  const entry = normalizedEntry(name);
  if (entry === workspaceManifest) {
    try { if (JSON.parse(data.toString('utf8')).name !== '@tm/shared') findings.add('unexpected-workspace-manifest'); }
    catch { findings.add('invalid-workspace-manifest'); }
  } else if (forbiddenName.test(entry) || firstPartyTools.test(entry) || !runtimeRoot.test(entry)) findings.add('forbidden-path');
  // Scan binary assets as bytes too; a renamed backup/key must not bypass the check.
  const text = data.toString('latin1');
  if (signatures.some(pattern => pattern.test(text)) || data.subarray(0, 5).toString() === 'LTMB1') findings.add('sensitive-content');
  if (secrets.some(secret => data.includes(secret))) findings.add('known-secret-content');
  inventory.push({ path: entry, bytes: data.length, sha256: createHash('sha256').update(data).digest('hex') });
}

export async function verifyDirectory(directory, { secrets = [] } = {}) {
  const findings = new Set(), inventory = [];
  async function visit(folder) {
    for (const entry of await readdir(folder)) {
      const full = path.join(folder, entry), details = await lstat(full);
      if (details.isSymbolicLink()) { findings.add('symlink'); continue; }
      if (details.isDirectory()) {
        const entryPath = normalizedEntry(path.relative(directory, full));
        if (forbiddenName.test(entryPath) || (!workspaceParents.has(entryPath) && firstPartyTools.test(entryPath))) findings.add('forbidden-path');
        await visit(full);
      }
      else if (details.isFile()) checkFile(path.relative(directory, full), await readFile(full), secrets, findings, inventory);
      else findings.add('special-file');
    }
  }
  await visit(directory);
  return finish(findings, inventory);
}

function finish(findings, inventory) {
  const names = new Set(inventory.map(file => file.path));
  for (const required of ['apps/web/server.js', 'apps/web/.next/BUILD_ID', 'apps/web/package.json']) {
    if (!names.has(required)) findings.add('missing-runtime-file');
  }
  return { passed: findings.size === 0, findings: [...findings].sort(), files: inventory.length,
    bytes: inventory.reduce((sum, file) => sum + file.bytes, 0), inventory: inventory.sort((a, b) => a.path.localeCompare(b.path)) };
}

/** Inspect tar bytes without extraction, including paths, link types and contents. */
export async function verifyArchive(archive, { secrets = [] } = {}) {
  const packed = await readFile(archive);
  const tar = gunzipSync(packed, { maxOutputLength: 1024 * 1024 * 1024 });
  const findings = new Set(), inventory = [], seen = new Set();
  let offset = 0;
  while (offset + 512 <= tar.length) {
    const header = tar.subarray(offset, offset + 512);
    if (header.every(byte => byte === 0)) break;
    const field = (start, length) => header.subarray(start, start + length).toString().replace(/\0.*$/s, '');
    const expected = Number.parseInt(field(148, 8).trim(), 8);
    const sum = header.reduce((total, byte, index) => total + (index >= 148 && index < 156 ? 32 : byte), 0);
    assert.equal(sum, expected, 'Invalid tar checksum');
    const name = (field(345, 155) ? `${field(345, 155)}/` : '') + field(0, 100);
    const size = Number.parseInt(field(124, 12).trim() || '0', 8);
    assert(Number.isSafeInteger(size) && size >= 0 && offset + 512 + size <= tar.length, 'Invalid tar entry length');
    const type = field(156, 1);
    if (type === '5') {
      if (name !== './' && name !== '.') {
        const entry = normalizedEntry(name.replace(/\/$/, ''));
        if (forbiddenName.test(entry) || (!workspaceParents.has(entry) && firstPartyTools.test(entry))) findings.add('forbidden-path');
      }
    } else if (type === '' || type === '0') {
      const normalized = normalizedEntry(name);
      if (seen.has(normalized)) findings.add('duplicate-entry');
      seen.add(normalized);
      checkFile(normalized, tar.subarray(offset + 512, offset + 512 + size), secrets, findings, inventory);
    } else {
      // Release archives use USTAR: reject links, PAX overrides and special files.
      findings.add('unsupported-or-link-entry');
    }
    offset += 512 + Math.ceil(size / 512) * 512;
  }
  const result = finish(findings, inventory);
  return { ...result, archiveSha256: createHash('sha256').update(packed).digest('hex') };
}

async function knownSecrets(file) {
  if (!file) return [];
  const values = parseEnv(await readFile(file, 'utf8'));
  const secrets = Object.entries(values).filter(([key, value]) => /SECRET|PASSWORD|API_KEY|BACKUP_KEY|CONNECTION_STRING|DATABASE_URL/.test(key) && value.length >= 8).map(([, value]) => value);
  for (const value of [...secrets]) {
    const password = /(?:^|;)password=([^;]+)/i.exec(value)?.[1];
    if (password?.length >= 8) secrets.push(password);
  }
  return [...new Set(secrets)].map(value => globalThis.Buffer.from(value));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2), get = name => args[args.indexOf(name) + 1];
  assert(args.includes('--directory') !== args.includes('--archive'), 'Specify exactly one --directory or --archive');
  const options = { secrets: await knownSecrets(args.includes('--secrets-env-file') ? get('--secrets-env-file') : undefined) };
  const result = args.includes('--directory') ? await verifyDirectory(path.resolve(get('--directory')), options) : await verifyArchive(path.resolve(get('--archive')), options);
  if (args.includes('--report')) await writeFile(get('--report'), JSON.stringify(result, null, 2) + '\n');
  // Never print matched values or file contents, including on rejection.
  process.stdout.write(JSON.stringify({ passed: result.passed, findings: result.findings, files: result.files, bytes: result.bytes, archiveSha256: result.archiveSha256 }) + '\n');
  if (!result.passed) process.exitCode = 1;
}
