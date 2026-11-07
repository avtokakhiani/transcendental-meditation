import research from '@/components/research-layout.module.css';
import styles from './what-is-tm-different.module.css';

export function WhatIsTmDifferent() {
  return (
    <section aria-labelledby="tm-different-heading" className={research.section}>
      <div className={research.layout}>
        <div className={styles.copy}>
          <h2 id="tm-different-heading" className={styles.heading}>რით განსხვავდება ტრანსცენდენტული მედიტაცია?</h2>
          <div className={styles.description}>
            <p>სხვა მედიტაციური მიდგომებისგან განსხვავებით, რომლებშიც გონებრივი აქტივობა ხშირად აზროვნების დონეზე რჩება, ტრანსცენდენტული მედიტაცია გონებას საშუალებას აძლევს, ბუნებრივად ჩაწყნარდეს, გასცდეს აზროვნების პროცესს და შინაგანი სიმშვიდის უფრო ღრმა მდგომარეობა განიცადოს.</p>
            <p>ტრანსცენდენტული მედიტაციის დროს ვლინდება ტვინის ფუნქციონირების გარკვეული თავისებურებები, რომლებიც სამეცნიერო კვლევებშია შესწავლილი. ტექნიკის ერთ-ერთი მთავარი განმასხვავებელი ნიშანი ისაა, რომ იგი არ მოითხოვს ძალისხმევას, ყურადღების კონცენტრაციას ან გონების კონტროლს.</p>
          </div>
        </div>
        <figure className={research.figure}>
          <p id="tm-comparison-scroll-hint" className={styles.scrollHint}>
            სრული დიაგრამის სანახავად გადაასრიალეთ ჰორიზონტალურად <span aria-hidden="true">↔</span>
          </p>
          <div
            className={styles.chartViewport}
            role="region"
            aria-label="მედიტაციის მეთოდების შედარების დიაგრამა"
            aria-describedby="tm-comparison-scroll-hint"
            tabIndex={0}
          >
            <img
              className={`${research.chart} ${styles.chart}`}
              src="/images/meditation-eeg-comparison-en.svg"
              width={2423}
              height={1239}
              alt="TM-ის წყაროს ინგლისურენოვანი დიაგრამა: მედიტაციის მიდგომების, ტვინის აქტივობის ილუსტრაციებისა და EEG ტალღების შედარება."
              loading="lazy"
            />
          </div>
        </figure>
      </div>
    </section>
  );
}
