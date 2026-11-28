import { ArrowLeft, ExternalLink, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ConfirmButton } from '@/components/admin/confirm-button';
import { PostForm } from '@/components/admin/post-form';
import { prisma } from '@/server/db';
import { loadArticleEditor } from '@/server/services/article-revisions';
import { listRecentMedia } from '@/server/services/media';
import { isPreservedBody } from '@/lib/articles/preserved';
import { INTRODUCTION_SLUG } from '@/lib/articles/authoring';
import { deletePostAction } from '../actions';

export default async function EditPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const [{ id }, { saved }] = await Promise.all([params, searchParams]);
  const data = await loadArticleEditor(prisma, id).catch(() => null);
  if (data === null) notFound();
  const { post } = data;
  const media = await listRecentMedia(prisma);

  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/admin/posts" className="inline-flex items-center gap-2 text-sm text-plum-500 hover:text-plum-900">
        <ArrowLeft aria-hidden="true" className="size-4" />
        სტატიები
      </Link>
      <div className="mb-8 mt-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-normal text-plum-900">სტატიის რედაქტირება</h1>
        <div className="flex items-center gap-2">
          {post.status === 'published' ? (
            <Link href={`/blog/${post.slug}`} target="_blank" className="inline-flex items-center gap-2 px-3 py-2 text-sm text-plum-600 hover:text-plum-900">
              <ExternalLink aria-hidden="true" className="size-4" />
              ნახვა
            </Link>
          ) : null}
          {post.slug !== INTRODUCTION_SLUG && !isPreservedBody(data.input.body) ? <form action={deletePostAction}>
            <input type="hidden" name="id" value={post.id} />
            <input type="hidden" name="version" value={post.version} />
            <input type="hidden" name="legacyToken" value={data.legacyToken} />
            <ConfirmButton message="წავშალოთ სტატია? ამ მოქმედების დაბრუნება შეუძლებელია.">
              <Trash2 aria-hidden="true" className="size-4" />
              წაშლა
            </ConfirmButton>
          </form> : null}
        </div>
      </div>
      <PostForm key={`${post.version}:${post.updatedAt.toISOString()}`} initial={data.input} context={{ id: post.id, version: post.version,
        legacyToken: data.legacyToken, status: post.status, essential: post.slug === INTRODUCTION_SLUG, aliases: post.slugAliases.map(alias=>alias.slug), protectedPage: post.slug === INTRODUCTION_SLUG && !isPreservedBody(data.input.body),
        diverged: data.diverged, draftRevisionId: post.draftRevisionId, publishedRevisionId: post.publishedRevisionId,
        revisions: post.revisions.map(revision => ({ ...revision, createdAt: revision.createdAt.toISOString() })),
      }} media={media} saved={saved === '1'} />
    </div>
  );
}
