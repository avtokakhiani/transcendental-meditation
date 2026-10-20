import { BenefitTabs } from '@/components/landing/benefit-tabs';
import { BooksShelf } from '@/components/landing/books-shelf';
import { ClosingCta } from '@/components/landing/closing-cta';
import { Hero } from '@/components/landing/hero';
import { LatestPosts } from '@/components/landing/latest-posts';
import { MediaCoverage } from '@/components/landing/media-coverage';
import { prisma } from '@/server/db';
import { getFeaturedBook } from '@/server/services/books';
import { listPublishedPosts } from '@/server/services/posts';

// Content changes from the admin panel must show without a redeploy.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [posts, featuredBook] = await Promise.all([
    listPublishedPosts(prisma, { pageSize: 3 }),
    getFeaturedBook(prisma),
  ]);

  return (
    <>
      <Hero />
      <MediaCoverage />
      <BenefitTabs />
      <LatestPosts posts={posts.items} />
      <BooksShelf featuredBook={featuredBook} />
      <ClosingCta />
    </>
  );
}
