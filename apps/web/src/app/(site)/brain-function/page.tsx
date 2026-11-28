import type { Metadata } from 'next';
import Image from 'next/image';
import benefitHero from '@/components/site/benefit-hero.module.css';
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
      <section aria-labelledby="brain-function-heading" className={`${hero.hero} ${benefitHero.hero} ${benefitHero.brain}`}>
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
          <p>როდესაც ნაკლებ სტრესს განვიცდით, ჩვენი გონება უკეთ ფუნქციონირებს. ტრანსცენდენტული მედიტაციის დროს მიღებული ღრმა დასვენება ხელს უწყობს სტრესის აღმოფხვრას, რის შედეგადაც აზროვნება უფრო ნათელი და მკაფიო ხდება.</p>
          <p>ეს ყოველდღიურ ცხოვრებაში ჩვენი შემოქმედებითი შესაძლებლობების უფრო სრულად გამოვლენის საშუალებას გვაძლევს. რეგულარული პრაქტიკა თანდათან ავითარებს ჩვენს გონებრივ პოტენციალს და გვეხმარება, უფრო ეფექტიანად ვიმოქმედოთ ნებისმიერ საქმიანობაში.</p>
        </div>
      </section>
      <section aria-labelledby="brain-function-research-heading" className={hero.research}>
        <div className={hero.researchContent}>
          <h2 id="brain-function-research-heading" className={hero.researchHeading}>სამეცნიერო კვლევები: ტრანსცენდენტული მედიტაცია და გონებრივი პოტენციალის განვითარება</h2>
          <div className={hero.researchDescription}>
            <p>სხვადასხვა ჯგუფში — სტუდენტებში, დასაქმებულებსა და რისკის ქვეშ მყოფ ადამიანებში — ჩატარებული სამეცნიერო კვლევები აჩვენებს, რომ ტრანსცენდენტული მედიტაციის რეგულარული პრაქტიკა ხელს უწყობს გონებრივი შესაძლებლობების ბუნებრივ განვითარებას. ეს საშუალებას გვაძლევს, უფრო სრულად გამოვავლინოთ საკუთარი პოტენციალი, გავზარდოთ პროდუქტიულობა და მეტი სიამოვნება მივიღოთ ყოველდღიური საქმიანობისგან.</p>
            <p>კვლევებით გამოვლენილ დადებით შედეგებს შორისაა:</p>
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
