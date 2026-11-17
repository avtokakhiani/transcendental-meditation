import Link from 'next/link';
import { getLatestArticles } from '@/content/articles';
import { ArticleImage } from './article-image';
import styles from './latest-articles.module.css';

// Listing copy only; keep the shared article titles and Hero headings intact.
const LISTING_COPY: Record<string, { title: string; description: string }> = {
  'meditatsia-uketesi-dzilistvis': {
    title: 'მედიტაცია უკეთესი ძილისთვის',
    description: 'გაიგე, როგორ ეხმარება მედიტაცია სტრესის შემცირებას, ჩაძინების გამარტივებასა და ძილის ხარისხის გაუმჯობესებას.',
  },
  'gulis-janmrteloba-da-meditatsia': {
    title: 'გულის ჯანმრთელობა და მედიტაცია',
    description: 'სამეცნიერო კვლევები აჩვენებს, როგორ მოქმედებს ტრანსცენდენტული მედიტაცია გულის ჯანმრთელობაზე, არტერიულ წნევასა და გულ-სისხლძარღვთა დაავადებების რისკფაქტორებზე.',
  },
  'meditatsia-stresis-shesamtsireblad': {
    title: 'მედიტაცია სტრესის შესამცირებლად',
    description: 'გაიგე, როგორ მოქმედებს სტრესი სხეულსა და გონებაზე და როგორ უწყობს ხელს ტრანსცენდენტული მედიტაცია მის შემცირებასა და შინაგან სიმშვიდეს.',
  },
};

export function LatestArticles() {
  const articles = getLatestArticles().map((article) => ({ ...article, ...LISTING_COPY[article.slug] }));

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
