import type { Article } from './articles';
import type { PostCard } from '@/server/services/posts';

/** The articles listing's catalog is the only source of recommendations. */
export function getRelatedArticles({
  currentSlug,
  catalog,
  now = new Date(),
}: {
  currentSlug: string;
  catalog: readonly Article[];
  now?: Date;
}): PostCard[] {
  const candidates = new Map<string, PostCard & { category?: string }>();
  for (const article of catalog) {
    if (!(Date.parse(article.publishedAt) <= now.getTime())) continue;
    candidates.set(article.slug, {
      id: article.slug,
      slug: article.slug,
      title: article.title,
      excerpt: article.description,
      coverImageUrl: article.image?.src ?? null,
      publishedAt: new Date(article.publishedAt),
      readingMinutes: article.readingMinutes,
      category: article.category,
    });
  }
  // Separate site/CMS pages and unknown routes are not catalog article pages.
  const current = candidates.get(currentSlug);
  if (!current) return [];
  return [...candidates.values()]
    .filter((post) => post.slug !== currentSlug)
    .sort((a, b) => {
      const related = (post: typeof a) =>
        Boolean(current.category && post.category === current.category);
      return (
        Number(related(b)) - Number(related(a)) ||
        b.publishedAt!.getTime() - a.publishedAt!.getTime() ||
        a.slug.localeCompare(b.slug)
      );
    });
}
