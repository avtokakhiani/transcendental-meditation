import science from '../blog/[slug]/what-is-tm-different.module.css';
import styles from './cortisol-section.module.css';

export function CortisolSection() {
  return (
    <section aria-labelledby="cortisol-heading" className={science.section}>
      <div className={`${science.layout} ${styles.layout}`}>
        <div className={`${science.copy} ${styles.copy}`}>
          <h2 id="cortisol-heading" className={science.heading}>ტრანსცენდენტული მედიტაციის პრაქტიკა და კორტიზოლის დონის 30%-ით შემცირება</h2>
          <div className={science.description}>
            <p>სტრესის დროს თავის ტვინის ნუშისებრი სხეული (ამიგდალა), რომელიც საფრთხეზე რეაგირებაში მონაწილეობს, ააქტიურებს ორგანიზმის სტრესულ რეაქციას და ხელს უწყობს კორტიზოლის გამოყოფას. ქრონიკული სტრესი დაკავშირებულია კორტიზოლის დონის ხანგრძლივ მატებასთან, რასაც შესაძლოა თან ახლდეს შფოთვა, დეპრესიული სიმპტომები და გაღიზიანებადობა.</p>
            <p>კვლევებში დაფიქსირებულია, რომ ტრანსცენდენტული მედიტაციის რეგულარული პრაქტიკა შეიძლება ხელს უწყობდეს კორტიზოლის დონის შემცირებას და ორგანიზმის სტრესული რეაქციის რეგულირებას.</p>
          </div>
        </div>
        <figure className={`${science.figure} ${styles.figure}`}>
          <img
            src="/images/tm-cortisol-reduction-chart-en.svg"
            width={993}
            height={1130}
            className={`${styles.chart} ${styles.smallerChart}`}
            alt="ინგლისურენოვანი სამეცნიერო დიაგრამა: პლაზმის კორტიზოლის ცვლილება საკონტროლო და TM ჯგუფებში, ორიგინალური მონაცემებითა და სამეცნიერო მითითებით."
            loading="lazy"
          />
        </figure>
      </div>
    </section>
  );
}
