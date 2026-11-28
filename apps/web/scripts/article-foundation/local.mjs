import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { createHash, createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { PrismaClient } from '@prisma/client';

export const web = path.resolve(import.meta.dirname, '../..');
process.loadEnvFile(path.join(web, '.env'));
export const connection = process.env.DATABASE_URL;
assert.ok(/^sqlserver:\/\/(localhost|127\.0\.0\.1):1434;/i.test(connection ?? ''), 'Local Docker SQL Server only');
export const database = /(?:^|;)database=([a-zA-Z0-9_]+)(?:;|$)/.exec(connection)?.[1];
assert.ok(database, 'A simple explicit database name is required');
export const db = new PrismaClient({ log: [] });
export const run = process.env.FOUNDATION_RUN ?? '2026-11-24';
assert.match(run, /^[a-zA-Z0-9_-]+$/);
export const artifacts = path.join(web, 'private/article-foundation', run);
export const hash = value => createHash('sha256').update(value).digest('hex');
function backupKey() {
  const key = Buffer.from(process.env.PRIVACY_BACKUP_KEY ?? '', 'base64');
  assert.equal(key.length, 32, 'Use the existing private backup key from apps/web/.env');
  return key;
}
export function encrypt(data) {
  const iv = randomBytes(12), cipher = createCipheriv('aes-256-gcm', backupKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(data), cipher.final()]);
  return Buffer.concat([Buffer.from('LTMB1'), iv, cipher.getAuthTag(), ciphertext]);
}
export function decrypt(data) {
  assert.equal(data.subarray(0, 5).toString(), 'LTMB1');
  const cipher = createDecipheriv('aes-256-gcm', backupKey(), data.subarray(5, 17));
  cipher.setAuthTag(data.subarray(17, 33));
  return Buffer.concat([cipher.update(data.subarray(33)), cipher.final()]);
}
export async function readProtected(file) {
  let bytes;
  try { bytes = await readFile(file); }
  catch (error) { if (error.code !== 'ENOENT') throw error; bytes = await readFile(`${file}.enc`); }
  return bytes.subarray(0, 5).toString() === 'LTMB1' ? decrypt(bytes) : bytes;
}
export async function json(file, value) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(value, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2) + '\n');
}
export async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? files(path.join(dir, entry.name)) : [path.join(dir, entry.name)]))).flat().sort();
}
// Full records stay in the ignored private directory. Never print their contents.
export async function snapshot(client = db) {
  const result = {};
  const tables = await client.$queryRaw`SELECT name FROM sys.tables WHERE is_ms_shipped = 0 ORDER BY name`;
  for (const { name } of tables) {
    assert.match(name, /^[a-zA-Z0-9_]+$/);
    const rows = await client.$queryRawUnsafe(`SELECT * FROM [dbo].[${name}]`);
    result[name] = rows.map(row => JSON.stringify(row, (_, v) => typeof v === 'bigint' ? v.toString() : v)).sort();
  }
  return result;
}
export async function sourceInventory() {
  const result = {};
  for (const dir of ['src', 'public']) {
    for (const file of await files(path.join(web, dir))) result[path.relative(web, file).replaceAll('\\', '/')] = hash(await readFile(file));
  }
  return result;
}
export async function reviewedSourceChanges() {
  try { return JSON.parse(await readFile(path.join(artifacts, 'reviewed-source-changes.json'), 'utf8')); }
  catch (error) { if (error.code !== 'ENOENT') throw error; return {}; }
}
