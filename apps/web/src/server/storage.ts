import { del, get, put } from '@vercel/blob';

/** Formats browsers render natively; anything else is rejected outright. */
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

const EXTENSIONS: Record<(typeof ALLOWED_IMAGE_TYPES)[number], string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export function isAllowedImageType(type: string): type is (typeof ALLOWED_IMAGE_TYPES)[number] {
  return (ALLOWED_IMAGE_TYPES as readonly string[]).includes(type);
}

/** Prefixed by year/month so the store stays browsable in the Vercel dashboard. */
export function buildBlobName(contentType: (typeof ALLOWED_IMAGE_TYPES)[number]): string {
  const now = new Date();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${now.getUTCFullYear()}/${month}/${crypto.randomUUID()}.${EXTENSIONS[contentType]}`;
}

// Private store: everything is served through /api/media so blobs are never publicly addressable.
// Credentials come from the store connected to the Vercel project (OIDC + BLOB_STORE_ID, or
// BLOB_READ_WRITE_TOKEN locally), which the SDK reads itself.

export async function uploadBlob(blobName: string, data: Buffer, contentType: string): Promise<void> {
  await put(blobName, data, { access: 'private', contentType, addRandomSuffix: false });
}

export async function deleteBlob(blobName: string): Promise<void> {
  await del(blobName);
}

export async function downloadBlob(blobName: string): Promise<Buffer | null> {
  const result = await get(blobName, { access: 'private' });
  if (result === null || result.statusCode !== 200) return null;
  return Buffer.from(await new Response(result.stream).arrayBuffer());
}
