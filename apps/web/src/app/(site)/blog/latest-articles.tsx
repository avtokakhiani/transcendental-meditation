import Link from 'next/link';
import { getLatestArticles } from '@/content/articles';
import { ArticleImage } from './article-image';
import styles from './latest-articles.module.css';

// Listing copy only; keep the shared article titles and Hero headings intact.
const LISTING_COPY: Record<string, { title: string; description: string }> = {
  'meditatsia-uketesi-dzilistvis': {
    title: 'მედიტაცია უკეთესი ძილისთვის',
    description: 'გაიგე, როგორ შეიძლება მედიტაცია დაგეხმაროს სტრესის შემცირებაში, უფრო მარტივად ჩაძინებასა და ძილის ხარისხის გაუმჯობესებაში.',
  },
  'gulis-janmrteloba-da-meditatsia': {
    title: 'გულის ჯანმრთელობა და მედიტაცია',
    description: 'აღმოაჩინე, რას აჩვენებს სამეცნიერო კვლევები ტრანსცენდენტული მედიტაციის გავლენაზე არტერიულ წნევასა და გულის ჯანმრთელობაზე.',
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
