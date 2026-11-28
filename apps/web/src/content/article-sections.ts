/** New authored articles supply content and chart data, not page-specific geometry. */
export interface ArticleChartData {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Optional crop of blank SVG margins, in source coordinates. Never crops data. */
  frame?: { x: number; y: number; width: number; height: number };
  /** Only set when the artwork needs an intentional exception to the default scale. */
  size?: { widthPercent: number; maxWidth: number };
}

interface SectionCopy {
  content: string;
  format?: 'markdown' | 'html';
}

export type ArticleSection =
  | (SectionCopy & { type: 'text' })
  | (SectionCopy & { type: 'research'; chart: ArticleChartData; chartSide?: 'left' | 'right' });
