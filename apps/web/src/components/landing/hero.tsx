import { ArrowRight } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { preload } from 'react-dom';
import { INTRODUCTORY_MEETING_ROUTE } from '@/lib/routes';
import styles from './hero.module.css';

export function Hero() {
  preload('/images/tm-hero-wide-v2.png', { as: 'image', fetchPriority: 'high' });

  return (
    <section
      id="about"
      aria-labelledby="hero-heading"
      className={`${styles.hero} scroll-mt-20 bg-cream-100`}
    >
      <div className={styles.content}>
        <h1 id="hero-heading" className={`${styles.heading} font-normal text-plum-800`}>
          ტრანსცენდენტული მედიტაცია
        </h1>
        <p className={`${styles.description} font-light text-plum-700`}>
          მარტივი და ბუნებრივი ტექნიკა, რომელიც ხელს უწყობს ღრმა დასვენებას, სტრესის შემცირებასა და გონებრივ სიცხადეს.
        </p>
        <div className={styles.actions}>
          <Link
            href={'/blog/ra-aris-transtsendentuli-meditatsia' as Route}
            className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-saffron-400 px-7 py-2 text-center text-[15px] leading-5 font-medium text-plum-900 transition-colors hover:bg-saffron-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-plum-800"
          >
            გაეცანი TM-ს
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
          <Link
            href={INTRODUCTORY_MEETING_ROUTE}
            className="inline-flex h-14 items-center justify-center rounded-full bg-mist-300 px-7 py-2 text-center text-[15px] leading-5 text-plum-800 transition-colors hover:bg-mist-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-plum-800"
          >
            ჩაეწერე გაცნობით შეხვედრაზე
          </Link>
        </div>
      </div>
      <div aria-hidden="true" className={styles.photograph} />
    </section>
  );
}
