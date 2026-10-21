import Image from 'next/image';
import styles from './what-is-tm-maharishi.module.css';
import portrait from './what-is-tm-tony-nader.module.css';

export function WhatIsTmTonyNader() {
  return (
    <section aria-labelledby="tm-tony-nader-heading" className={styles.section}>
      <div className={styles.text}>
        <div className={styles.copy}>
          <h2 id="tm-tony-nader-heading" className={styles.heading}>დოქტორი ტონი ნეიდერი</h2>
          <p className={styles.subtitle}>მაჰარიში მაჰეშ იოგის მიერ შერჩეული ტრანსცენდენტული მედიტაციის საერთაშორისო ორგანიზაციის ხელმძღვანელად</p>
          <div className={styles.description}>
            <p>მაჰარიშიმ თავის მემკვიდრედ აირჩია დოქტორი ტონი ნეიდერი — MIT-სა და ჰარვარდში განათლებამიღებული ექიმი და ვედური ცოდნის ერთ-ერთი გამორჩეული მკვლევარი მსოფლიოში.</p>
            <p>დღეს დოქტორი ნეიდერი ხელმძღვანელობს ტრანსცენდენტული მედიტაციის საერთაშორისო ორგანიზაციებს, მათ პროგრამებს, კვლევასა და საგანმანათლებლო საქმიანობას 100-ზე მეტ ქვეყანაში. მაჰარიშის ხედვის გაგრძელებით, ის ცნობიერების მეცნიერებას მსოფლიოს ახალ აუდიტორიებს უზიარებს და ადამიანის პოტენციალის უფრო ღრმა გაგებაში გვეხმარება.</p>
          </div>
        </div>
      </div>
      <div className={`${styles.portrait} ${portrait.portrait}`}>
        <Image
          src="/images/dr-tony-nader-portrait.jpeg"
          alt="დოქტორი ტონი ნეიდერი ფანჯარასთან, გვერდულად გადაღებული პორტრეტი."
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className={`${styles.image} ${portrait.image}`}
        />
      </div>
    </section>
  );
}
