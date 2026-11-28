import research from '@/components/research-layout.module.css';
import science from '../blog/[slug]/what-is-tm-different.module.css';
import styles from './blood-pressure-section.module.css';

export function BloodPressureSection() {
  return (
    <section aria-labelledby="blood-pressure-heading" className={research.section}>
      <div className={research.layout}>
        <div className={`${science.copy} ${styles.copy}`}>
          <h2 id="blood-pressure-heading" className={science.heading}>ტრანსცენდენტული მედიტაცია ხელს უწყობს მაღალი არტერიული წნევის შემცირებას</h2>
          <div className={science.description}>
            <p>მაღალი არტერიული წნევა (ჰიპერტენზია) გულ-სისხლძარღვთა დაავადებების ერთ-ერთი მნიშვნელოვანი რისკფაქტორია. სამეცნიერო მტკიცებულებები ადასტურებს, რომ ქრონიკული ფსიქოლოგიური სტრესი ხელს უწყობს ჰიპერტენზიის განვითარებას.</p>
            <p>2007 წელს გამოქვეყნებულ სისტემურ მიმოხილვაში გაანალიზდა სტრესის შემცირებისა და არტერიული წნევის შესახებ 107 სამეცნიერო კვლევა, რომელთაგან 17 რანდომიზებული კონტროლირებადი კვლევა მეტაანალიზში შევიდა. შედეგებმა აჩვენა, რომ ტრანსცენდენტული მედიტაციის პრაქტიკა დაკავშირებული იყო სისტოლური არტერიული წნევის საშუალოდ 5 მმ ვწყ. სვ.-ით, ხოლო დიასტოლური წნევის 2,8 მმ ვწყ. სვ.-ით შემცირებასთან. მედიტაციისა და რელაქსაციის სხვა მეთოდების, ბიოუკუკავშირისა და სტრესის მართვის ტექნიკების შემთხვევაში სტატისტიკურად მნიშვნელოვანი ეფექტი არ გამოვლენილა.</p>
          </div>
        </div>
        <figure className={`${research.figure} ${styles.figure}`}>
          <img
            src="/images/tm-blood-pressure-chart-en.svg"
            width={2123}
            height={1589}
            className={`${research.chart} ${styles.chart}`}
            alt="ინგლისურენოვანი სამეცნიერო დიაგრამა: არტერიული წნევის შემცირების შედარება TM-ისა და სტრესის შემცირების სხვა მეთოდების დროს, კვლევის მითითებით."
            loading="lazy"
          />
        </figure>
      </div>
    </section>
  );
}
