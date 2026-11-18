# Article layout

New articles use the shared layout automatically. Do not copy CSS from another article.

The defaults come from the finalized sleep and heart articles. Research grid geometry
comes from the Stress & Anxiety page (`/stress-and-anxiety`). The established artwork
sizes, SVG crops, and sleep article's closing padding are intentional exceptions.

## Geometry

The single source of responsive values is `src/components/article-tokens.css`.

| Value                                                          | Mobile < 640px       | Tablet 640–1023px    | Desktop ≥ 1024px  |
| -------------------------------------------------------------- | -------------------- | -------------------- | ----------------- |
| Reading container, including gutters                           | 800px maximum        | 800px maximum        | 800px maximum     |
| Reading gutter per side                                        | 20px                 | 20px                 | 20px              |
| Content padding, top and bottom                                | 48px                 | 60px                 | 84px              |
| Gap between article blocks, including consecutive chart blocks | 70px                 | 93px                 | 128px             |
| Research container maximum                                     | 1320px               | 1320px               | 1320px            |
| Research gutter per side                                       | 20px                 | 24px                 | 48px              |
| Research columns                                               | One, text then chart | One, text then chart | Two equal columns |
| Gap inside the research grid                                   | 32px                 | 32px                 | 48px              |
| Standalone research section padding per boundary               | 48px                 | 64px                 | 88px              |
| Paragraph gap / heading lead-in                                | 24px                 | 24px                 | 24px              |
| Bullet gap / indent                                            | 8px / 24px           | 8px / 24px           | 8px / 24px        |
| Body font size / line height                                   | 16px / 1.85          | 18px / 1.85          | 18px / 1.85       |
| H2 font size / line height                                     | 24px / 1.45          | 28px / 1.45          | 28px / 1.45       |
| Final CTA padding per boundary                                 | 81.5px               | 89.6875px            | 89.6875px         |

Values above assume the site's existing 16px root font size. CSS uses the reference
rem values where applicable, with 40rem and 64rem breakpoints.

Standalone research sections retain their own 48/64/88px padding. Adjacent standalone
sections therefore have 96/128/176px between their grids. Article research blocks
have **no block padding**: only the following block owns the 70/93/128px margin.
Do not add standalone section padding to an embedded article grid.

## Adding an article

CMS HTML and Markdown posts go through `PostArticle` in the default blog route.
They automatically get the reading width, prose rhythm, balanced content padding,
and the shared final CTA. Books and editor previews retain their own typography.

Catalog articles in `src/content/articles.ts` can provide typed `sections`:

```tsx
sections: [
  { type: 'text', content: '## სათაური\n\nსტატიის ტექსტი…' },
  {
    type: 'research',
    content: '## კვლევა\n\nკვლევის ტექსტი…',
    chartSide: 'left',
    chart: {
      src: '/images/research-chart.svg',
      alt: 'Describe the chart and its data',
      width: 1200,
      height: 900,
    },
  },
];
```

`StandardArticle` renders the hero, sections and CTA without another slug-specific
component. If sections are omitted, the description is shown as the initial copy.
For custom JSX, use `ArticleContent`, `ArticleText`, `ArticleResearch`, `ArticleChart`
and `ArticleCta` from `src/components/article-layout.tsx`. `ArticleText separated`
adds the standard gap after a preceding block. `ArticleResearch` adds it by default;
a first block has no leading gap. Do not add margins or padding around these blocks.

Default charts are centered, keep their aspect ratio, and use 80% of the column
up to 480px. A left chart moves left only on desktop; text comes first on mobile.
Avoid altering source SVG data. If blank margins need trimming, supply `chart.frame`
with `x`, `y`, `width`, and `height` in source coordinates. An optional `chart.size`
(`widthPercent`, `maxWidth`) supports deliberate artwork-specific proportions.
Check the title, axes, labels and citation at all three screen sizes before choosing
a crop or scale. Never give every chart the same visual dimensions automatically.

## Preserved designs

- Sleep uses `ArticleContent variant="sleep"` to preserve 48/64/88px bottom padding.
- Existing heart, sleep and stress artwork keeps its finalized local framing/sizing
  classes through `ArticleChart`. These classes contain no section spacing.
- The custom introductory article keeps its composed sections and existing typography;
  its reading padding and research grids use shared tokens.
- Four older published CMS posts retain their original design through the closed
  compatibility list in `src/content/article-layouts.ts`. Do not add new slugs to
  that list: new posts use the shared defaults.

## Verification

The dynamic `/blog/[slug]/layout.tsx` also appends `RelatedArticles` after the article
and its existing CTA. No article template needs to add this section manually.
Recommendations use only the published catalog returned by `getLatestArticles()`,
the same source as the „სტატიები“ listing. They deduplicate by slug, exclude the
current article, rank matching categories first, then sort by publication date.
New catalog publications appear automatically. Separate CMS/site pages, including
„რა არის TM?“, are not catalog entries and do not receive this article-only section.
Cards reuse the homepage's `PostCard` and short card copy.

The carousel follows the homepage card breakpoints: one card below 768px, two from
768px, three from 1024px. Native scroll snapping supports touch; buttons and keyboard
controls move one card. There is no autoplay or duplication to fill slots. Empty
recommendations render nothing; controls appear only when more cards can be shown.
Controls sit immediately before „ყველა სტატია“ on the right of the section header.
The related-article browser check uses the real listing and existing article routes;
it creates no fixture pages or database records.

Start the host development server with `start-dev.ps1`, then run:

```powershell
pnpm --filter @tm/web typecheck
pnpm --filter @tm/web test:article-layout
pnpm --filter @tm/web test:related-articles
```

The browser check covers mobile/tablet/desktop and both breakpoint boundaries,
existing article geometry, consecutive chart gaps, left/right columns, the shared
CTA, and new catalog, Markdown and HTML articles. It temporarily mounts a fixture
route and removes it in `finally`; it does not create or modify database content.
It uses installed Chrome on Windows. Elsewhere, install Chromium with
`pnpm --filter @tm/web exec playwright install chromium` first.
