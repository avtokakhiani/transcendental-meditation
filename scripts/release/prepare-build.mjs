import assert from 'node:assert/strict';
import { cp, lstat, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const buildInputs = [
  'package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml', 'tsconfig.base.json',
  'apps/web/package.json', 'apps/web/tsconfig.json', 'apps/web/next.config.ts',
  'apps/web/postcss.config.mjs', 'apps/web/prisma.config.ts',
  'apps/web/build-inputs.mjs',
  'apps/web/src', 'apps/web/public', 'apps/web/prisma', 'apps/web/content',
  'packages/shared/package.json', 'packages/shared/tsconfig.json', 'packages/shared/src',
];

/** Harmless markers make a future broad-tracing regression fail the artifact gate. */
export async function seedBuildCanaries(web) {
  for (const name of ['private', 'tests', 'scripts', 'docs']) {
    await mkdir(path.join(web, name), { recursive: true });
    await writeFile(path.join(web, name, 'packaging-canary.txt'), 'LEARNTM_PRIVATE_CANARY_DO_NOT_SHIP', { flag: 'wx' });
  }
  // This is deliberately not a Next-loaded .env filename and contains no secret.
  await writeFile(path.join(web, '.env.packaging-canary'), 'F01_CANARY=LEARNTM_PRIVATE_CANARY_DO_NOT_SHIP\n', { flag: 'wx' });
}

async function verifySourceTree(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    assert(!entry.isSymbolicLink(), 'Build source must not contain symlinks');
    assert(!/^\.env(?:\.|$)|^(?:private|backups|erasures|logs|tests|test)$/i.test(entry.name), 'Forbidden source input');
    if (entry.isDirectory()) await verifySourceTree(path.join(directory, entry.name));
  }
}

export async function prepareBuild(destination, source = root) {
  const target = path.resolve(destination);
  const relative = path.relative(source, target);
  assert(relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative), 'Build workspace must be outside the source repository');
  await mkdir(target); // Refuse reuse: no stale output, environment files or private state.
  for (const input of buildInputs) {
    const from = path.join(source, input);
    const details = await lstat(from);
    assert(!details.isSymbolicLink(), 'Build source must not contain symlinks');
    if (details.isDirectory()) await verifySourceTree(from);
    await cp(from, path.join(target, input), { recursive: true, errorOnExist: true, force: false });
  }
  assert.equal(await readFile(path.join(target, 'pnpm-lock.yaml'), 'utf8'), await readFile(path.join(source, 'pnpm-lock.yaml'), 'utf8'));
  await seedBuildCanaries(path.join(target, 'apps/web'));
  return target;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert(process.argv[2], 'Usage: node scripts/release/prepare-build.mjs <new-external-directory>');
  await prepareBuild(process.argv[2]);
  process.stdout.write('Allowlisted build workspace prepared; no runtime configuration or private state copied.\n');
}
