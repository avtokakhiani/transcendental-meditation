import { Benefits } from '@/components/landing/benefits';
import { BenefitTabs } from '@/components/landing/benefit-tabs';
import { BooksShelf } from '@/components/landing/books-shelf';
import { ClosingCta } from '@/components/landing/closing-cta';
import { Hero } from '@/components/landing/hero';
import { LatestPosts } from '@/components/landing/latest-posts';
import { MediaCoverage } from '@/components/landing/media-coverage';
import { prisma } from '@/server/db';
import { listPublishedBooks } from '@/server/services/books';
import { listPublishedPosts } from '@/server/services/posts';

// Content changes from the admin panel must show without a redeploy.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [posts, books] = await Promise.all([
    listPublishedPosts(prisma, { pageSize: 3 }),
    listPublishedBooks(prisma, 3),
  ]);

  return (
    <>
      <Hero />
      <MediaCoverage />
      <Benefits />
      <BenefitTabs />
      <LatestPosts posts={posts.items} />
      <BooksShelf books={books} />
      <ClosingCta />
    </>
  );
}
