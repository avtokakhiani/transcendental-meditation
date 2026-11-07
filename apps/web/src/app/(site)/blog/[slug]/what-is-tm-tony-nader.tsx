import Image from 'next/image';
import styles from './what-is-tm-maharishi.module.css';
import portrait from './what-is-tm-tony-nader.module.css';

export function WhatIsTmTonyNader() {
  return (
    <section aria-labelledby="tm-tony-nader-heading" className={styles.section}>
      <div className={`${styles.text} ${portrait.text}`}>
        <div className={styles.copy}>
          <h2 id="tm-tony-nader-heading" className={styles.heading}>დოქტორი ტონი ნეიდერი</h2>
          <p className={styles.subtitle}>მაჰარიში მაჰეშ იოგის მიერ შერჩეული მემკვიდრე და ტრანსცენდენტული მედიტაციის საერთაშორისო ორგანიზაციების ხელმძღვანელი</p>
          <div className={styles.description}>
            <p>მაჰარიშიმ თავის მემკვიდრედ აირჩია დოქტორი ტონი ნეიდერი — MIT-სა და ჰარვარდში განათლებამიღებული ექიმი და ვედური ცოდნის ერთ-ერთი გამორჩეული მკვლევარი.</p>
            <p>დღეს დოქტორი ნეიდერი ხელმძღვანელობს ტრანსცენდენტული მედიტაციის საერთაშორისო ორგანიზაციებს და მათ საგანმანათლებლო და სამეცნიერო საქმიანობას 100-ზე მეტ ქვეყანაში. მაჰარიშის ხედვის გაგრძელებით, ის ცნობიერების შესახებ ცოდნას მსოფლიოს ახალ აუდიტორიებს უზიარებს და ხელს უწყობს ადამიანის პოტენციალის უფრო ღრმა გააზრებას.</p>
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
