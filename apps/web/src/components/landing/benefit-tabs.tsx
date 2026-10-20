'use client';

import { useId, useState } from 'react';
import { Artwork, type ArtworkVariant } from '@/components/site/artwork';

const TABS: ReadonlyArray<{ label: string; text: string; cta: string; art: ArtworkVariant }> = [
  {
    label: 'სტრესისგან შვება',
    text: 'TM-ის პრაქტიკა ამცირებს კორტიზოლს — ჰორმონს, რომელიც სტრესთან ასოცირდება.',
    cta: 'გაიგე მეტი სტრესზე',
    art: 'mountains',
  },
  {
    label: 'ჯანსაღი გული',
    text: 'რეგულარული ღრმა დასვენება ეხმარება არტერიულ წნევას და გულ-სისხლძარღვთა სისტემას.',
    cta: 'გაიგე მეტი გულზე',
    art: 'heart',
  },
  {
    label: 'უკეთესი ძილი',
    text: 'დღის განმავლობაში დაგროვილი დაძაბულობა ქრება — დაძინება ადვილდება, ძილი ღრმავდება.',
    cta: 'გაიგე მეტი ძილზე',
    art: 'moon',
  },
  {
    label: 'ჰარმონიული ურთიერთობები',
    text: 'როცა შინაგანად მშვიდი ხარ, უფრო ყურადღებით უსმენ და ნაკლებად რეაგირებ იმპულსურად.',
    cta: 'გაიგე მეტი ურთიერთობებზე',
    art: 'circles',
  },
  {
    label: 'ნათელი გონება',
    text: 'ფოკუსი, მეხსიერება და შემოქმედებითობა იზრდება, როცა გონებას ყოველდღე ეძლევა დასვენება.',
    cta: 'გაიგე მეტი სიცხადეზე',
    art: 'horizon',
  },
];

export function BenefitTabs() {
  const [active, setActive] = useState(0);
  const baseId = useId();

  function selectTab(index: number) {
    setActive(index);
    document.getElementById(`${baseId}-tab-${index}`)?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
  }

  return (
    <section id="why" className="scroll-mt-20 bg-cream-200 py-12 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
        <div
          role="tablist"
          aria-label="რატომ TM"
          className="flex justify-between gap-6 overflow-x-auto px-1 pt-1 pb-1 [scrollbar-width:thin] [scrollbar-color:var(--color-plum-300)_transparent] lg:gap-8"
          onKeyDown={(event) => {
            let next: number;
            switch (event.key) {
              case 'ArrowRight': next = (active + 1) % TABS.length; break;
              case 'ArrowLeft': next = (active - 1 + TABS.length) % TABS.length; break;
              case 'Home': next = 0; break;
              case 'End': next = TABS.length - 1; break;
              default: return;
            }
            event.preventDefault();
            selectTab(next);
            document.getElementById(`${baseId}-tab-${next}`)?.focus({ preventScroll: true });
          }}
        >
          {TABS.map((item, index) => (
            <button
              key={item.label}
              id={`${baseId}-tab-${index}`}
              role="tab"
              type="button"
              aria-selected={index === active}
              aria-controls={`${baseId}-panel-${index}`}
              tabIndex={index === active ? 0 : -1}
              onClick={() => selectTab(index)}
              className={`shrink-0 border-b px-1 pb-3 text-sm leading-relaxed whitespace-nowrap focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-700 lg:text-base ${
                index === active ? 'border-plum-700 text-plum-800' : 'border-transparent text-plum-500 hover:text-plum-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Overlapping panels reserve the tallest panel's space without animating layout. */}
        <div className="mt-7 grid grid-rows-[auto_auto] gap-y-8 sm:mt-8 md:grid-rows-1 md:gap-y-0 lg:mt-10">
          {TABS.map((tab, index) => (
            <div
              key={tab.label}
              id={`${baseId}-panel-${index}`}
              role="tabpanel"
              aria-labelledby={`${baseId}-tab-${index}`}
              aria-hidden={index !== active}
              inert={index !== active}
              tabIndex={index === active ? 0 : -1}
              className={`col-start-1 row-[1/span_2] grid min-w-0 grid-rows-subgrid items-center gap-8 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-plum-700 md:row-[1/span_1] md:grid-cols-2 md:grid-rows-1 md:gap-10 lg:gap-16 ${index === active ? 'visible' : 'invisible'}`}
            >
              <div className="grid min-w-0 content-center gap-6 lg:gap-8">
                <p className="max-w-[28rem] text-xl leading-relaxed font-light text-plum-800 sm:text-[22px] lg:text-2xl">{tab.text}</p>
                <button
                  type="button"
                  disabled
                  className="inline-flex min-h-14 w-full max-w-[19rem] items-center justify-center rounded-full bg-mist-300 px-6 py-4 text-sm leading-6 text-plum-800"
                >
                  {tab.cta}
                </button>
              </div>

              <div className="aspect-square w-full min-w-0 overflow-hidden rounded-2xl [&>img]:size-full [&>img]:object-cover [&>img]:object-center">
                <Artwork variant={tab.art} label={tab.label} className="size-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
