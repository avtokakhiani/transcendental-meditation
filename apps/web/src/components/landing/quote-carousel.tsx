'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

/** Press quotes from tm.org's "Featured in" slider, translated. `accent` mirrors the original's italics. */
const QUOTES: ReadonlyArray<{ source: string; before: string; accent?: string; after?: string }> = [
  {
    source: 'Forbes',
    before: '…TM',
    accent: 'პირდაპირ საქმეზე გადადის',
    after:
      ': საკმარისია სულ რამდენიმე დღე — ზოგისთვის კი რამდენიმე წუთიც — რომ ადამიანმა მტკივნეული და დამთრგუნველი ფიქრებისგან შვება იგრძნოს.',
  },
  {
    source: 'Axios',
    before:
      'კვლევებმა აჩვენა, რომ TM-ს შეუძლია შეამციროს შფოთვა, სამსახურებრივი სტრესი, გულის დაავადებების რისკი და კორტიზოლის — სტრესის ჰორმონის — დონე.',
  },
  {
    source: 'Cleveland Clinic',
    before:
      'TM არ ამახვილებს ყურადღებას სუნთქვაზე ან გალობაზე, როგორც მედიტაციის სხვა ფორმები. სამაგიეროდ, ის გონებას აზროვნების მიღმა არსებულ მშვიდ მდგომარეობაში გადასვლაში ეხმარება…',
  },
];

const AUTO_ADVANCE_MS = 9000;

export function QuoteCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const quote = QUOTES[index]!;

  useEffect(() => {
    if (paused || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setTimeout(() => setIndex((value) => (value + 1) % QUOTES.length), AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [index, paused]);

  const go = (delta: number) => setIndex((value) => (value + delta + QUOTES.length) % QUOTES.length);
  const arrowClass =
    'row-start-2 grid size-12 place-items-center rounded-full border border-dotted border-plum-700 text-plum-700 transition hover:bg-cream-200 md:row-start-1 md:mt-[5.25rem] md:justify-self-center';

  return (
    <section
      aria-roledescription="carousel"
      aria-label="რას წერენ TM-ის შესახებ"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="bg-cream-100 pb-20 pt-10 lg:pb-24"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-2 items-start gap-x-4 gap-y-8 px-4 sm:px-6 md:grid-cols-[1fr_minmax(0,46rem)_1fr] md:gap-x-6">
        <figure
          key={index}
          aria-live="polite"
          className="col-span-2 row-start-1 animate-[fade-in_600ms_ease-out] text-center md:col-span-1 md:col-start-2"
        >
          <figcaption className="font-serif text-[2rem] leading-none font-semibold tracking-tight text-plum-800">
            {quote.source}
          </figcaption>
          <blockquote className="mt-7 text-[1.35rem] leading-[1.6] font-light text-plum-800 sm:text-[1.6rem]">
            {/* Zero-height inline box: the mark flows with the centered first line without stretching it. */}
            <span
              aria-hidden="true"
              className="relative -top-1 mr-6 inline-block h-0 align-top font-serif text-[3.25rem] leading-none font-semibold text-plum-800"
            >
              “
            </span>
            {quote.before}
            {quote.accent !== undefined ? (
              <>
                {' '}
                <em className="font-serif font-normal italic">{quote.accent}</em>
              </>
            ) : null}
            {quote.after}
          </blockquote>
        </figure>

        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="წინა ციტატა"
          className={`${arrowClass} col-start-1 justify-self-end md:col-start-1`}
        >
          <ArrowLeft aria-hidden="true" className="size-4" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="შემდეგი ციტატა"
          className={`${arrowClass} col-start-2 justify-self-start md:col-start-3`}
        >
          <ArrowRight aria-hidden="true" className="size-4" strokeWidth={1.5} />
        </button>
      </div>
    </section>
  );
}
