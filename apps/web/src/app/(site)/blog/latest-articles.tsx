import Link from 'next/link';
import { getLatestArticles } from '@/content/articles';
import { ArticleImage } from './article-image';
import styles from './latest-articles.module.css';

export function LatestArticles() {
  return (
    <section className={styles.section} aria-label="სტატიები">
      <div className={styles.container}>
        <ul className={styles.list}>
          {getLatestArticles().map((article) => (
            <li key={article.slug} className={styles.item}>
              <article className={styles.row}>
                <div className={styles.copy}>
                  <h3 className={styles.title}>
                    <Link href={`/blog/${article.slug}`}>{article.title}</Link>
                  </h3>
                  <p className={styles.description}>{article.description}</p>
                  <p className={styles.author}>{article.author}</p>
                  <p className={styles.meta}>{article.readingMinutes} წუთი · {article.category}</p>
                </div>
                <Link href={`/blog/${article.slug}`} className={styles.thumbnail} aria-label={article.title}>
                  <ArticleImage image={article.image} />
                </Link>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
