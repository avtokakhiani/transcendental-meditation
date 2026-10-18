import { ArrowRight } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { Artwork } from '@/components/site/artwork';

const POINTS = [
  {
    title: 'ინდივიდუალური სწავლება',
    body: (
      <>
        <span className="underline decoration-plum-300 underline-offset-4">პერსონალური გაკვეთილები</span>{' '}
        სერტიფიცირებულ მასწავლებელთან — უფრო ღრმა გამოცდილებისთვის
      </>
    ),
  },
  {
    title: 'სრულიად უძალისხმევო',
    body: (
      <>
        ნებისმიერს შეუძლია — მაშინაც კი, თუ ფიქრობთ, რომ{' '}
        <span className="underline decoration-plum-300 underline-offset-4">„მედიტაცია არ გამოგდით"</span>
      </>
    ),
  },
  {
    title: 'მეცნიერულად შესწავლილი',
    body: (
      <>
        ასობით გამოქვეყნებული{' '}
        <span className="underline decoration-plum-300 underline-offset-4">კვლევა</span> მთელი მსოფლიოდან
      </>
    ),
  },
  {
    title: 'ცოდნა ქართულად',
    body: <>ბლოგი და წიგნები, რომლებიც ონლაინ, უფასოდ იკითხება</>,
  },
] as const;

export function Hero() {
  return (
    <section id="about" className="relative scroll-mt-20 overflow-hidden">
      {/* Artwork bleeds to the right edge and fades into the page, like a window of light. */}
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[46%] lg:block">
        <Artwork variant="dawn" className="size-full" />
        <div className="absolute inset-0 bg-gradient-to-r from-cream-100 via-cream-100/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-cream-100 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-10 lg:pb-28 lg:pt-16">
        <div className="max-w-2xl lg:pl-[8%]">
          <p className="text-[11px] uppercase tracking-[0.12em] text-plum-500 sm:tracking-[0.28em]">
            ტექნიკა შინაგანი სიმშვიდისა და კეთილდღეობისთვის
          </p>
          <h1 className="mt-6 text-[1.85rem] leading-[1.2] [overflow-wrap:anywhere] font-light tracking-tight text-plum-800 sm:text-5xl lg:text-[3.4rem]">
            მედიტაცია, რომელიც <em className="font-serif font-normal text-plum-700 italic">მართლა</em>{' '}
            გამოგივათ
          </h1>

          <div className="mt-8 aspect-[4/3] overflow-hidden rounded-3xl lg:hidden">
            <Artwork variant="dawn" className="size-full" />
          </div>

          <ol className="mt-10 border-t border-dotted border-plum-300">
            {POINTS.map((point, index) => (
              <li key={point.title} className="grid grid-cols-[3.25rem_minmax(0,1fr)] gap-x-3 border-b border-dotted border-plum-300 py-6">
                <span className="font-serif text-3xl leading-none text-saffron-600 italic">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <h2 className="text-xl font-normal text-plum-800 sm:text-[1.4rem]">{point.title}</h2>
                  <p className="mt-2 text-[15px] leading-7 text-plum-500">{point.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Link
              href={'/#contact' as Route}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-saffron-400 px-8 py-4 text-[15px] font-medium text-plum-900 transition hover:bg-saffron-500"
            >
              იპოვე მასწავლებელი
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center justify-center rounded-full border border-plum-300 px-8 py-4 text-[15px] text-plum-800 transition hover:border-plum-500 hover:bg-cream-50"
            >
              წაიკითხე ბლოგი
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
