import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { PostCard } from '@/components/post-card';
import type { PostCard as PostCardData } from '@/server/services/posts';

export function LatestPosts({ posts }: { posts: PostCardData[] }) {
  if (posts.length === 0) return null;

  return (
    <section aria-labelledby="latest-posts-heading" className="bg-cream-100 py-12 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <h2 id="latest-posts-heading" className="text-2xl leading-relaxed font-light text-plum-800 sm:text-3xl">
            ბოლო სტატიები
          </h2>
          <Link href="/blog" className="inline-flex min-h-11 items-center gap-2 rounded-sm text-[15px] text-plum-700 hover:text-plum-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-plum-700">
            ყველა სტატია
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>

        <div className="mt-7 grid gap-x-8 gap-y-0 sm:mt-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.slice(0, 3).map((post, index) => (
            <PostCard key={post.id} post={post} index={index} variant="latest" />
          ))}
        </div>
      </div>
    </section>
  );
}
