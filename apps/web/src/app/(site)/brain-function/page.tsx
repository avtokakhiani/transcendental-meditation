import type { Metadata } from 'next';
import Image from 'next/image';
import { ClosingCta } from '@/components/landing/closing-cta';
import introduction from '../blog/[slug]/what-is-tm-intro.module.css';
import hero from '../stress-and-anxiety/stress-and-anxiety.module.css';
import styles from './brain-function.module.css';
import { CoherenceSection } from './coherence-section';
import { AcademicPerformanceSection } from './academic-performance-section';
import { SelfEsteemSection } from './self-esteem-section';
import { DavidLynchTestimonial } from './david-lynch-testimonial';
import { BrainResearchCarousel } from './brain-research-carousel';

const HEADING = 'ტრანსცენდენტული მედიტაცია გონების მეტი სიცხადისთვის';

export const metadata: Metadata = {
  title: { absolute: `${HEADING} | learnTM.ge` },
};

export default function BrainFunctionPage() {
  return (
    <article>
      <section aria-labelledby="brain-function-heading" className={hero.hero}>
        <Image
          src="/images/brain-function-hero-mountains.jpeg"
          alt="ქალი კლდეზე ზის და მზით განათებულ მთებს გადაჰყურებს."
          fill
          preload
          quality={90}
          sizes="100vw"
          className={`${hero.photograph} ${styles.photograph}`}
        />
        <h1 id="brain-function-heading" className={hero.heading}>{HEADING}</h1>
      </section>
      <section aria-label="შესავალი" className={introduction.continuation}>
        <div className={introduction.continuationCopy}>
          <p>როდესაც ნაკლებ სტრესს განვიცდით, ჩვენი გონებაც უკეთ ფუნქციონირებს. ტრანსცენდენტული მედიტაციის (TM) ტექნიკის დროს მიღებული ღრმა დასვენება ხელს უწყობს სტრესის შემცირებას, რის შედეგადაც აზროვნება უფრო ნათელი და მკაფიო ხდება.</p>
          <p>ეს ყოველდღიურ ცხოვრებაში შემოქმედებითი შესაძლებლობების უკეთ გამოვლენის საშუალებას გვაძლევს. რეგულარული პრაქტიკის შედეგად ტრანსცენდენტული მედიტაციის ტექნიკა თანდათან ავლენს ჩვენი გონებრივი პოტენციალის უფრო მეტ შესაძლებლობას და გვეხმარება, უფრო ეფექტიანები ვიყოთ ყველა საქმიანობაში.</p>
        </div>
      </section>
      <section aria-labelledby="brain-function-research-heading" className={hero.research}>
        <div className={hero.researchContent}>
          <h2 id="brain-function-research-heading" className={hero.researchHeading}>სამეცნიერო მტკიცებულებები: ტრანსცენდენტული მედიტაცია და გონებრივი პოტენციალის განვითარება</h2>
          <div className={hero.researchDescription}>
            <p>სხვადასხვა ჯგუფში — სტუდენტებში, დასაქმებულებსა და რისკის ქვეშ მყოფ ადამიანებში — ჩატარებული სამეცნიერო კვლევები მიუთითებს, რომ ტრანსცენდენტული მედიტაციის (TM) რეგულარულმა პრაქტიკამ შესაძლოა ხელი შეუწყოს გონებრივი შესაძლებლობების განვითარებას. ეს ადამიანებს ეხმარება, მეტი სიამოვნება მიიღონ ყოველდღიური საქმიანობისგან და გაზარდონ პროდუქტიულობა.</p>
            <p>კვლევების მიხედვით, TM-ის რეგულარულ პრაქტიკას შესაძლოა შემდეგი დადებითი შედეგები ახლდეს:</p>
          </div>
          <ul className={hero.researchList}>
            <li>ყურადღების კონცენტრაციისა და პროდუქტიულობის გაუმჯობესება</li>
            <li>მეხსიერების გაუმჯობესება</li>
            <li>ენერგიის დონის მატება</li>
            <li>შემოქმედებითი შესაძლებლობების უფრო თანმიმდევრული გამოვლენა</li>
          </ul>
        </div>
      </section>
      <CoherenceSection />
      <AcademicPerformanceSection />
      <SelfEsteemSection />
      <DavidLynchTestimonial />
      <BrainResearchCarousel />
      <ClosingCta showLearnMore={false} />
    </article>
  );
}
