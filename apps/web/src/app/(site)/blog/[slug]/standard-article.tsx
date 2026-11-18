import Image from 'next/image';
import type { Article } from '@/content/articles';
import { ArticleContent, ArticleSections, ArticleCta } from '@/components/article-layout';
import hero from '../../stress-and-anxiety/stress-and-anxiety.module.css';
import overlay from '../articles-hero.module.css';
import { ArticlesHeaderBackground } from '../articles-header-background';
import styles from './standard-article.module.css';

/** All new catalog articles use shared geometry without another slug-specific component. */
export function StandardArticle({ article }: { article: Article }) {
  return (
    <article>
      {article.image ? <ArticlesHeaderBackground /> : null}
      <section
        aria-labelledby="article-heading"
        className={article.image ? `${hero.hero} ${overlay.hero}` : styles.plainHeader}
      >
        {article.image ? (
          <Image
            src={article.image.src}
            alt={article.image.alt}
            fill
            preload
            quality={90}
            sizes="100vw"
            className={hero.photograph}
          />
        ) : null}
        <h1 id="article-heading" className={hero.heading}>
          {article.title}
        </h1>
      </section>
      <ArticleContent>
        <ArticleSections
          sections={article.sections ?? [{ type: 'text', content: article.description }]}
        />
      </ArticleContent>
      <ArticleCta />
    </article>
  );
}
