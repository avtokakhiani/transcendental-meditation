import styles from './what-is-tm-intro.module.css';

import benefitHero from '@/components/site/benefit-hero.module.css';

export function WhatIsTmIntro({ imageUrl }: { imageUrl: string }) {
  return (
    <>
      <section
        aria-labelledby="tm-intro-heading"
        className={`${styles.intro} ${benefitHero.hero} ${benefitHero.introduction}`}
        style={{ backgroundImage: `url("${imageUrl}")` }}
      >
        <div className={styles.content}>
          <h1 id="tm-intro-heading" className={styles.heading}>რა არის ტრანსცენდენტული მედიტაცია?</h1>
        </div>
      </section>
      <section aria-label="შესავალი" className={styles.continuation}>
        <div className={styles.continuationCopy}>
          <p>ტრანსცენდენტული მედიტაცია (TM™) მარტივი და ბუნებრივი ტექნიკაა, რომელიც ძალისხმევის გარეშე ღრმა დასვენებისა და შინაგანი სიმშვიდის მიღწევის საშუალებას გვაძლევს. სხვა მედიტაციური მიდგომებისგან განსხვავებით, ის არ მოითხოვს ყურადღების კონცენტრაციას ან გონების კონტროლს.</p>
          <p>ტრანსცენდენტული მედიტაციის ტექნიკის შესწავლა ინდივიდუალურად, კვალიფიციური მასწავლებლის ხელმძღვანელობით მიმდინარეობს. მისი დადებითი გავლენა ფიზიკურ და ფსიქიკურ ჯანმრთელობაზე, ასევე ორგანიზმის ფიზიოლოგიურ ფუნქციონირებაზე, დასტურდება <span className={styles.noWrap}>650-ზე</span> მეტი სამეცნიერო კვლევით.</p>
          <p>რაც მთავარია, თავად მედიტაციის პრაქტიკა მარტივი, ბუნებრივი და სასიამოვნოა.</p>
        </div>
      </section>
    </>
  );
}
