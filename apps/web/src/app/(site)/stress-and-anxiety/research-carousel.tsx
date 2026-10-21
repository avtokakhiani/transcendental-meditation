'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import styles from './research-carousel.module.css';

const RESEARCH = [
  {
    summary: 'კვლევაში მონაწილე ექიმები შემთხვევითი წესით ორ ჯგუფად განაწილდნენ. TM-ის 4-თვიანი პრაქტიკის შემდეგ პროფესიული გადაღლისა და დეპრესიის ნიშნები შემცირდა. საკონტროლო ჯგუფში ექიმებს მსგავსი ცვლილებები არ აღუნიშნავთ.',
    authors: 'Loiselle M, Brown C, Travis F, Gruener G, ...',
    source: 'Effects of Transcendental Meditation on Academic Physician Burnout and ...',
    url: 'https://doi.org/10.1097/CEH.0000000000000472',
  },
  {
    summary: 'ქალი პატიმრები კვლევაში ორ ჯგუფად შემთხვევითი წესით განაწილდნენ. TM-ის ჯგუფში 4 თვეში შემცირდა ტრავმის ნიშნები, შემოჭრილი ფიქრები და ჰიპერაგზნება, მოლოდინის სიაში მყოფ საკონტროლო ჯგუფთან შედარებით.',
    authors: 'Nidich S, Seng A, Compton B, O’Connor T, ...',
    source: 'Transcendental Meditation and reduced trauma symptoms in female inmates: A ...',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5363900/',
  },
  {
    summary: '16 კვლევის მეტაანალიზში TM-მა საკონტროლო ჯგუფებთან შედარებით შეამცირა პიროვნული შფოთვა. ეფექტი უფრო დიდი იყო მაღალი შფოთვის მქონე ჯგუფებში, მათ შორის PTSD-ის მქონე ვეტერანებსა და პატიმრებში.',
    authors: 'Orme-Johnson DW, Barnes VA.',
    source: 'Effects of the Transcendental Meditation Technique on trait anxiety: a meta-analysis ...',
    url: 'https://pubmed.ncbi.nlm.nih.gov/24107199/',
  },
  {
    summary: '146 კვლევის შედეგების მეტაანალიზში TM-ის ეფექტი პიროვნულ შფოთვაზე დაახლოებით ორჯერ მეტი იყო, ვიდრე სხვა მედიტაციისა და რელაქსაციის მეთოდების შემთხვევაში. სხვა ფაქტორთა გათვალისწინების შემდეგაც დასკვნა უცვლელი დარჩა.',
    authors: 'Eppley KR, Abrams AI, Shear J.',
    source: 'Differential effects of relaxation techniques on trait anxiety: a meta-analysis. J Clin ...',
    url: 'https://pubmed.ncbi.nlm.nih.gov/2693491/',
  },
  {
    summary: '3–5 წლის TM პრაქტიკის მქონე ახალგაზრდებში მედიტაციის დროს სისხლში კორტიზოლი შემცირდა და შემდეგაც დაბალი დარჩა. საკონტროლო ჯგუფში ჩვეულებრივი დასვენების დროს ამ ჰორმონის დონის ცვლილება არ დაფიქსირდა.',
    authors: 'Jevning R, Wilson AF, Davidson JM',
    source: 'Adrenocortical activity during meditation. Hormones and Behavior, 10(1), 54-60, 1978',
    url: 'https://pubmed.ncbi.nlm.nih.gov/350747/',
  },
  {
    summary: 'PTSD-ის ან შფოთვის მქონე აშშ-ის მოქმედ სამხედროებში TM-ის ჯგუფს მედიკამენტების დოზა უფრო ხშირად შეუნარჩუნდა ან შეუმცირდა. 6 თვეში ფსიქოლოგიური სიმპტომების სიმძიმეში ჯგუფებს შორის 20.5%-იანი განსხვავება გამოვლინდა.',
    authors: 'Barnes VA, Monto A, Williams JJ, Rigg JL',
    source: 'Impact of Transcendental Meditation on Psychotropic Medication Use Among Activ...',
    url: 'https://pubmed.ncbi.nlm.nih.gov/26741477/',
  },
  {
    summary: 'სხვადასხვა ეთნიკური და რასობრივი უმცირესობის უფროსკლასელებში TM-ის პრაქტიკის შემდეგ შემცირდა ზოგადი ფსიქოლოგიური დისტრესი და შფოთვა. შედეგები იმავე კვლევაში მონაწილე მოსწავლეების საკონტროლო ჯგუფებთან შედარებით უკეთესი იყო.',
    authors: 'Elder C, Nidich S, Colbert R, Hagelin J, Gray...',
    source: 'Reduced psychological distress in racial and ethnic minority students practicing the...',
    url: 'https://scispace.com/papers/reduced-psychological-distress-in-racial-and-ethnic-minority-3fz1fay435',
  },
  {
    summary: 'ქცევითი სირთულეების მქონე მოსწავლეთა სკოლის მასწავლებლებსა და პერსონალში TM-ის პრაქტიკის შემდეგ შემცირდა აღქმული სტრესი, დეპრესიის ნიშნები და პროფესიული გადაღლა. სხვაობა საკონტროლო ჯგუფთან 4 თვის შემდეგ გამოვლინდა.',
    authors: 'Elder C, Nidich S, Moriarty F, Nidich R.',
    source: 'Effect of Transcendental Meditation on employee stress, depression, and burnout.',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3951026/',
  },
];

export function ResearchCarousel() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [{ index, visible }, setPosition] = useState({ index: 0, visible: 1 });

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const updateVisible = () => {
      const count = Number(getComputedStyle(viewport).getPropertyValue('--visible-cards'));
      setPosition((previous) => {
        const nextIndex = Math.min(previous.index, RESEARCH.length - count);
        return previous.visible === count && previous.index === nextIndex
          ? previous
          : { index: nextIndex, visible: count };
      });
    };
    updateVisible();
    const observer = new ResizeObserver(updateVisible);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

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
  }, []);

  const move = (direction: number) => {
    setPosition((previous) => ({
      ...previous,
      index: Math.max(0, Math.min(RESEARCH.length - previous.visible, previous.index + direction)),
    }));
  };

  return (
    <section aria-labelledby="stress-research-carousel-heading" aria-roledescription="კარუსელი" className={styles.section}>
      <div className={styles.content}>
        <h2 id="stress-research-carousel-heading" className={styles.heading}>კვლევები ტრანსცენდენტულ მედიტაციაზე: სტრესი და შფოთვა</h2>
        <div className={styles.carousel}>
          <div className={styles.controlSlot}>
            {index > 0 ? (
              <button
                type="button"
                aria-label="წინა კვლევა"
                aria-controls="stress-research-cards"
                onClick={() => move(-1)}
                className={styles.control}
              >
                <ArrowLeft aria-hidden="true" size={19} strokeWidth={1.5} />
              </button>
            ) : null}
          </div>
          <div
            ref={viewportRef}
            id="stress-research-cards"
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
              {RESEARCH.map((research, cardIndex) => (
                <article
                  key={research.authors}
                  className={styles.card}
                  aria-label={`კვლევა ${cardIndex + 1} / ${RESEARCH.length}`}
                  aria-hidden={cardIndex < index || cardIndex >= index + visible}
                >
                  <p className={styles.summary}>{research.summary}</p>
                  <div className={styles.citation} lang="en">
                    <p className={styles.authors}>{research.authors}</p>
                    <p className={styles.source}>
                      <a href={research.url} target="_blank" rel="noopener noreferrer" tabIndex={cardIndex < index || cardIndex >= index + visible ? -1 : undefined}>
                        {research.source}
                      </a>
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <div className={styles.controlSlot}>
            {index < RESEARCH.length - visible ? (
              <button
                type="button"
                aria-label="შემდეგი კვლევა"
                aria-controls="stress-research-cards"
                onClick={() => move(1)}
                className={styles.control}
              >
                <ArrowRight aria-hidden="true" size={19} strokeWidth={1.5} />
              </button>
            ) : null}
          </div>
        </div>
        <p className="sr-only" aria-live="polite" aria-atomic="true">კვლევები {index + 1}–{index + visible} / {RESEARCH.length}</p>
      </div>
    </section>
  );
}
