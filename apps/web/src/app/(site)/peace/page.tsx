import type { Metadata } from 'next';
import Image from 'next/image';
import introduction from '../blog/[slug]/what-is-tm-intro.module.css';
import hero from '../stress-and-anxiety/stress-and-anxiety.module.css';
import styles from './peace.module.css';

const HEADING = 'ტრანსცენდენტული მედიტაცია მსოფლიო მშვიდობის ხელშეწყობისთვის';

export const metadata: Metadata = {
  title: { absolute: `${HEADING} | learnTM.ge` },
};

export default function PeacePage() {
  return (
    <article>
      <section aria-labelledby="peace-heading" className={hero.hero}>
        <Image
          src="/images/peace-hero-reflections.jpeg"
          alt="ორი ადამიანი და მათი ანარეკლები მშვიდ წყალში, ღია ცის ფონზე."
          fill
          preload
          quality={90}
          sizes="100vw"
          className={`${hero.photograph} ${styles.photograph}`}
        />
        <h1 id="peace-heading" className={hero.heading}>{HEADING}</h1>
      </section>
      <section aria-label="შესავალი" className={introduction.continuation}>
        <div className={introduction.continuationCopy}>
          <p>სტრესი აძლიერებს შიშს, იმპულსურ რეაქციებს, აზროვნების შეზღუდულობასა და შეუწყნარებლობას. დაგროვილი სტრესი საზოგადოებაში ძალადობრივი კონფლიქტების წარმოშობისთვის ხელსაყრელ პირობებს ქმნის.</p>
          <p>თუ ტრანსცენდენტული მედიტაციის (TM) ტექნიკა სტრესს ამცირებს, შეუძლია თუ არა მას მთლიანად საზოგადოების კოლექტიური ცნობიერების ამაღლება? შეუძლია თუ არა შინაგან სიმშვიდეს მსოფლიო მშვიდობის დამყარებას შეუწყოს ხელი?</p>
        </div>
      </section>
    </article>
  );
}
