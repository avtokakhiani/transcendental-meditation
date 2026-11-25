import assert from 'node:assert/strict';
import { cp, mkdir, readFile, readdir, realpath } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

async function packageDirectory(name, from) {
  assert(/^(@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/i.test(name), 'Unsafe runtime dependency name');
  const require = createRequire(path.join(from, 'package.json'));
  try { return path.dirname(require.resolve(`${name}/package.json`)); }
  catch (error) {
    if (error.code !== 'ERR_PACKAGE_PATH_NOT_EXPORTED') throw error;
    let current = path.dirname(require.resolve(name));
    for (;;) {
      try { if (JSON.parse(await readFile(path.join(current, 'package.json'), 'utf8')).name) return current; }
      catch (failure) { if (failure.code !== 'ENOENT') throw failure; }
      const parent = path.dirname(current);
      assert(parent !== current, 'Runtime dependency package metadata missing');
      current = parent;
    }
  }
}

/** Keep each dependency's own versions; copying only direct pnpm siblings loses transitive modules. */
export async function materializeDependencies(source, target, moduleRoot, ancestors = new Set()) {
  const actual = await realpath(source), actualRoot = await realpath(moduleRoot);
  const relative = path.relative(actualRoot, actual);
  assert(relative && !relative.startsWith('..') && !path.isAbsolute(relative), 'Runtime dependencies must come from the isolated node_modules tree');
  if (ancestors.has(actual)) return;
  const chain = new Set([...ancestors, actual]);
  const manifest = JSON.parse(await readFile(path.join(actual, 'package.json'), 'utf8'));
  for (const dependency of Object.keys({ ...manifest.dependencies, ...manifest.optionalDependencies })) {
    let resolved;
    try { resolved = await realpath(await packageDirectory(dependency, actual)); }
    catch (error) {
      if (Object.hasOwn(manifest.optionalDependencies || {}, dependency) && error.code === 'MODULE_NOT_FOUND') continue;
      throw error;
    }
    if (chain.has(resolved)) continue; // Node resolves the same ancestor from its parent node_modules.
    const dependencyRelative = path.relative(actualRoot, resolved);
    assert(dependencyRelative && !dependencyRelative.startsWith('..') && !path.isAbsolute(dependencyRelative), 'Runtime dependency escapes isolated node_modules');
    const destination = path.join(target, 'node_modules', dependency);
    await mkdir(path.dirname(destination), { recursive: true });
    await cp(resolved, destination, { recursive: true, dereference: true,
      filter: async candidate => {
        if (candidate === path.join(resolved, 'node_modules')) return false;
        const relative = path.relative(actualRoot, await realpath(candidate));
        assert(relative && !relative.startsWith('..') && !path.isAbsolute(relative), 'Runtime dependency file escapes isolated node_modules');
        return true;
      } });
    await materializeDependencies(resolved, destination, actualRoot, chain);
  }
}

export async function findInstalledPackage(name, version, moduleRoot) {
  assert(typeof name === 'string' && /^(@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/i.test(name), 'Unsafe external runtime package name');
  const store = path.join(moduleRoot, '.pnpm');
  for (const entry of await readdir(store, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === 'node_modules') continue;
    const candidate = path.join(store, entry.name, 'node_modules', name);
    try {
      const manifest = JSON.parse(await readFile(path.join(candidate, 'package.json'), 'utf8'));
      if (manifest.name === name && manifest.version === version) return realpath(candidate);
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  throw new Error('Externalized runtime dependency not found in the isolated lockfile installation');
}

export async function validateDependencyClosure(directory, artifactRoot, visited = new Set()) {
  const actual = await realpath(directory), root = await realpath(artifactRoot);
  const relative = path.relative(root, actual);
  assert(relative && !relative.startsWith('..') && !path.isAbsolute(relative), 'Runtime module resolves outside the artifact');
  if (visited.has(actual)) return;
  visited.add(actual);
  const manifest = JSON.parse(await readFile(path.join(actual, 'package.json'), 'utf8'));
  for (const dependency of Object.keys({ ...manifest.dependencies, ...manifest.optionalDependencies })) {
    let resolved;
    try { resolved = await packageDirectory(dependency, actual); }
    catch (error) {
      if (Object.hasOwn(manifest.optionalDependencies || {}, dependency) && error.code === 'MODULE_NOT_FOUND') continue;
      throw error;
    }
    await validateDependencyClosure(resolved, root, visited);
  }
}
