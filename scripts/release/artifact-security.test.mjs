import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import { createRequire } from 'node:module';
import path from 'node:path';
import process from 'node:process';
import { test } from 'node:test';
import { gzipSync } from 'node:zlib';
import { normalizedEntry, verifyArchive, verifyDirectory } from './verify-artifact.mjs';
import { buildInputs, prepareBuild } from './prepare-build.mjs';
import { materializeDependencies, validateDependencyClosure } from './runtime-dependencies.mjs';
import { assertSafeBuildInputs } from '../../apps/web/build-inputs.mjs';

test('production build guard refuses runtime environment files and counterfeit canaries', async t => {
  const directory = await fixture(t);
  assert.doesNotThrow(() => assertSafeBuildInputs(directory));
  await put(directory, '.env.production', 'SYNTHETIC=not-a-real-secret');
  assert.throws(() => assertSafeBuildInputs(directory), /isolated workspace/);
  await rm(path.join(directory, '.env.production'));
  await put(directory, '.env.packaging-canary', 'F01_CANARY=LEARNTM_PRIVATE_CANARY_DO_NOT_SHIP\n');
  assert.doesNotThrow(() => assertSafeBuildInputs(directory));
  await put(directory, '.env.packaging-canary', 'unexpected configuration');
  assert.throws(() => assertSafeBuildInputs(directory), /isolated workspace/);
});

async function fixture(t) {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'learntm-artifact-test-'));
  t.after(async () => {
    assert(path.dirname(directory) === path.resolve(os.tmpdir()) && path.basename(directory).startsWith('learntm-artifact-test-'));
    await rm(directory, { recursive: true, force: true });
  });
  return directory;
}
async function put(root, name, bytes = 'synthetic') {
  await mkdir(path.dirname(path.join(root, name)), { recursive: true });
  await writeFile(path.join(root, name), bytes);
}
const runtimeFiles = [['apps/web/server.js', 'server'], ['apps/web/.next/BUILD_ID', 'build'], ['apps/web/package.json', '{}']];
async function runtime(root) { for (const [name, value] of runtimeFiles) await put(root, name, value); }
function tarEntry(name, body = '', type = '0') {
  const data = Buffer.from(body), header = Buffer.alloc(512);
  header.write(name, 0, 100); header.write('0000644\0', 100); header.write('0000000\0', 108); header.write('0000000\0', 116);
  header.write(data.length.toString(8).padStart(11, '0') + '\0', 124); header.write('00000000000\0', 136);
  header.fill(32, 148, 156); header.write(type, 156); header.write('ustar\0', 257); header.write('00', 263);
  const sum = header.reduce((total, byte) => total + byte, 0);
  header.write(sum.toString(8).padStart(6, '0') + '\0 ', 148);
  return Buffer.concat([header, data, Buffer.alloc((512 - data.length % 512) % 512)]);
}
async function archive(root, extra = []) {
  const target = path.join(root, 'release.tar.gz');
  await writeFile(target, gzipSync(Buffer.concat([...runtimeFiles.map(([name, data]) => tarEntry(name, data)), ...extra, Buffer.alloc(1024)])));
  return target;
}

test('accepts an intact minimal runtime and its exact archive', async t => {
  const root = await fixture(t); await runtime(root);
  assert.equal((await verifyDirectory(root)).passed, true);
  assert.equal((await verifyArchive(await archive(root))).passed, true);
});
test('rejects private/env/tooling paths in both output directory and archive', async t => {
  const root = await fixture(t); await runtime(root);
  for (const name of ['apps/web/private/evidence.json', 'apps/web/.env.production', 'apps/web/tests/check.mjs', 'apps/web/public/leaked.bak.enc']) {
    const target = path.join(root, 'case-' + Math.random().toString(16).slice(2)); await mkdir(target); await runtime(target); await put(target, name);
    assert.equal((await verifyDirectory(target)).passed, false);
    assert.equal((await verifyArchive(await archive(root, [tarEntry(name)]))).passed, false);
  }
});
test('rejects sensitive content even renamed as public or compiled assets', async t => {
  const root = await fixture(t); await runtime(root);
  for (const data of ['LEARNTM_PRIVATE_CANARY_DO_NOT_SHIP', 'LTMB1encrypted-backup', '-----BEGIN PRIVATE KEY-----\n' + 'A'.repeat(64)]) {
    const result = await verifyArchive(await archive(root, [tarEntry('apps/web/public/innocent.png', data)]));
    assert.equal(result.passed, false);
  }
  const secret = Buffer.from('synthetic-secret-value-for-negative-test');
  assert.equal((await verifyArchive(await archive(root, [tarEntry('apps/web/.next/server/chunk.js', secret)]), { secrets: [secret] })).passed, false);
});
test('rejects path traversal, duplicate entries and links before extraction', async t => {
  const root = await fixture(t);
  for (const name of ['../escape', '/absolute', 'C:/absolute', 'apps/../escape']) assert.throws(() => normalizedEntry(name));
  await assert.rejects(verifyArchive(await archive(root, [tarEntry('../escape')])));
  assert.equal((await verifyArchive(await archive(root, [tarEntry('apps/web/server.js')]))).passed, false);
  assert.equal((await verifyArchive(await archive(root, [tarEntry('apps/web/public/link', '', '2')]))).passed, false);
});
test('rejects filesystem links and missing runtime files', async t => {
  const root = await fixture(t), target = await fixture(t); await runtime(root);
  await symlink(target, path.join(root, 'apps/web/public-link'), process.platform === 'win32' ? 'junction' : 'dir');
  assert.equal((await verifyDirectory(root)).passed, false);
  assert.equal((await verifyDirectory(target)).passed, false);
});
test('rejects forbidden empty directories as well as files', async t => {
  const root = await fixture(t); await runtime(root);
  await mkdir(path.join(root, 'apps/web/private'));
  assert.equal((await verifyDirectory(root)).passed, false);
  assert.equal((await verifyArchive(await archive(root, [tarEntry('apps/web/private/', '', '5')]))).passed, false);
});
test('permits only the registered workspace identity manifest, without allowing workspace source', async t => {
  const root = await fixture(t);
  assert.equal((await verifyArchive(await archive(root, [tarEntry('packages/shared/package.json', '{"name":"@tm/shared"}')]))).passed, true);
  assert.equal((await verifyArchive(await archive(root, [tarEntry('packages/shared/src/index.ts')]))).passed, false);
  assert.equal((await verifyArchive(await archive(root, [tarEntry('packages/shared/package.json', '{"name":"unexpected"}')]))).passed, false);
});
test('build preparation copies only declared inputs and refuses contaminated destination reuse', async t => {
  const source = await fixture(t), parent = await fixture(t), output = path.join(parent, 'clean-source');
  for (const input of buildInputs) await put(source, input, input === 'pnpm-lock.yaml' ? 'locked' : 'source');
  await put(source, 'apps/web/.env', 'synthetic-private-config'); await put(source, 'apps/web/private/backup.enc');
  await put(source, 'docs/private-evidence.json');
  await prepareBuild(output, source);
  assert.equal(await readFile(path.join(output, 'pnpm-lock.yaml'), 'utf8'), 'locked');
  await assert.rejects(readFile(path.join(output, 'apps/web/.env')));
  await assert.rejects(readFile(path.join(output, 'apps/web/private/backup.enc')));
  await assert.rejects(prepareBuild(output, source));
});
test('materializes nested runtime dependencies, including packages that hide package.json exports', async t => {
  const root = await fixture(t), release = await fixture(t), modules = path.join(root, 'node_modules'), output = path.join(release, 'node_modules/alpha');
  const alpha = { name: 'alpha', version: '1.0.0', dependencies: { beta: '1.0.0' }, optionalDependencies: { absent: '1.0.0' } };
  await put(root, 'node_modules/alpha/package.json', JSON.stringify(alpha));
  await put(root, 'node_modules/beta/package.json', JSON.stringify({ name: 'beta', version: '1.0.0', main: 'index.js', dependencies: { gamma: '1.0.0' } }));
  await put(root, 'node_modules/beta/index.js', 'module.exports = require("gamma")');
  await put(root, 'node_modules/gamma/package.json', JSON.stringify({ name: 'gamma', version: '1.0.0', exports: './index.js' }));
  await put(root, 'node_modules/gamma/index.js', 'module.exports = 42');
  // An incompletely packaged module must not borrow its builder's ancestor tree.
  const leaky = path.join(root, 'untrusted-release/node_modules/alpha');
  await mkdir(leaky, { recursive: true }); await writeFile(path.join(leaky, 'package.json'), JSON.stringify(alpha));
  await assert.rejects(validateDependencyClosure(leaky, path.join(root, 'untrusted-release')), /outside the artifact/);
  await mkdir(output, { recursive: true }); await writeFile(path.join(output, 'package.json'), JSON.stringify(alpha));
  await materializeDependencies(path.join(modules, 'alpha'), output, modules);
  await validateDependencyClosure(output, release);
  assert.equal(createRequire(path.join(output, 'package.json'))('beta'), 42);
  await put(root, 'node_modules/alpha/package.json', JSON.stringify({ ...alpha, dependencies: { constructor: '1.0.0' } }));
  await assert.rejects(materializeDependencies(path.join(modules, 'alpha'), output, modules));
});
