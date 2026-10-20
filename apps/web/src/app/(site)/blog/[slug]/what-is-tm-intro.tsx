import styles from './what-is-tm-intro.module.css';

export function WhatIsTmIntro({ imageUrl }: { imageUrl: string }) {
  return (
    <>
      <section
        aria-labelledby="tm-intro-heading"
        className={styles.intro}
        style={{ backgroundImage: `url("${imageUrl}")` }}
      >
        <div className={styles.content}>
          <h1 id="tm-intro-heading" className={styles.heading}>რა არის ტრანსცენდენტული მედიტაცია?</h1>
        </div>
      </section>
      <section aria-label="შესავალი" className={styles.continuation}>
        <div className={styles.continuationCopy}>
          <p>ტრანსცენდენტული მედიტაცია (TM™) არის მარტივი, ბუნებრივი ტექნიკა, რომელიც ძალისხმევის გარეშე საშუალებას გვაძლევს მივაღწიოთ ღრმა დასვენებისა და შინაგანი სიმშვიდის მდგომარეობას. სხვა მედიტაციური მიდგომებისგან განსხვავებით, ის არ მოითხოვს ყურადღების კონცენტრაციას ან გონების კონტროლს.</p>
          <p>ტექნიკის შესწავლა ხდება ინდივიდუალურად, კვალიფიციურ მასწავლებელთან. მისი დადებითი გავლენა ფსიქიკურ და ფიზიკურ ჯანმრთელობაზე, ასევე ორგანიზმის ფიზიოლოგიურ ფუნქციონირებაზე, დადასტურებულია <span className={styles.noWrap}>650-ზე</span> მეტი სამეცნიერო კვლევით.</p>
          <p>რაც მთავარია, ტრანსცენდენტული მედიტაციის პრაქტიკა მარტივი, ბუნებრივი და სასიამოვნოა.</p>
        </div>
      </section>
    </>
  );
}
