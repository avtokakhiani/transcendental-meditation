import type { Metadata } from 'next';
import Image from 'next/image';
import introduction from '../blog/[slug]/what-is-tm-intro.module.css';
import styles from './stress-and-anxiety.module.css';
import { TraitAnxietySection } from './trait-anxiety-section';
import { CortisolSection } from './cortisol-section';
import { PtsdSection } from './ptsd-section';
import { ResearchCarousel } from './research-carousel';

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
      <section aria-labelledby="stress-research-heading" className={styles.research}>
        <div className={styles.researchContent}>
          <h2 id="stress-research-heading" className={styles.researchHeading}>სამეცნიერო კვლევები: ტრანსცენდენტული მედიტაცია, სტრესი და შფოთვა</h2>
          <div className={styles.researchDescription}>
            <p>სამეცნიერო კვლევები მიუთითებს, რომ ტრანსცენდენტული მედიტაციის (TM) რეგულარულმა პრაქტიკამ შესაძლოა ხელი შეუწყოს სტრესისა და შფოთვის შემცირებას. ტექნიკის ერთ-ერთი მთავარი თავისებურებაა ღრმა დასვენების ბუნებრივი გამოცდილება, რომელიც არ მოითხოვს ძალისხმევას ან ყურადღების კონცენტრაციას.</p>
            <p>კვლევებში შესწავლილია ტრანსცენდენტული მედიტაციის შესაძლო გავლენა ფსიქოლოგიურ კეთილდღეობასა და სტრესთან დაკავშირებულ ფიზიოლოგიურ მაჩვენებლებზე, მათ შორის:</p>
          </div>
          <ul className={styles.researchList}>
            <li>პოსტტრავმული სტრესული აშლილობის (PTSD) სიმპტომების შემცირება</li>
            <li>დეპრესიული სიმპტომების შემცირება</li>
            <li>კორტიზოლის დონის შემცირება</li>
            <li>შფოთვის შემცირება</li>
            <li>ძილის ხარისხის გაუმჯობესება და უძილობის სიმპტომების შემსუბუქება</li>
          </ul>
        </div>
      </section>
      <TraitAnxietySection />
      <CortisolSection />
      <PtsdSection />
      <ResearchCarousel />
    </article>
  );
}
