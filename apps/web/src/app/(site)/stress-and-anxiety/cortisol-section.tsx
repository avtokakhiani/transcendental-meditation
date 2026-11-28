import research from '@/components/research-layout.module.css';
import science from '../blog/[slug]/what-is-tm-different.module.css';
import styles from './cortisol-section.module.css';
import chartStyles from './research-chart-sizing.module.css';

export function CortisolSection() {
  return (
    <section aria-labelledby="cortisol-heading" className={research.section}>
      <div className={research.layout}>
        <div className={`${science.copy} ${styles.copy}`}>
          <h2 id="cortisol-heading" className={science.heading}>ტრანსცენდენტული მედიტაციის პრაქტიკა კორტიზოლის დონეს 30%-ით ამცირებს</h2>
          <div className={science.description}>
            <p>სტრესის დროს თავის ტვინის ნუშისებრი სხეული (ამიგდალა), რომელიც საფრთხეზე რეაგირებაში მონაწილეობს, ააქტიურებს ორგანიზმის სტრესულ რეაქციას და ხელს უწყობს სტრესის ჰორმონის — კორტიზოლის — გამოყოფას. ქრონიკული სტრესი დაკავშირებულია კორტიზოლის დონის ხანგრძლივ მატებასთან, რასაც ხშირად თან ახლავს შფოთვა, დეპრესიული სიმპტომები და გაღიზიანებადობა.</p>
            <p>ტრანსცენდენტული მედიტაციის რეგულარული პრაქტიკა ხელს უწყობს კორტიზოლის დონის შემცირებასა და ორგანიზმში ჰორმონალური ბალანსის შენარჩუნებას.</p>
          </div>
        </div>
        <figure className={`${research.figure} ${styles.figure} ${chartStyles.cortisolFigure}`}>
          <img
            src="/images/tm-cortisol-reduction-chart-en.svg"
            width={993}
            height={1130}
            className={`${research.chart} ${chartStyles.cortisolChart}`}
            alt="ინგლისურენოვანი სამეცნიერო დიაგრამა: პლაზმის კორტიზოლის ცვლილება საკონტროლო და TM ჯგუფებში, ორიგინალური მონაცემებითა და სამეცნიერო მითითებით."
            loading="lazy"
          />
        </figure>
      </div>
    </section>
  );
}
