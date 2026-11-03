import type { Metadata } from 'next';
import Image from 'next/image';
import hero from '../stress-and-anxiety/stress-and-anxiety.module.css';
import styles from './articles-hero.module.css';
import { ArticlesHeaderBackground } from './articles-header-background';
import { LatestArticles } from './latest-articles';

export const metadata: Metadata = {
  title: 'სტატიები',
  description: 'სტატიები მედიტაციის, სტრესის, ძილისა და შინაგანი სიმშვიდის შესახებ.',
};

export default function BlogPage() {
  return (
    <>
      <ArticlesHeaderBackground />
      <section aria-labelledby="articles-heading" className={`${hero.hero} ${styles.hero}`}>
        <Image
          src="/images/peace-hero-yellow-blossoms.png"
          alt="მზით განათებული ყვითელი ყვავილები ლურჯი ცის ფონზე."
          fill
          preload
          quality={90}
          sizes="100vw"
          className={`${hero.photograph} ${styles.photograph}`}
        />
        <h1 id="articles-heading" className={hero.heading}>აღმოაჩინე მეტი ტრანსცენდენტული მედიტაციის შესახებ</h1>
      </section>
      <LatestArticles />
    </>
  );
}
