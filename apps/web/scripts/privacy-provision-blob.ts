/**
 * One-time operator step: marks the private Vercel Blob store as the provisioned erasure ledger.
 * Production refuses to start without this marker so a missing or swapped store is never mistaken
 * for an empty ledger. Run with the production BLOB_READ_WRITE_TOKEN in the environment:
 *   pnpm exec tsx scripts/privacy-provision-blob.ts
 */
import { BlobNotFoundError, head, put } from '@vercel/blob';
import { PROVISIONED_MARKER } from '../src/server/privacy-blob';

async function main() {
  try {
    const existing = await head(PROVISIONED_MARKER);
    console.log(`Already provisioned at ${existing.uploadedAt.toISOString()}; nothing changed.`);
  } catch (error) {
    if (!(error instanceof BlobNotFoundError)) throw error;
    await put(PROVISIONED_MARKER, JSON.stringify({ provisionedAt: new Date().toISOString() }), {
      access: 'private', contentType: 'application/json', addRandomSuffix: false, allowOverwrite: false,
    });
    console.log('Provisioned the privacy erasure ledger store.');
  }
}

main().catch(error => { console.error(error); process.exit(1); });
