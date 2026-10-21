import type { Metadata } from 'next';
import Image from 'next/image';
import introduction from '../blog/[slug]/what-is-tm-intro.module.css';
import styles from './stress-and-anxiety.module.css';

const HEADING = 'ტრანსცენდენტული მედიტაცია სტრესისა და შფოთვის შესამცირებლად';

export const metadata: Metadata = {
  title: { absolute: `${HEADING} | learnTM.ge` },
  description: 'გაეცანი ტრანსცენდენტულ მედიტაციას და მის შესაძლო გავლენას სტრესისა და შფოთვის შემცირებაზე. შეიტყვე მეტი TM-ის პრაქტიკის შესახებ.',
};

export default function StressAndAnxietyPage() {
  return (
    <article>
      <section aria-labelledby="stress-anxiety-heading" className={styles.hero}>
        <Image
          src="/images/stress-anxiety-hero-seaside.jpeg"
          alt="ქალი ზღვის სანაპიროზე მზის თბილ შუქში."
          fill
          preload
          quality={90}
          sizes="100vw"
          className={styles.photograph}
        />
        <h1 id="stress-anxiety-heading" className={styles.heading}>{HEADING}</h1>
      </section>
      <section aria-label="შესავალი" className={introduction.continuation}>
        <div className={introduction.continuationCopy}>
          <p>სტრესი თითოეულ ჩვენგანზე მოქმედებს და ხელს გვიშლის საკუთარი შესაძლებლობების სრულად გამოვლენაში. ზოგიერთ შემთხვევაში სტრესი შეიძლება იმდენად მძიმე იყოს, რომ დეპრესიის, შფოთვისა და პოსტტრავმული სტრესული აშლილობის (PTSD) სახით გამოვლინდეს.</p>
          <p>მიუხედავად იმისა, ბედნიერები და წარმატებულები ვართ თუ ამ მდგომარეობისგან ჯერ კიდევ შორს ვიმყოფებით, ტრანსცენდენტული მედიტაციის (TM) პრაქტიკის მეშვეობით სტრესის შემცირება თითოეულ ჩვენგანს შეუძლია დაეხმაროს ცხოვრებით უფრო სრულად ტკბობაში.</p>
        </div>
      </section>
    </article>
  );
}
