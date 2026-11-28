import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import process from 'node:process';

assert(process.argv[2], 'Usage: verify-native-runtime.mjs <assembled-release-directory>');
const root = path.resolve(process.argv[2]);
const generated = path.join(root, 'apps/web/.next/node_modules/.prisma/client');
assert((await readdir(generated)).some(name => /^(?:lib)?query_engine.*\.(?:dll|so|dylib)\.node$/.test(name)), 'Packaged native Prisma engine missing');
const require = createRequire(path.join(root, 'apps/web/package.json'));
const { PrismaClient } = require(path.join(root, 'apps/web/.next/node_modules/@prisma/client'));
// Never use DATABASE_URL or a configured database for this binary/linker check.
const client = new PrismaClient({
  datasourceUrl: 'sqlserver://127.0.0.1:1;database=synthetic;user=synthetic;password=synthetic;encrypt=true;trustServerCertificate=true;connectTimeout=1',
  log: [],
});
let failureCode;
try { await client.$connect(); }
catch (error) { failureCode = error.code ?? error.errorCode; }
finally { await client.$disconnect(); }
assert.equal(failureCode, 'P1001', 'Packaged native engine did not reach the expected synthetic connection failure');
process.stdout.write('Native Prisma engine loaded; unreachable synthetic SQL rejected as expected. No configured database used.\n');
