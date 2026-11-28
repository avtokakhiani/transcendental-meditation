import type { Metadata } from 'next';
import Image from 'next/image';
import benefitHero from '@/components/site/benefit-hero.module.css';
import { FaqAccordion } from '@/components/site/faq-accordion';
import { faqItems } from '@/content/faq';
import hero from '../stress-and-anxiety/stress-and-anxiety.module.css';
import styles from './faq.module.css';

export const metadata: Metadata = { title: 'ხშირად დასმული კითხვები' };

export default function FaqPage() {
  return (
    <div className="bg-cream-100">
      <section aria-labelledby="faq-heading" className={`${hero.hero} ${benefitHero.hero} ${styles.hero}`}>
        <Image
          src="/images/faq-hero-sunset-grass.jpeg"
          alt=""
          fill
          priority
          sizes="100vw"
          className={`${hero.photograph} ${styles.photograph}`}
        />
        <h1 id="faq-heading" className={hero.heading}>ხშირად დასმული კითხვები</h1>
      </section>
      <section aria-labelledby="questions-heading" className="mx-auto max-w-4xl px-5 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-[5.5rem]">
        <h2 id="questions-heading" className="mb-10 text-2xl font-normal leading-snug sm:text-3xl">კითხვები და პასუხები</h2>
        <FaqAccordion items={faqItems} />
      </section>
    </div>
  );
}
