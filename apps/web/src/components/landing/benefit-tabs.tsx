'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
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
  const tab = TABS[active]!;

  return (
    <section id="why" className="scroll-mt-20 bg-cream-200 py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
        <div
          role="tablist"
          aria-label="რატომ TM"
          className="-mx-4 flex gap-8 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:justify-between sm:px-0"
          onKeyDown={(event) => {
            if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
            const next = (active + (event.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length;
            setActive(next);
            document.getElementById(`${baseId}-tab-${next}`)?.focus();
          }}
        >
          {TABS.map((item, index) => (
            <button
              key={item.label}
              id={`${baseId}-tab-${index}`}
              role="tab"
              type="button"
              aria-selected={index === active}
              aria-controls={`${baseId}-panel`}
              tabIndex={index === active ? 0 : -1}
              onClick={() => setActive(index)}
              className={`shrink-0 border-b pb-3 text-lg whitespace-nowrap transition ${
                index === active ? 'border-plum-700 text-plum-800' : 'border-transparent text-plum-400 hover:text-plum-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div
          id={`${baseId}-panel`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${active}`}
          className="mt-12 grid items-center gap-10 md:grid-cols-[1fr_1fr_auto] md:gap-12"
        >
          <div key={tab.label} className="animate-[fade-in_500ms_ease-out]">
            <p className="text-[1.9rem] leading-snug font-light text-plum-800">{tab.text}</p>
            <Link
              href="/blog"
              className="mt-10 inline-flex rounded-full bg-mist-300 px-10 py-4 text-[15px] text-plum-800 transition hover:bg-mist-400"
            >
              {tab.cta}
            </Link>
          </div>

          <div className="aspect-square overflow-hidden rounded-3xl">
            <Artwork key={tab.art} variant={tab.art} label={tab.label} className="size-full animate-[fade-in_500ms_ease-out]" />
          </div>

          <button
            type="button"
            onClick={() => setActive((active + 1) % TABS.length)}
            aria-label="შემდეგი"
            className="hidden size-12 place-items-center rounded-full border border-dotted border-plum-500 text-plum-700 transition hover:bg-cream-100 md:grid"
          >
            <ArrowRight aria-hidden="true" className="size-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
