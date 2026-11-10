import type { Metadata } from 'next';
import Image from 'next/image';
import hero from '../stress-and-anxiety/stress-and-anxiety.module.css';
import styles from './how-to-learn.module.css';

export const metadata: Metadata = {
  title: 'როგორ ვისწავლო ტრანსცენდენტული მედიტაცია?',
};

export default function HowToLearnPage() {
  return (
    <section aria-labelledby="learn-heading" className={`${hero.hero} ${styles.hero}`}>
      <Image
        src="/images/learn-hero-dunes.jpeg"
        alt="ქალი მშვიდად ზის ქვიშის დიუნებზე მზის ჩასვლისას."
        fill
        preload
        quality={90}
        sizes="100vw"
        className={`${hero.photograph} ${styles.photograph}`}
      />
      <h1 id="learn-heading" className={`${hero.heading} ${styles.heading}`}>როგორ ვისწავლო ტრანსცენდენტული მედიტაცია?</h1>
    </section>
  );
}
