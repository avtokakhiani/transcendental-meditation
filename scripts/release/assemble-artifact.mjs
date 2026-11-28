import assert from 'node:assert/strict';
import { cp, mkdir, readFile, readdir, realpath, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { verifyDirectory } from './verify-artifact.mjs';
import { findInstalledPackage, materializeDependencies, validateDependencyClosure } from './runtime-dependencies.mjs';

const [webArgument, outputArgument, distArgument = '.next'] = process.argv.slice(2);
assert(webArgument && outputArgument, 'Usage: assemble-artifact.mjs <isolated-web-directory> <new-output-directory> [distDir]');
const web = path.resolve(webArgument), output = path.resolve(outputArgument), dist = path.resolve(web, distArgument);
const inside = (parent, child) => { const relative = path.relative(parent, child); return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative)); };
assert(!inside(dist, output) && !inside(output, dist), 'Artifact destination must be separate from build output');
assert(!(await readdir(web)).some(name => /^\.env(?:\.|$)/.test(name) && name !== '.env.packaging-canary'), 'Refusing to package a workspace containing runtime environment files');
const rawResult = await verifyDirectory(path.join(dist, 'standalone'));
assert(rawResult.findings.every(finding => finding === 'symlink'), `Traced output rejected: ${rawResult.findings.join(', ')}`);
process.stdout.write('Traced output passed private-file and content checks.\n');
await mkdir(output); // No reuse of a contaminated or previous release.
await cp(path.join(dist, 'standalone'), output, { recursive: true, dereference: true });
process.stdout.write('Standalone runtime copied.\n');
await mkdir(path.join(output, 'apps/web/.next'), { recursive: true });
await cp(path.join(dist, 'static'), path.join(output, 'apps/web/.next/static'), { recursive: true, dereference: true });
await cp(path.join(web, 'public'), path.join(output, 'apps/web/public'), { recursive: true, dereference: true });

// Match the existing Azure materialization requirement, using declared Next runtime
// dependencies only (not every sibling package or arbitrary builder file).
const nextDirectory = await realpath(path.join(web, 'node_modules/next'));
const moduleRoot = path.resolve(web, '../../node_modules');
const nextManifest = JSON.parse(await readFile(path.join(nextDirectory, 'package.json'), 'utf8'));
for (const dependency of Object.keys(nextManifest.dependencies || {})) {
  const source = await realpath(path.join(nextDirectory, '../', dependency));
  await mkdir(path.dirname(path.join(output, 'apps/web/node_modules', dependency)), { recursive: true });
  await cp(source, path.join(output, 'apps/web/node_modules', dependency), { recursive: true, dereference: true });
  await materializeDependencies(source, path.join(output, 'apps/web/node_modules', dependency), moduleRoot);
}
const prismaClient = await realpath(path.join(web, 'node_modules/@prisma/client'));
const prismaTarget = path.join(output, 'apps/web/.next/node_modules');
await mkdir(path.join(prismaTarget, '@prisma'), { recursive: true });
await cp(prismaClient, path.join(prismaTarget, '@prisma/client'), { recursive: true, dereference: true });
await cp(path.resolve(prismaClient, '../../.prisma'), path.join(prismaTarget, '.prisma'), { recursive: true, dereference: true });
// Turbopack also emits mangled native externals under .next/node_modules. Their
// package manifests identify the exact installed version; preserve those wrappers
// and materialize dependencies beside each wrapper rather than guessing globals.
async function externalPackages(folder) {
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === '.prisma') continue;
    const destination = path.join(folder, entry.name);
    if (entry.name.startsWith('@')) { await externalPackages(destination); continue; }
    let manifest;
    try { manifest = JSON.parse(await readFile(path.join(destination, 'package.json'), 'utf8')); }
    catch (error) { if (error.code === 'ENOENT') continue; throw error; }
    const source = await findInstalledPackage(manifest.name, manifest.version, moduleRoot);
    await materializeDependencies(source, destination, moduleRoot);
    await validateDependencyClosure(destination, output);
  }
}
await externalPackages(prismaTarget);
await validateDependencyClosure(path.join(output, 'apps/web/node_modules/next'), output);
process.stdout.write('Complete runtime dependency closures materialized.\n');
const result = await verifyDirectory(output);
assert(result.passed, `Artifact rejected: ${result.findings.join(', ')}`);
await writeFile(`${output}.manifest.json`, JSON.stringify(result, null, 2) + '\n');
process.stdout.write('Standalone release assembled and verified; manifest stored outside the release.\n');
