import research from '@/components/research-layout.module.css';
import science from '../blog/[slug]/what-is-tm-different.module.css';
import placement from './heart-health-section.module.css';

export function BloodPressureSection() {
  return (
    <section aria-labelledby="blood-pressure-heading" className={research.section}>
      <div className={research.layout}>
        <div className={`${science.copy} ${placement.copy}`}>
          <h2 id="blood-pressure-heading" className={science.heading}>ტრანსცენდენტული მედიტაცია ხელს უწყობს მაღალი არტერიული წნევის შემცირებას</h2>
          <div className={science.description}>
            <p>მაღალი არტერიული წნევა (ჰიპერტენზია) გულ-სისხლძარღვთა დაავადებების ერთ-ერთი მნიშვნელოვანი რისკფაქტორია. სამეცნიერო მონაცემები მიუთითებს, რომ ქრონიკული ფსიქოლოგიური სტრესი შესაძლოა ხელს უწყობდეს ჰიპერტენზიის განვითარებასა და არტერიული წნევის მატებას.</p>
            <p>2007 წელს გამოქვეყნებულმა სისტემურმა მიმოხილვამ სტრესის შემცირებისა და არტერიული წნევის შესახებ 107 კვლევა განიხილა, რომელთაგან 17 რანდომიზებული კვლევა მეტაანალიზში შევიდა. შედეგებმა აჩვენა, რომ ტრანსცენდენტული მედიტაციის (TM) პრაქტიკა დაკავშირებული იყო სისტოლური არტერიული წნევის საშუალოდ 5 მმ ვწყ. სვ.-ით, ხოლო დიასტოლური წნევის 2.8 მმ ვწყ. სვ.-ით შემცირებასთან. შესწავლილი სხვა სტრესის შემცირების მეთოდების შემთხვევაში სტატისტიკურად მნიშვნელოვანი ცვლილება არ გამოვლენილა.</p>
          </div>
        </div>
        <figure className={`${research.figure} ${placement.figure}`}>
          <img
            src="/images/tm-blood-pressure-chart-en.svg"
            width={2123}
            height={1589}
            className={research.chart}
            alt="ინგლისურენოვანი სამეცნიერო დიაგრამა: არტერიული წნევის შემცირების შედარება TM-ისა და სტრესის შემცირების სხვა მეთოდების დროს, კვლევის მითითებით."
            loading="lazy"
          />
        </figure>
      </div>
    </section>
  );
}
