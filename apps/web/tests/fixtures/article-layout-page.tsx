import { PostArticle } from '../../scripts/article-foundation/archive/legacy-post-article';
import { StandardArticle } from '@/app/(site)/blog/[slug]/standard-article';

const paragraph = 'მედიტაცია ხელს უწყობს სტრესის შემცირებას და ზოგადი კეთილდღეობის გაუმჯობესებას.';
const copy = `## საცდელი სექცია\n\n${paragraph}\n\n${paragraph}\n\n- პირველი პუნქტი\n- **მეორე პუნქტი**`;
const chart = {
  src: '/images/tm-blood-pressure-chart-en.svg',
  alt: 'Layout test chart',
  width: 2123,
  height: 1589,
};

/** Mounted only by the local browser check; never part of the published app. */
export default async function ArticleLayoutFixture({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode } = await searchParams;
  if (mode === 'markdown' || mode === 'html') {
    return (
      <PostArticle
        post={{
          id: 'layout-fixture',
          slug: 'new-article-layout-fixture',
          title: 'ახალი სტატია',
          excerpt: paragraph,
          content:
            mode === 'html'
              ? `<h2>საცდელი სექცია</h2><p>${paragraph}</p><p>${paragraph}</p><ul><li>პირველი პუნქტი</li><li><strong>მეორე პუნქტი</strong></li></ul>`
              : copy,
          contentFormat: mode,
          authorName: null,
          coverImageUrl: null,
          publishedAt: new Date('2026-01-01T00:00:00Z'),
          updatedAt: new Date('2026-01-01T00:00:00Z'),
          readingMinutes: 1,
        }}
      />
    );
  }
  return (
    <StandardArticle
      article={{
        slug: 'new-catalog-layout-fixture',
        title: 'ახალი სტატია',
        description: paragraph,
        publishedAt: '2026-01-01T00:00:00Z',
        author: 'Layout fixture',
        readingMinutes: 1,
        category: 'Layout fixture',
        image: null,
        sections: [
          { type: 'text', content: copy },
          { type: 'research', content: copy, chart },
          {
            type: 'research',
            content: copy,
            chartSide: 'left',
            chart: { ...chart, frame: { x: 65, y: 0, width: 1760, height: 1540 } },
          },
          { type: 'text', content: copy },
        ],
      }}
    />
  );
}
