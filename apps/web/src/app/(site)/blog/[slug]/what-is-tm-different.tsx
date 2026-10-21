import styles from './what-is-tm-different.module.css';

export function WhatIsTmDifferent() {
  return (
    <section aria-labelledby="tm-different-heading" className={styles.section}>
      <div className={styles.layout}>
        <div className={styles.copy}>
          <h2 id="tm-different-heading" className={styles.heading}>რით განსხვავდება ტრანსცენდენტული მედიტაცია?</h2>
          <div className={styles.description}>
            <p>ტრანსცენდენტული მედიტაცია სხვა მედიტაციური მეთოდებისგან განსხვავდება. სხვა მიდგომები, როგორც წესი, გონებრივ აქტივობას გონების ზედაპირულ დონეზე ინარჩუნებს. ამისგან განსხვავებით, TM-ის პრაქტიკას ახასიათებს გონებრივი აქტივობის ბუნებრივი ჩაწყნარება, აზროვნების პროცესის ტრანსცენდირება და ყურადღების შინაგანად მიმართვა.</p>
            <p>ტრანსცენდენტული მედიტაციის პრაქტიკის დროს შეიძლება გამოვლინდეს ტვინის ფუნქციონირების განსხვავებული მახასიათებლები, რომლებიც სამეცნიერო კვლევებშია შესწავლილი. TM-ის ერთ-ერთი მთავარი თავისებურება ისაა, რომ ტექნიკა არ მოითხოვს ძალისხმევას, ყურადღების კონცენტრაციას ან გონების კონტროლს.</p>
          </div>
        </div>
        <figure className={styles.figure}>
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
              className={styles.chart}
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
