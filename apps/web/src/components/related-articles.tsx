import { getLatestArticles } from '@/content/articles';
import { getArticleCardCopy } from '@/content/article-card-copy';
import { getRelatedArticles } from '@/content/related-articles';
import { PostCard } from './post-card';
import { RelatedArticlesCarousel } from './related-articles-carousel';

export function RelatedArticles({ currentSlug }: { currentSlug: string }) {
  const recommendations = getRelatedArticles({ currentSlug, catalog: getLatestArticles() });
  if (recommendations.length === 0) return null;
  return (
    <RelatedArticlesCarousel key={currentSlug}>
      {recommendations.map((post, index) => (
        <PostCard
          key={post.slug}
          post={{ ...post, ...getArticleCardCopy(post.slug) }}
          index={index}
          variant="latest"
        />
      ))}
    </RelatedArticlesCarousel>
  );
}
