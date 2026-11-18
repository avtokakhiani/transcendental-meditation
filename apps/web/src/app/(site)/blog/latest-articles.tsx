import Link from 'next/link';
import { getLatestArticles } from '@/content/articles';
import { getArticleCardCopy } from '@/content/article-card-copy';
import { ArticleImage } from './article-image';
import styles from './latest-articles.module.css';

export function LatestArticles() {
  const articles = getLatestArticles().map((article) => {
    const copy = getArticleCardCopy(article.slug);
    return {
      ...article,
      title: copy?.title ?? article.title,
      description: copy?.excerpt ?? article.description,
    };
  });

  return (
    <section className={styles.section} aria-label="სტატიები">
      <div className={styles.container}>
        <ul className={styles.list}>
          {articles.map((article) => (
            <li key={article.slug} className={styles.item}>
              <article>
                <Link href={`/blog/${article.slug}`} className={styles.row} aria-labelledby={`article-title-${article.slug}`}>
                  <div className={styles.copy}>
                    <h3 id={`article-title-${article.slug}`} className={styles.title}>
                      {article.title}
                    </h3>
                    <p className={styles.description}>{article.description}</p>
                    <p className={styles.author}>{article.author}</p>
                    <p className={styles.meta}>{article.readingMinutes} წუთი · {article.category}</p>
                  </div>
                  <div className={styles.thumbnail}>
                    <ArticleImage image={article.image} />
                  </div>
                </Link>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
