import { PostCard } from './post-card';
import { RelatedArticlesCarousel } from './related-articles-carousel';
import {publicArticleCatalog} from '@/server/public-articles';
import {relatedPublishedArticles} from '@/server/services/published-articles';

export async function RelatedArticles({ currentSlug }: { currentSlug: string }) {
  const recommendations = relatedPublishedArticles(currentSlug,await publicArticleCatalog()).map(article=>article.card);
  if (recommendations.length === 0) return null;
  return (
    <RelatedArticlesCarousel key={currentSlug}>
      {recommendations.map((post, index) => (
        <PostCard
          key={post.slug}
          post={post}
          index={index}
          variant="latest"
        />
      ))}
    </RelatedArticlesCarousel>
  );
}
