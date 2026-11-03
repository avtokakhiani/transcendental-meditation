import Image from 'next/image';
import type { Article } from '@/content/articles';
import hero from '../../stress-and-anxiety/stress-and-anxiety.module.css';
import overlay from '../articles-hero.module.css';
import { ArticlesHeaderBackground } from '../articles-header-background';
import styles from './heart-article-hero.module.css';

export function HeartArticleHero({ title, image }: { title: string; image: NonNullable<Article['image']> }) {
  return (
    <article>
      <ArticlesHeaderBackground />
      <section aria-labelledby="heart-article-heading" className={`${hero.hero} ${overlay.hero} ${styles.hero}`}>
        <Image
          src={image.src}
          alt={image.alt}
          fill
          preload
          quality={90}
          sizes="100vw"
          className={`${hero.photograph} ${styles.photograph}`}
        />
        <h1 id="heart-article-heading" className={hero.heading}>{title}</h1>
      </section>
    </article>
  );
}
