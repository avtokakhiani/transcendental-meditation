import { BenefitTabs } from '@/components/landing/benefit-tabs';
import { BooksShelf } from '@/components/landing/books-shelf';
import { ClosingCta } from '@/components/landing/closing-cta';
import { Hero } from '@/components/landing/hero';
import { LatestPosts } from '@/components/landing/latest-posts';
import { MediaCoverage } from '@/components/landing/media-coverage';
import { getLatestArticles } from '@/content/articles';
import { prisma } from '@/server/db';
import { getFeaturedBook } from '@/server/services/books';

// Content changes from the admin panel must show without a redeploy.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const posts = getLatestArticles().slice(0, 3).map((article) => ({
    id: article.slug,
    slug: article.slug,
    title: article.title,
    excerpt: article.description,
    publishedAt: new Date(article.publishedAt),
    coverImageUrl: article.image?.src ?? null,
    readingMinutes: article.readingMinutes,
  }));
  const featuredBook = await getFeaturedBook(prisma);

  return (
    <>
      <Hero />
      <MediaCoverage />
      <BenefitTabs />
      <LatestPosts posts={posts} />
      <BooksShelf featuredBook={featuredBook} />
      <ClosingCta />
    </>
  );
}
