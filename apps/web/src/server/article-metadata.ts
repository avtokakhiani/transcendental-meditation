import type {Metadata} from 'next';
import type {PublishedArticle} from './services/published-articles';
export function publishedArticleMetadata(article: PublishedArticle): Metadata {
  const r=article.revision, presentation=r.presentation?JSON.parse(r.presentation):{};
  const original = presentation.legacyMetadata;
  const social = !original || original.meta.some((entry:{name:string})=>entry.name.startsWith('og:'));
  const title=r.seoTitle??r.title, description=r.seoDescription??r.excerpt??article.description;
  return {title,description,
    ...(original?.canonical?{alternates:{canonical:original.canonical}}:{}),
    ...(social?{openGraph:{title,description,type:'article',...(r.socialImageUrl??r.coverImageUrl?{images:[(r.socialImageUrl??r.coverImageUrl)!]}:{})}}:{}),
  };
}
