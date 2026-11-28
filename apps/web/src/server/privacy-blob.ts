import { randomUUID } from 'node:crypto';
import { BlobNotFoundError, del, get, head, list, put } from '@vercel/blob';
import { PRIVACY_LOG_DAYS } from '@/lib/privacy-retention';
import type { ErasureEntry } from './privacy-files';

/**
 * Durable privacy storage for hosts without a persistent disk (Vercel). Same contract as the
 * filesystem ledger in privacy-files.ts: minimal JSON entries, validated on read, and production
 * refuses to start against a store that was never provisioned rather than silently using an
 * empty ledger. The store is private and separate from the database, so a database restore
 * cannot roll the ledger back.
 */
export function privacyBlobEnabled() {
  return process.env.PRIVACY_STORAGE_BACKEND === 'vercel-blob';
}

const ERASURES = 'privacy/erasures/';
const LOGS = 'privacy/logs/';
/** Written once by an operator (scripts/privacy-provision-blob.ts), never by the app itself. */
export const PROVISIONED_MARKER = `${ERASURES}.provisioned`;
const ENTRY_NAME = /^(registration|corporate)-[a-f\d-]{36}\.json$/i;

function validEntry(entry: ErasureEntry, label: string): ErasureEntry {
  if (!['registration', 'corporate'].includes(entry.scope) || !/^[a-f\d-]{36}$/i.test(entry.targetId) || !Number.isFinite(Date.parse(entry.deletedAt))) throw new Error(`Invalid ${label}`);
  if (entry.externalEmailIds !== undefined && (!Array.isArray(entry.externalEmailIds) || entry.externalEmailIds.length > 2 || !entry.externalEmailIds.every((id: unknown) => typeof id === 'string' && /^[\w-]{1,100}$/.test(id)))) throw new Error(`Invalid ${label} receipts`);
  return entry;
}

async function readJson(pathname: string): Promise<unknown | null> {
  const result = await get(pathname, { access: 'private', useCache: false });
  if (result === null || result.statusCode !== 200) return null;
  return JSON.parse(await new Response(result.stream).text());
}

async function listAll(prefix: string) {
  const blobs: { pathname: string }[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix, cursor, limit: 1000 });
    blobs.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return blobs;
}

async function assertProvisioned() {
  try { await head(PROVISIONED_MARKER); }
  catch (error) {
    if (error instanceof BlobNotFoundError) throw new Error('Production erasure ledger requires its provisioned private store');
    throw error;
  }
}

export async function blobAppendErasure(entry: ErasureEntry) {
  const pathname = `${ERASURES}${entry.scope}-${entry.targetId}.json`;
  const write = (value: ErasureEntry, allowOverwrite: boolean) =>
    put(pathname, JSON.stringify(value), { access: 'private', contentType: 'application/json', addRandomSuffix: false, allowOverwrite });

  const current = await readJson(pathname);
  if (current === null) {
    try { await write(entry, false); return; }
    catch { /* A concurrent writer created it first; merge with theirs below. */ }
  }
  const existing = validEntry((current ?? await readJson(pathname)) as ErasureEntry, 'existing erasure journal');
  if (existing.scope !== entry.scope || existing.targetId !== entry.targetId) throw new Error('Invalid existing erasure journal');
  // Preserve receipt IDs acquired before a later retry without resetting the original expiry.
  const ids = [...new Set([...(existing.externalEmailIds || []), ...(entry.externalEmailIds || [])])];
  if (ids.length > 2) throw new Error('Erasure receipt history requires operator review');
  if (ids.length > (existing.externalEmailIds?.length || 0)) await write({ ...existing, externalEmailIds: ids }, true);
}

export async function blobReadErasureLedger(): Promise<ErasureEntry[]> {
  if (process.env.NODE_ENV === 'production') await assertProvisioned();
  const entries: ErasureEntry[] = [];
  for (const blob of await listAll(ERASURES)) {
    const name = blob.pathname.slice(ERASURES.length);
    if (!ENTRY_NAME.test(name)) continue;
    const entry = await readJson(blob.pathname);
    if (entry !== null) entries.push(validEntry(entry as ErasureEntry, 'erasure ledger'));
  }
  return entries;
}

export async function blobPrunePrivacyFiles(now = new Date()) {
  const cutoff = now.getTime() - PRIVACY_LOG_DAYS * 86400000;
  const expiredLogs = (await listAll(LOGS))
    .filter(blob => {
      const day = blob.pathname.slice(LOGS.length).match(/^learntm-(\d{4}-\d{2}-\d{2})\//)?.[1];
      return day !== undefined && Date.parse(`${day}T00:00:00Z`) <= cutoff;
    })
    .map(blob => blob.pathname);
  // Keep the deletion ledger longer than the entire backup cycle, but at most 90 days.
  const entries = await blobReadErasureLedger();
  const expiredEntries = entries
    .filter(entry => Date.parse(entry.deletedAt) <= cutoff)
    .map(entry => `${ERASURES}${entry.scope}-${entry.targetId}.json`);
  const expired = [...expiredLogs, ...expiredEntries];
  for (let i = 0; i < expired.length; i += 100) await del(expired.slice(i, i + 100));
  return { activeErasureEntries: entries.length };
}

/** Blob storage has no append, so each event is its own small object grouped by UTC day. */
export async function blobPrivacyLog(record: Record<string, unknown>, now: Date) {
  const pathname = `${LOGS}learntm-${now.toISOString().slice(0, 10)}/${now.getTime()}-${randomUUID()}.json`;
  await put(pathname, JSON.stringify(record), { access: 'private', contentType: 'application/json', addRandomSuffix: false });
}
