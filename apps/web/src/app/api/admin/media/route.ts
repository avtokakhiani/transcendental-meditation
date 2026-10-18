import { getCurrentUser } from '@/server/auth';
import { prisma } from '@/server/db';
import { recordMedia } from '@/server/services/media';
import { MAX_IMAGE_BYTES, buildBlobName, isAllowedImageType, uploadBlob } from '@/server/storage';

/** Magic bytes, so a renamed non-image cannot be served under an image content type. */
function sniffImageType(data: Buffer): string | null {
  if (data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) return 'image/jpeg';
  if (data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (data.subarray(0, 4).toString('ascii') === 'RIFF' && data.subarray(8, 12).toString('ascii') === 'WEBP') return 'image/webp';
  if (data.subarray(0, 3).toString('ascii') === 'GIF') return 'image/gif';
  return null;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (user === null) return Response.json({ error: 'ავტორიზაცია საჭიროა' }, { status: 401 });

  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return Response.json({ error: 'ფაილი არ არის არჩეული' }, { status: 400 });
  if (file.size > MAX_IMAGE_BYTES) {
    return Response.json({ error: `ფაილი არ უნდა აღემატებოდეს ${MAX_IMAGE_BYTES / 1024 / 1024} MB-ს` }, { status: 400 });
  }

  const data = Buffer.from(await file.arrayBuffer());
  const contentType = sniffImageType(data);
  if (contentType === null || !isAllowedImageType(contentType)) {
    return Response.json({ error: 'დაშვებულია მხოლოდ JPG, PNG, WEBP ან GIF' }, { status: 400 });
  }

  const blobName = buildBlobName(contentType);
  await uploadBlob(blobName, data, contentType);
  const media = await recordMedia(prisma, {
    blobName,
    contentType,
    byteSize: data.byteLength,
    originalName: file.name.slice(0, 260),
    uploadedById: user.id,
  });

  return Response.json(media, { status: 201 });
}
