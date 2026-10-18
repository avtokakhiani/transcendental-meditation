import { prisma } from '@/server/db';
import { MediaLibrary } from '@/components/admin/media-library';
import { listRecentMedia } from '@/server/services/media';

export default async function MediaPage() {
  const items = await listRecentMedia(prisma);

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-normal text-plum-900">მედია</h1>
      <p className="mt-2 text-sm text-plum-500">ატვირთეთ სურათი და დააკოპირეთ ბმული ტექსტში ჩასასმელად.</p>
      <MediaLibrary items={items.map((item) => ({ ...item, createdAt: item.createdAt.toISOString() }))} />
    </div>
  );
}
