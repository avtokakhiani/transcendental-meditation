import type { Metadata } from 'next';
import Image from 'next/image';
import benefitHero from '@/components/site/benefit-hero.module.css';
import { ClosingCta } from '@/components/landing/closing-cta';
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
      <section aria-labelledby="stress-anxiety-heading" className={`${styles.hero} ${benefitHero.hero} ${benefitHero.stress}`}>
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
          <p>სტრესი თითოეულ ჩვენგანზე მოქმედებს და ხელს გვიშლის საკუთარი შესაძლებლობების სრულად გამოვლენაში. ზოგიერთისთვის ის იმდენად მძიმე შეიძლება აღმოჩნდეს, რომ მნიშვნელოვნად გააუარესოს ცხოვრების ხარისხი და დეპრესიის, შფოთვისა თუ პოსტტრავმული სტრესული აშლილობის (PTSD) სახით გამოვლინდეს.</p>
          <p>სტრესი ყველას ცხოვრებაზე მოქმედებს, მიუხედავად იმისა, რამდენად ბედნიერები და წარმატებულები ვართ. ტრანსცენდენტული მედიტაციის პრაქტიკის მეშვეობით სტრესის აღმოფხვრა გვეხმარება, უფრო სრულად დავტკბეთ ცხოვრებით.</p>
        </div>
      </section>
      <section aria-labelledby="stress-research-heading" className={styles.research}>
        <div className={styles.researchContent}>
          <h2 id="stress-research-heading" className={styles.researchHeading}>სამეცნიერო კვლევები: ტრანსცენდენტული მედიტაცია, სტრესი და შფოთვა</h2>
          <div className={styles.researchDescription}>
            <p>სამეცნიერო კვლევებით დადასტურებულია, რომ ტრანსცენდენტული მედიტაციის პრაქტიკა ხელს უწყობს სტრესისა და შფოთვის შემცირებას. ტექნიკის ერთ-ერთი მთავარი თავისებურება ისაა, რომ იგი მხოლოდ სტრესთან გამკლავებას ან მისი გავლენის შემსუბუქებას კი არ ემსახურება, არამედ თავად სტრესის აღმოფხვრისკენაა მიმართული.</p>
            <p>კვლევებში გამოვლენილია ტრანსცენდენტული მედიტაციის დადებითი გავლენა ფსიქიკურ კეთილდღეობასა და ორგანიზმის ფიზიოლოგიურ ფუნქციონირებაზე. გამოვლენილ შედეგებს შორისაა:</p>
          </div>
          <ul className={styles.researchList}>
            <li>პოსტტრავმული სტრესული აშლილობის (PTSD) სიმპტომების შემცირება</li>
            <li>დეპრესიული სიმპტომების შემცირება</li>
            <li>კორტიზოლის დონის შემცირება</li>
            <li>შფოთვის შემცირება</li>
            <li>ძილის ხარისხის გაუმჯობესება და უძილობის სიმპტომების შემცირება</li>
          </ul>
        </div>
      </section>
      <TraitAnxietySection />
      <CortisolSection />
      <PtsdSection />
      <ResearchCarousel />
      <ClosingCta showLearnMore={false} />
    </article>
  );
}
