import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import type { Article } from '@/content/articles';
import styles from './latest-articles.module.css';

export function ArticleImage({ image }: { image: Article['image'] }) {
  if (image) {
    return <Image src={image.src} alt={image.alt} fill sizes="(max-width: 600px) 28vw, 200px" className={styles.image} />;
  }

  return (
    <span className={styles.placeholder} role="img" aria-label="სტატიის ფოტოს ადგილი">
      <ImageIcon aria-hidden="true" size={28} strokeWidth={1} />
      <span>ფოტო დაემატება</span>
    </span>
  );
}
