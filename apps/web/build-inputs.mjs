import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

/** Refuse Next's automatic copying of loaded runtime environment files. */
export function assertSafeBuildInputs(directory) {
  for (const name of readdirSync(directory)) {
    if (!/^\.env(?:\.|$)/i.test(name)) continue;
    if (name === '.env.packaging-canary' &&
        readFileSync(path.join(directory, name), 'utf8') === 'F01_CANARY=LEARNTM_PRIVATE_CANARY_DO_NOT_SHIP\n') continue;
    throw new Error('Production builds require an isolated workspace without runtime .env files. Use scripts/release/prepare-build.mjs.');
  }
}
