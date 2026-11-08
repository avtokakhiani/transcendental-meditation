import research from '@/components/research-layout.module.css';
import science from '../blog/[slug]/what-is-tm-different.module.css';
import styles from './heart-health-section.module.css';

export function HeartHealthSection() {
  return (
    <section aria-labelledby="heart-health-heading" className={research.section}>
      <div className={research.layout}>
        <div className={`${science.copy} ${styles.copy}`}>
          <h2 id="heart-health-heading" className={science.heading}>ტრანსცენდენტული მედიტაცია ხელს უწყობს გულის ჯანმრთელობის გაუმჯობესებას</h2>
          <div className={science.description}>
            <p>სამეცნიერო კვლევები ადასტურებს, რომ ტრანსცენდენტული მედიტაციის რეგულარული პრაქტიკა ხელს უწყობს გულ-სისხლძარღვთა ჯანმრთელობის გაუმჯობესებას. სტრესის შემცირება და ღრმა დასვენება დადებითად მოქმედებს არტერიულ წნევასა და გულის ფუნქციონირებაზე, რაც ხელს უწყობს გულ-სისხლძარღვთა დაავადებების რისკის შემცირებას.</p>
            <p>2012 წელს გამოქვეყნებულ რანდომიზებულ კონტროლირებად კვლევაში, რომელშიც გულის კორონარული დაავადების მქონე 201 ადამიანი მონაწილეობდა, საშუალოდ 5,4-წლიანი დაკვირვების განმავლობაში ტრანსცენდენტული მედიტაციის ჯგუფში სიკვდილის, გულის შეტევისა და ინსულტის ერთობლივი რისკი საკონტროლო ჯგუფთან შედარებით 48%-ით დაბალი აღმოჩნდა. კვლევის შედეგებმა აჩვენა ტრანსცენდენტული მედიტაციის მნიშვნელოვანი სარგებელი გულ-სისხლძარღვთა დაავადებების მქონე ადამიანებისთვის.</p>
          </div>
        </div>
        <figure className={`${research.figure} ${styles.figure}`}>
          <img
            src="/images/tm-heart-health-chart-en.svg"
            width={1007}
            height={1278}
            className={`${research.chart} ${styles.chart}`}
            alt="ინგლისურენოვანი სამეცნიერო დიაგრამა: გულის შეტევის, ინსულტისა და სიკვდილის რისკის შემცირება TM-ის ჯგუფში, კვლევის მითითებით."
            loading="lazy"
          />
        </figure>
      </div>
    </section>
  );
}
