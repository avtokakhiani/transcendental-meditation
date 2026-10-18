import { ArrowLeft, ExternalLink, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ConfirmButton } from '@/components/admin/confirm-button';
import { PostForm } from '@/components/admin/post-form';
import { prisma } from '@/server/db';
import { getPostForEdit } from '@/server/services/posts';
import { deletePostAction } from '../actions';

export default async function EditPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const [{ id }, { saved }] = await Promise.all([params, searchParams]);
  const post = await getPostForEdit(prisma, id).catch(() => null);
  if (post === null) notFound();

  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/admin/posts" className="inline-flex items-center gap-2 text-sm text-plum-500 hover:text-plum-900">
        <ArrowLeft aria-hidden="true" className="size-4" />
        პოსტები
      </Link>
      <div className="mb-8 mt-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-normal text-plum-900">პოსტის რედაქტირება</h1>
        <div className="flex items-center gap-2">
          {post.status === 'published' ? (
            <Link href={`/blog/${post.slug}`} target="_blank" className="inline-flex items-center gap-2 px-3 py-2 text-sm text-plum-600 hover:text-plum-900">
              <ExternalLink aria-hidden="true" className="size-4" />
              ნახვა
            </Link>
          ) : null}
          <form action={deletePostAction}>
            <input type="hidden" name="id" value={post.id} />
            <ConfirmButton message="წავშალოთ პოსტი? ამ მოქმედების დაბრუნება შეუძლებელია.">
              <Trash2 aria-hidden="true" className="size-4" />
              წაშლა
            </ConfirmButton>
          </form>
        </div>
      </div>
      <PostForm key={post.updatedAt.toISOString()} post={post} saved={saved === '1'} />
    </div>
  );
}
