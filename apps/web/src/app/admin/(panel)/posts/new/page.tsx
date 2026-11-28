import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { PostForm } from '@/components/admin/post-form';
import { prisma } from '@/server/db';
import { listRecentMedia } from '@/server/services/media';

export default async function NewPostPage() {
  const media = await listRecentMedia(prisma);
  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/admin/posts" className="inline-flex items-center gap-2 text-sm text-plum-500 hover:text-plum-900">
        <ArrowLeft aria-hidden="true" className="size-4" />
        სტატიები
      </Link>
      <h1 className="mb-8 mt-4 text-2xl font-normal text-plum-900">ახალი სტატია</h1>
      <PostForm media={media} />
    </div>
  );
}
