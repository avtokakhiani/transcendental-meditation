import { prisma } from '@/server/db';
import { findMedia } from '@/server/services/media';
import { downloadBlob } from '@/server/storage';

/**
 * Public image endpoint. Blobs are immutable (a new upload gets a new id), so responses can be
 * cached for a year by browsers and any CDN placed in front of App Service.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response('Not found', { status: 404 });

  const media = await findMedia(prisma, id);
  if (media === null) return new Response('Not found', { status: 404 });

  const data = await downloadBlob(media.blobName);
  if (data === null) return new Response('Not found', { status: 404 });

  return new Response(new Uint8Array(data), {
    headers: {
      'Content-Type': media.contentType,
      'Content-Length': String(data.byteLength),
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
