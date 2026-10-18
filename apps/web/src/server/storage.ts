import { BlobServiceClient } from '@azure/storage-blob';
import { env } from '@/env';

/** Formats browsers render natively; anything else is rejected outright. */
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

const EXTENSIONS: Record<(typeof ALLOWED_IMAGE_TYPES)[number], string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

let cachedClient: BlobServiceClient | null = null;
let containerReady = false;

function getClient(): BlobServiceClient {
  if (cachedClient !== null) return cachedClient;

  const connectionString = env.AZURE_STORAGE_CONNECTION_STRING;
  if (connectionString === undefined) {
    // Managed identity would need @azure/identity here; not wired until Azure exists.
    throw new Error('AZURE_STORAGE_CONNECTION_STRING is required for blob access');
  }
  cachedClient = BlobServiceClient.fromConnectionString(connectionString);
  return cachedClient;
}

async function getContainer() {
  const container = getClient().getContainerClient(env.AZURE_STORAGE_CONTAINER);
  // Private even though the images are public: everything is served through /api/media so the
  // storage account never has to allow anonymous access.
  if (!containerReady) {
    await container.createIfNotExists();
    containerReady = true;
  }
  return container;
}

export function isAllowedImageType(type: string): type is (typeof ALLOWED_IMAGE_TYPES)[number] {
  return (ALLOWED_IMAGE_TYPES as readonly string[]).includes(type);
}

/** Prefixed by year/month so the container stays browsable in Azure Storage Explorer. */
export function buildBlobName(contentType: (typeof ALLOWED_IMAGE_TYPES)[number]): string {
  const now = new Date();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${now.getUTCFullYear()}/${month}/${crypto.randomUUID()}.${EXTENSIONS[contentType]}`;
}

export async function uploadBlob(blobName: string, data: Buffer, contentType: string): Promise<void> {
  const container = await getContainer();
  await container.getBlockBlobClient(blobName).uploadData(data, {
    blobHTTPHeaders: { blobContentType: contentType },
  });
}

export async function deleteBlob(blobName: string): Promise<void> {
  const container = await getContainer();
  await container.getBlockBlobClient(blobName).deleteIfExists();
}

export async function downloadBlob(blobName: string): Promise<Buffer | null> {
  const container = await getContainer();
  const blob = container.getBlockBlobClient(blobName);
  if (!(await blob.exists())) return null;
  return blob.downloadToBuffer();
}
