import type { CSSProperties, ImgHTMLAttributes, ReactNode } from 'react';
import type { ArticleChartData, ArticleSection } from '@/content/article-sections';
import { RichContent } from './rich-content';
import { TeacherCta } from './teacher-cta';
import { INTRODUCTORY_MEETING_ROUTE } from '@/lib/routes';
import research from './research-layout.module.css';
import styles from './article-layout.module.css';

/** Default article boundaries are balanced. Sleep keeps its approved bottom padding. */
export function ArticleContent({
  children,
  variant = 'balanced',
}: {
  children: ReactNode;
  variant?: 'balanced' | 'sleep';
}) {
  return (
    <div className={`${styles.content} ${variant === 'sleep' ? styles.sleep : ''}`}>{children}</div>
  );
}

/** Reading width, typography, headings, paragraphs and lists share one rhythm. */
export function ArticleText({
  children,
  separated = false,
}: {
  children: ReactNode;
  separated?: boolean;
}) {
  return (
    <div className={`${styles.text} ${styles.copy} ${separated ? styles.sectionGap : ''}`}>
      {children}
    </div>
  );
}

export function ArticleResearch({
  children,
  chart,
  chartSide = 'right',
}: {
  children: ReactNode;
  chart: ReactNode;
  chartSide?: 'left' | 'right';
}) {
  return (
    <div
      className={`${research.embedded} ${styles.research} ${styles.sectionGap} ${chartSide === 'left' ? styles.chartOnLeft : ''}`}
    >
      <div className={styles.copy}>{children}</div>
      {chart}
    </div>
  );
}

/** Artwork-specific framing classes are deliberate exceptions to the common scale. */
export function ArticleChart({
  figureClassName = '',
  className = '',
  frame,
  size,
  ...image
}: Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'width' | 'height'> & {
  src: string;
  alt: string;
  width: number;
  height: number;
  figureClassName?: string;
  frame?: ArticleChartData['frame'];
  size?: ArticleChartData['size'];
}) {
  const variables = {
    ...(size
      ? {
          '--research-chart-width': `${size.widthPercent}%`,
          '--research-chart-max-width': `${size.maxWidth}px`,
        }
      : {}),
    ...(frame
      ? {
          '--chart-source-width': image.width,
          '--chart-frame-width': frame.width,
          '--chart-frame-height': frame.height,
          '--chart-frame-left': frame.x,
          '--chart-frame-top': frame.y,
        }
      : {}),
  } as CSSProperties;
  return (
    <figure
      className={`${research.figure} ${frame ? styles.framed : ''} ${figureClassName}`}
      style={variables}
    >
      <img
        {...image}
        className={`${research.chart} ${frame ? styles.framedImage : ''} ${className}`}
      />
    </figure>
  );
}

export function ArticleCta({ headingId = 'article-teacher-heading' }: { headingId?: string }) {
  return (
    <TeacherCta
      className={styles.cta}
      headingId={headingId}
      heading="გსურს ტრანსცენდენტული მედიტაციის სწავლა?"
      buttonText="ჩაეწერე გაცნობით შეხვედრაზე"
      buttonHref={INTRODUCTORY_MEETING_ROUTE}
    >
      <p>
        შემოგვიერთდი გაცნობით შეხვედრაზე — ონლაინ ან პირისპირ — და გაიგე მეტი ტრანსცენდენტული
        მედიტაციის შესახებ.
      </p>
    </TeacherCta>
  );
}

export function ArticleProse({ children }: { children: ReactNode }) {
  return <div className={styles.text}>{children}</div>;
}

export const articleProseClassName = styles.prose;
export const legacyArticleClassName = styles.legacyPost;
export const legacyArticleReadingClassName = styles.legacyReading;

/** Both authored sections and CMS prose inherit the same article standards. */
export function ArticleSections({ sections }: { sections: readonly ArticleSection[] }) {
  return sections.map((section, index) => {
    const copy = (
      <RichContent
        content={section.content}
        format={section.format ?? 'markdown'}
        className={styles.prose}
      />
    );
    return section.type === 'research' ? (
      <ArticleResearch
        key={index}
        chartSide={section.chartSide}
        chart={<ArticleChart {...section.chart} loading="lazy" />}
      >
        {copy}
      </ArticleResearch>
    ) : (
      <ArticleText key={index} separated={index > 0}>
        {copy}
      </ArticleText>
    );
  });
}
