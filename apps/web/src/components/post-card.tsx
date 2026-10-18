import { formatDateKa } from '@tm/shared';
import Link from 'next/link';
import type { PostCard as PostCardData } from '@/server/services/posts';
import { Artwork, type ArtworkVariant } from './site/artwork';

const FALLBACK_ART: ArtworkVariant[] = ['dawn', 'horizon', 'circles', 'mountains', 'heart', 'moon'];

export function PostCard({ post, index = 0 }: { post: PostCardData; index?: number }) {
  return (
    <article className="group">
      <Link href={`/blog/${post.slug}`} className="block focus-visible:outline-none">
        <div className="aspect-[4/3] overflow-hidden rounded-3xl bg-cream-200 ring-saffron-500 ring-offset-4 ring-offset-cream-100 group-focus-visible:ring-2">
          {post.coverImageUrl !== null ? (
            <img
              src={post.coverImageUrl}
              alt=""
              loading="lazy"
              className="size-full object-cover transition duration-700 group-hover:scale-[1.03]"
            />
          ) : (
            <Artwork
              variant={FALLBACK_ART[index % FALLBACK_ART.length]!}
              className="size-full transition duration-700 group-hover:scale-[1.03]"
            />
          )}
        </div>
        <div className="mt-5 flex items-center gap-3 text-xs text-plum-400">
          {post.publishedAt !== null ? <time dateTime={post.publishedAt.toISOString()}>{formatDateKa(post.publishedAt)}</time> : null}
          <span aria-hidden="true">·</span>
          <span>{post.readingMinutes} წთ საკითხავი</span>
        </div>
        <h3 className="mt-2 text-xl leading-snug font-normal text-plum-800 transition group-hover:text-plum-500">{post.title}</h3>
        <p className="mt-2 line-clamp-3 text-[15px] leading-7 text-plum-500">{post.excerpt}</p>
      </Link>
    </article>
  );
}
