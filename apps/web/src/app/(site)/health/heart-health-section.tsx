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
            <p>სამეცნიერო კვლევები მიუთითებს, რომ ტრანსცენდენტული მედიტაციის (TM) რეგულარულმა პრაქტიკამ შესაძლოა ხელი შეუწყოს გულ-სისხლძარღვთა ჯანმრთელობის გაუმჯობესებას. სტრესის შემცირება და ღრმა დასვენება დადებითად შეიძლება აისახოს არტერიულ წნევასა და გულის მუშაობაზე.</p>
            <p>2012 წელს გამოქვეყნებულ რანდომიზებულ კონტროლირებად კვლევაში, რომელშიც გულის კორონარული დაავადების მქონე 201 ადამიანი მონაწილეობდა, TM-ის ჯგუფში დაახლოებით 5.4-წლიანი დაკვირვების განმავლობაში სიკვდილის, გულის შეტევისა და ინსულტის ერთობლივი რისკი საკონტროლო ჯგუფთან შედარებით 48%-ით დაბალი აღმოჩნდა. ეს შედეგი მიუთითებს ტრანსცენდენტული მედიტაციის შესაძლო სარგებელზე გულ-სისხლძარღვთა დაავადებების მეორეული პრევენციისთვის.</p>
          </div>
        </div>
        <figure className={`${research.figure} ${styles.figure}`}>
          <img
            src="/images/tm-heart-health-chart-en.svg"
            width={1007}
            height={1278}
            className={research.chart}
            alt="ინგლისურენოვანი სამეცნიერო დიაგრამა: გულის შეტევის, ინსულტისა და სიკვდილის რისკის შემცირება TM-ის ჯგუფში, კვლევის მითითებით."
            loading="lazy"
          />
        </figure>
      </div>
    </section>
  );
}
