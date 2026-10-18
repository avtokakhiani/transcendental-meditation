import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { PostCard } from '@/components/post-card';
import type { PostCard as PostCardData } from '@/server/services/posts';

export function LatestPosts({ posts }: { posts: PostCardData[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="bg-cream-100 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-plum-500">ბლოგი</p>
            <h2 className="mt-4 text-3xl font-light text-plum-800 sm:text-4xl">
              ახალი <em className="font-serif font-normal italic">ჩანაწერები</em>
            </h2>
          </div>
          <Link href="/blog" className="inline-flex items-center gap-2 text-[15px] text-plum-700 hover:text-plum-500">
            ყველა სტატია
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>

        <div className="mt-12 grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <PostCard key={post.id} post={post} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
