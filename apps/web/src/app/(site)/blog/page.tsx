import type { Metadata } from 'next';
import { Pagination } from '@/components/pagination';
import { PostCard } from '@/components/post-card';
import { prisma } from '@/server/db';
import { listPublishedPosts } from '@/server/services/posts';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'ბლოგი',
  description: 'სტატიები მედიტაციის, სტრესის, ძილისა და შინაგანი სიმშვიდის შესახებ.',
};

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam ?? '1', 10) || 1);
  const result = await listPublishedPosts(prisma, { page, pageSize: 9 });

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-12 sm:px-6 lg:px-10 lg:pt-20">
      <header className="max-w-2xl">
        <p className="text-[11px] uppercase tracking-[0.28em] text-plum-500">ბლოგი</p>
        <h1 className="mt-5 text-4xl leading-tight font-light text-plum-800 sm:text-5xl">
          ფიქრები <em className="font-serif font-normal italic">სიმშვიდეზე</em>
        </h1>
        <p className="mt-5 text-[15px] leading-7 text-plum-500">
          პრაქტიკული რჩევები, კვლევების მიმოხილვა და პრაქტიკოსების გამოცდილება.
        </p>
      </header>

      {result.items.length === 0 ? (
        <p className="mt-16 rounded-3xl bg-cream-200 p-10 text-center text-plum-500">სტატიები მალე დაემატება.</p>
      ) : (
        <div className="mt-14 grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {result.items.map((post, index) => (
            <PostCard key={post.id} post={post} index={index} />
          ))}
        </div>
      )}

      <div className="mt-16">
        <Pagination page={result.page} pageSize={result.pageSize} total={result.total} basePath="/blog" />
      </div>
    </div>
  );
}
