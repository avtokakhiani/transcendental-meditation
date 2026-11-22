import type { Metadata } from 'next';
import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { corporate as copy } from '@/content/corporate';
import { CorporateForm } from './corporate-form';
import styles from './corporate.module.css';

export const metadata: Metadata = {
  title: copy.hero.heading,
  description: copy.hero.description,
  alternates: { canonical: '/organizaciebitvis' },
  openGraph: { title: copy.hero.heading, description: copy.hero.description, images: ['/images/corporate-tm-hero.jpeg'] },
};

export default function CorporatePage() {
  return (
    <div className={styles.page}>
      <section aria-labelledby="corporate-heading" className={styles.hero}>
        <Image src="/images/corporate-tm-hero.jpeg" alt="თანამშრომლები ერთად მედიტირებენ ნათელ სამუშაო სივრცეში" fill priority sizes="100vw" className={styles.photograph} />
        <div className={styles.heroContent}>
          <h1 id="corporate-heading">{copy.hero.heading}</h1>
          <p className={styles.subtitle}>{copy.hero.subtitle}</p>
          <p className={styles.heroDescription}>გთავაზობთ თანამშრომლებისთვის TM-ის სწავლებას მოქნილი განრიგითა და შემდგომი მხარდაჭერის შესაძლებლობით.</p>
          <a className={styles.button} href="#corporate-contact">{copy.hero.cta}</a>
        </div>
      </section>

      <section aria-labelledby="wellbeing-heading" className={`${styles.section} ${styles.wellbeing}`}>
        <h2 id="wellbeing-heading">{copy.wellbeing.heading}</h2>
        <div className={styles.body}>
          {copy.wellbeing.paragraphs.map(text => <p key={text}>{text}</p>)}
          <div className={styles.links}>
            <Link href="/blog/ra-aris-transtsendentuli-meditatsia">{copy.wellbeing.links[0]}<ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.5} /></Link>
            <Link href="/benefits">{copy.wellbeing.links[1]}<ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.5} /></Link>
          </div>
        </div>
      </section>

      <div className={styles.programBackground}>
        <section aria-labelledby="programs-heading" className={styles.section}>
          <h2 id="programs-heading" className={styles.centerHeading}>{copy.programs.heading}</h2>
          <div className={styles.programs}>
            <article className={styles.program}>
              <h3>{copy.programs.a.heading}</h3>
              <div className={styles.body}>{copy.programs.a.paragraphs.map(text => <p key={text}>{text}</p>)}</div>
              <div className={styles.discount}>
                <h4>{copy.programs.a.subheading}</h4>
                <div className={styles.body}>{copy.programs.a.discount.map(text => <p key={text}>{text}</p>)}</div>
              </div>
            </article>
            <article className={styles.program}>
              <h3>{copy.programs.b.heading}</h3>
              <div className={styles.body}>{copy.programs.b.paragraphs.map(text => <p key={text}>{text}</p>)}</div>
            </article>
          </div>
        </section>
      </div>

      <section aria-labelledby="process-heading" className={styles.section}>
        <h2 id="process-heading" className={styles.centerHeading}>{copy.process.heading}</h2>
        <ol className={styles.steps}>
          {copy.process.steps.map((step, index) => <li key={step.heading}>
            <span aria-hidden="true" className={styles.stepNumber}>{index + 1}</span>
            <div><h3>{step.heading}</h3><p>{step.body}</p></div>
          </li>)}
        </ol>
      </section>

      <div className={styles.contactBackground}>
        <section id="corporate-contact" aria-labelledby="corporate-contact-heading" className={`${styles.section} ${styles.contact}`}>
          <div>
            <h2 id="corporate-contact-heading">{copy.form.heading}</h2>
            <div className={styles.body}>{copy.form.description.map(text => <p key={text}>{text}</p>)}</div>
          </div>
          <CorporateForm />
        </section>
      </div>
    </div>
  );
}
