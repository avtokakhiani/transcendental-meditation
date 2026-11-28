import Link from 'next/link';
import { ArticleImage } from './article-image';
import styles from './latest-articles.module.css';
import {publicArticleCatalog} from '@/server/public-articles';

export async function LatestArticles() {
  const articles = await publicArticleCatalog();

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
