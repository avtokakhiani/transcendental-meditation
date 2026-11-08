'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { externalLinkProps } from '@/lib/links';
import styles from './research-carousel.module.css';

const RESEARCH = [
  {
    summary: 'ექიმებში ტრანსცენდენტული მედიტაციის პრაქტიკამ შეამცირა პროფესიული გადაღლისა და დეპრესიის სიმპტომები, ხოლო საკონტროლო ჯგუფში მსგავსი გაუმჯობესება არ გამოვლენილა.',
    authors: 'Loiselle M, Brown C, Travis F, Gruener G, ...',
    source: 'Effects of Transcendental Meditation on Academic Physician Burnout and ...',
    url: 'https://doi.org/10.1097/CEH.0000000000000472',
  },
  {
    summary: 'რანდომიზებულ კონტროლირებად კვლევაში ტრანსცენდენტული მედიტაციის პრაქტიკამ მნიშვნელოვნად შეამცირა ტრავმასთან დაკავშირებული სიმპტომები, მათ შორის აკვიატებული მოგონებები და მომატებული აგზნებადობა.',
    authors: 'Nidich S, Seng A, Compton B, O’Connor T, ...',
    source: 'Transcendental Meditation and reduced trauma symptoms in female inmates: A ...',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5363900/',
  },
  {
    summary: '16 კვლევის მეტაანალიზმა აჩვენა, რომ ტრანსცენდენტულმა მედიტაციამ სხვა მიდგომებთან შედარებით მნიშვნელოვნად შეამცირა ხასიათობრივი შფოთვა, განსაკუთრებით PTSD-ის მქონე ვეტერანებსა და პატიმრებში.',
    authors: 'Orme-Johnson DW, Barnes VA.',
    source: 'Effects of the Transcendental Meditation Technique on trait anxiety: a meta-analysis ...',
    url: 'https://pubmed.ncbi.nlm.nih.gov/24107199/',
  },
  {
    summary: '146 კვლევის მეტაანალიზმა აჩვენა, რომ ტრანსცენდენტული მედიტაცია ხასიათობრივი შფოთვის შემცირებაში ორჯერ მეტად ეფექტური აღმოჩნდა, ვიდრე სხვა მეთოდები.',
    authors: 'Eppley KR, Abrams AI, Shear J.',
    source: 'Differential effects of relaxation techniques on trait anxiety: a meta-analysis. J Clin ...',
    url: 'https://pubmed.ncbi.nlm.nih.gov/2693491/',
  },
  {
    summary: 'ტრანსცენდენტული მედიტაციის ხანგრძლივი პრაქტიკის მქონე ადამიანებში მედიტაციის დროს კორტიზოლის დონე მნიშვნელოვნად შემცირდა, ხოლო საკონტროლო ჯგუფში დასვენებისას ცვლილება არ გამოვლენილა.',
    authors: 'Jevning R, Wilson AF, Davidson JM',
    source: 'Adrenocortical activity during meditation. Hormones and Behavior, 10(1), 54-60, 1978',
    url: 'https://pubmed.ncbi.nlm.nih.gov/350747/',
  },
  {
    summary: 'PTSD-ის ან შფოთვის მქონე აშშ-ის მოქმედ სამხედრო მოსამსახურეებში ტრანსცენდენტული მედიტაციის პრაქტიკამ შეამცირა მედიკამენტების გამოყენება და ფსიქოლოგიური სიმპტომების სიმძიმე.',
    authors: 'Barnes VA, Monto A, Williams JJ, Rigg JL',
    source: 'Impact of Transcendental Meditation on Psychotropic Medication Use Among Activ...',
    url: 'https://pubmed.ncbi.nlm.nih.gov/26741477/',
  },
  {
    summary: 'სხვადასხვა რასობრივი და ეთნიკური უმცირესობის წარმომადგენელ უფროსკლასელებში ტრანსცენდენტული მედიტაციის პრაქტიკამ საკონტროლო ჯგუფებთან შედარებით შეამცირა ფსიქოლოგიური დისტრესი და შფოთვა.',
    authors: 'Elder C, Nidich S, Colbert R, Hagelin J, Gray...',
    source: 'Reduced psychological distress in racial and ethnic minority students practicing the...',
    url: 'https://scispace.com/papers/reduced-psychological-distress-in-racial-and-ethnic-minority-3fz1fay435',
  },
  {
    summary: 'ქცევითი სირთულეების მქონე მოსწავლეებთან მომუშავე სკოლის მასწავლებლებსა და პერსონალში ტრანსცენდენტული მედიტაციის პრაქტიკამ მნიშვნელოვნად შეამცირა აღქმული სტრესი, დეპრესიის სიმპტომები და პროფესიული გადაღლა.',
    authors: 'Elder C, Nidich S, Moriarty F, Nidich R.',
    source: 'Effect of Transcendental Meditation on employee stress, depression, and burnout.',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3951026/',
  },
];

interface ResearchCard {
  summary: string;
  authors: string;
  source: string;
  url: string;
}

interface ResearchCarouselProps {
  research?: readonly ResearchCard[];
  heading?: string;
  idPrefix?: string;
  sourceClassName?: string;
  cardHeightReference?: readonly string[];
}

export function ResearchCarousel({
  research = RESEARCH,
  heading = 'კვლევები ტრანსცენდენტულ მედიტაციაზე: სტრესი და შფოთვა',
  idPrefix = 'stress',
  sourceClassName,
  cardHeightReference,
}: ResearchCarouselProps = {}) {
  const headingId = `${idPrefix}-research-carousel-heading`;
  const cardsId = `${idPrefix}-research-cards`;
  const total = research.length;
  const viewportRef = useRef<HTMLDivElement>(null);
  const [{ index, visible }, setPosition] = useState({ index: 0, visible: 1 });

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const updateVisible = () => {
      const count = Number(getComputedStyle(viewport).getPropertyValue('--visible-cards'));
      setPosition((previous) => {
        const nextIndex = Math.min(previous.index, research.length - count);
        return previous.visible === count && previous.index === nextIndex
          ? previous
          : { index: nextIndex, visible: count };
      });
    };
    updateVisible();
    const observer = new ResizeObserver(updateVisible);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [research.length]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    let disposed = false;
    const alignCitations = () => {
      // Measure all cards so navigation cannot change the shared row heights.
      const cards = Array.from(viewport.querySelectorAll('article'));
      const tallest = (selector: string) => Math.ceil(Math.max(0, ...cards.map((card) =>
        card.querySelector(selector)?.getBoundingClientRect().height ?? 0,
      )));
      viewport.style.setProperty('--summary-height', `${tallest(':scope > p')}px`);
      viewport.style.setProperty('--authors-height', `${tallest(':scope > div > p:first-child')}px`);
      viewport.style.setProperty('--source-height', `${tallest(':scope > div > p:last-child')}px`);
      const firstCard = cards[0];
      if (cardHeightReference && firstCard) {
        // Measure the prior copy offscreen so editing or clamping text cannot shrink the cards.
        const measurement = document.createElement('div');
        measurement.style.cssText = 'position:fixed;left:-100000px;top:0;visibility:hidden;pointer-events:none';
        measurement.setAttribute('aria-hidden', 'true');
        document.body.append(measurement);
        try {
          const heights = cards.map((card, index) => {
            const clone = card.cloneNode(true) as HTMLElement;
            clone.style.width = `${card.getBoundingClientRect().width}px`;
            clone.style.gridTemplateRows = 'auto auto';
            const citation = clone.querySelector(':scope > div') as HTMLElement;
            citation.style.gridTemplateRows = 'auto auto';
            const summary = clone.querySelector(':scope > p') as HTMLElement;
            summary.textContent = cardHeightReference[index] ?? research[index]?.summary ?? '';
            const source = citation.lastElementChild as HTMLElement;
            source.style.display = 'block';
            source.style.webkitLineClamp = 'unset';
            measurement.append(clone);
            return [summary, citation.firstElementChild!, source].map((element) => element.getBoundingClientRect().height);
          });
          const cardStyle = getComputedStyle(firstCard);
          const citationStyle = getComputedStyle(firstCard.querySelector(':scope > div')!);
          const rowsHeight = [0, 1, 2].reduce((sum, row) => sum + Math.ceil(Math.max(...heights.map((height) => height[row] ?? 0))), 0);
          const spacing = [cardStyle.paddingTop, cardStyle.paddingBottom, cardStyle.rowGap, citationStyle.rowGap]
            .reduce((sum, value) => sum + parseFloat(value), 0);
          viewport.style.setProperty('--card-min-height', `${rowsHeight + spacing}px`);
        } finally {
          measurement.remove();
        }
      }
    };
    alignCitations();
    void document.fonts.ready.then(() => {
      if (!disposed) alignCitations();
    });
    const observer = new ResizeObserver(alignCitations);
    observer.observe(viewport);
    return () => {
      disposed = true;
      observer.disconnect();
    };
  }, [research, cardHeightReference]);

  const move = (direction: number) => {
    setPosition((previous) => ({
      ...previous,
      index: Math.max(0, Math.min(research.length - previous.visible, previous.index + direction)),
    }));
  };

  return (
    <section aria-labelledby={headingId} aria-roledescription="კარუსელი" className={styles.section}>
      <div className={styles.content}>
        <h2 id={headingId} className={styles.heading}>{heading}</h2>
        <div className={styles.carousel}>
          <div className={styles.controlSlot}>
            {index > 0 ? (
              <button
                type="button"
                aria-label="წინა კვლევა"
                aria-controls={cardsId}
                onClick={() => move(-1)}
                className={styles.control}
              >
                <ArrowLeft aria-hidden="true" size={19} strokeWidth={1.5} />
              </button>
            ) : null}
          </div>
          <div
            ref={viewportRef}
            id={cardsId}
            className={styles.viewport}
            role="group"
            aria-label="კვლევების ბარათები"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                event.preventDefault();
                move(event.key === 'ArrowLeft' ? -1 : 1);
              }
            }}
          >
            <div className={styles.track} style={{ transform: `translateX(calc(${index} * -1 * (100% + var(--card-gap)) / var(--visible-cards)))` }}>
              {research.map((research, cardIndex) => (
                <article
                  key={research.url}
                  className={styles.card}
                  aria-label={`კვლევა ${cardIndex + 1} / ${total}`}
                  aria-hidden={cardIndex < index || cardIndex >= index + visible}
                >
                  <p className={styles.summary}>{research.summary}</p>
                  <div className={styles.citation} lang="en">
                    <p className={styles.authors}>{research.authors}</p>
                    <p className={sourceClassName ? `${styles.source} ${sourceClassName}` : styles.source}>
                      <a href={research.url} {...externalLinkProps(research.url)} tabIndex={cardIndex < index || cardIndex >= index + visible ? -1 : undefined}>
                        {research.source}
                      </a>
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <div className={styles.controlSlot}>
            {index < research.length - visible ? (
              <button
                type="button"
                aria-label="შემდეგი კვლევა"
                aria-controls={cardsId}
                onClick={() => move(1)}
                className={styles.control}
              >
                <ArrowRight aria-hidden="true" size={19} strokeWidth={1.5} />
              </button>
            ) : null}
          </div>
        </div>
        <p className="sr-only" aria-live="polite" aria-atomic="true">კვლევები {index + 1}–{index + visible} / {research.length}</p>
      </div>
    </section>
  );
}
