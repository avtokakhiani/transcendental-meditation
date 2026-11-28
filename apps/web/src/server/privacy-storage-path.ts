import { realpathSync } from 'node:fs';
import path from 'node:path';

/** Resolve existing ancestors too, so a symlink cannot put private state in public/release files. */
function physicalPath(value: string): string {
  const missing: string[] = [];
  let current = value;
  for (;;) {
    try { return path.join(realpathSync(current), ...missing); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      const parent = path.dirname(current);
      if (parent === current) throw error;
      missing.unshift(path.basename(current));
      current = parent;
    }
  }
}

function contains(parent: string, child: string): boolean {
  const relative = path.relative(parent, child);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

export function resolvePrivacyStorageDirectory(options: {
  cwd: string; production: boolean; configured?: string;
}): string {
  const configured = options.configured?.trim();
  if (options.production && (!configured || !path.isAbsolute(configured))) {
    throw new Error('Production requires an absolute PRIVACY_STORAGE_DIR outside the release directory');
  }
  // Preserve the existing development ledger/backups. Never silently switch to an empty ledger.
  const directory = path.resolve(options.cwd, configured || 'private');
  const actual = physicalPath(directory);
  if (contains(physicalPath(path.join(options.cwd, 'public')), actual)) {
    throw new Error('Privacy storage cannot be publicly served');
  }
  if (options.production) {
    const releaseRoot = physicalPath(path.resolve(options.cwd, '../..'));
    if (contains(releaseRoot, actual) || contains(actual, releaseRoot)) {
      throw new Error('Production privacy storage must be separate from the release tree');
    }
  }
  return directory;
}
