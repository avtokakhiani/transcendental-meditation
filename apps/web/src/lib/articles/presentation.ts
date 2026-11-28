import type {ArticleSection} from '../../content/article-sections';

export interface Article {
  slug: string;
  publishedAt: string;
  title: string;
  description: string;
  author: string;
  readingMinutes: number;
  category: string;
  image: { src: string; alt: string } | null;
  sections?: readonly ArticleSection[];
}

