import { formatDateKa } from '@tm/shared';
import Link from 'next/link';
import type { PostCard as PostCardData } from '@/server/services/posts';
import { Artwork, type ArtworkVariant } from './site/artwork';

const FALLBACK_ART: ArtworkVariant[] = ['dawn', 'horizon', 'circles', 'mountains', 'heart', 'moon'];

export function PostCard({ post, index = 0, variant = 'default' }: { post: PostCardData; index?: number; variant?: 'default' | 'latest' }) {
  const latest = variant === 'latest';
  return (
    <article className={latest ? 'group row-span-5 grid min-w-0 grid-rows-subgrid pb-8 last:pb-0 lg:pb-0' : 'group'}>
      <Link
        href={`/blog/${post.slug}`}
        aria-labelledby={latest ? `latest-post-${post.id}` : undefined}
        className={latest ? 'row-span-5 grid min-w-0 grid-rows-subgrid rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-plum-700' : 'block focus-visible:outline-none'}
      >
        <div className={`${latest ? 'aspect-[16/10] rounded-2xl' : 'aspect-[4/3] rounded-3xl'} overflow-hidden bg-cream-200 ring-saffron-500 ring-offset-4 ring-offset-cream-100 group-focus-visible:ring-2`}>
          {post.coverImageUrl !== null ? (
            <img
              src={post.coverImageUrl}
              alt={latest ? post.title : ''}
              loading="lazy"
              className={latest ? 'size-full object-cover object-center' : 'size-full object-cover transition duration-700 group-hover:scale-[1.03]'}
            />
          ) : (
            <Artwork
              variant={FALLBACK_ART[index % FALLBACK_ART.length]!}
              className={latest ? 'size-full' : 'size-full transition duration-700 group-hover:scale-[1.03]'}
            />
          )}
        </div>
        <div className={`${latest ? 'mt-4 flex-wrap gap-x-2 gap-y-1' : 'mt-5 gap-3'} flex items-center text-xs text-plum-400`}>
          {post.publishedAt !== null ? <time dateTime={post.publishedAt.toISOString()}>{formatDateKa(post.publishedAt)}</time> : null}
          <span aria-hidden="true">·</span>
          <span>{post.readingMinutes} წთ საკითხავი</span>
        </div>
        <h3 id={latest ? `latest-post-${post.id}` : undefined} className={`mt-2 text-xl leading-snug font-normal text-plum-800 group-hover:text-plum-500 ${latest ? 'break-words transition-colors' : 'transition'}`}>{post.title}</h3>
        <p className="mt-2 line-clamp-3 text-[15px] leading-7 text-plum-500">{post.excerpt}</p>
        {latest ? (
          <span className="mt-4 inline-flex w-fit items-center gap-2 self-start text-sm leading-6 font-medium text-plum-700 underline decoration-plum-300 underline-offset-4 group-hover:decoration-plum-700 group-focus-within:decoration-plum-700">
            წაიკითხე სრულად <span aria-hidden="true">→</span>
          </span>
        ) : null}
      </Link>
    </article>
  );
}
