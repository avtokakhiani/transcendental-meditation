import science from '../blog/[slug]/what-is-tm-different.module.css';
import styles from './trait-anxiety-section.module.css';

export function TraitAnxietySection() {
  return (
    <section aria-labelledby="trait-anxiety-heading" className={science.section}>
      <div className={`${science.layout} ${styles.layout}`}>
        <div className={science.copy}>
          <h2 id="trait-anxiety-heading" className={science.heading}>ტრანსცენდენტული მედიტაცია ხასიათობრივი შფოთვის შემცირებაში სხვა მედიტაციის მეთოდებზე უფრო ეფექტურია</h2>
          <div className={science.description}>
            <p>ხასიათობრივი შფოთვა აღწერს, რამდენად შფოთავს ადამიანი ჩვეულებრივ, ყოველდღიურ ცხოვრებაში. ეს განსხვავდება მდგომარეობითი შფოთვისგან, რომელიც აღნიშნავს, რამდენად შფოთიანად ვგრძნობთ თავს კონკრეტულ მომენტში. 146 სხვადასხვა კვლევის მეტაანალიზმა აჩვენა, რომ ტრანსცენდენტული მედიტაციის პრაქტიკა ხასიათობრივი შფოთვის შემცირებაში ორჯერ მეტად ეფექტურია, ვიდრე სხვა რელაქსაციის მეთოდები.</p>
            <p>TM-ის ტექნიკის დამამშვიდებელი ზემოქმედება ნერვულ სისტემაზე ადამიანებს ეხმარება როგორც შფოთვის მართვაში, ისე ტრავმისგან აღდგენაში.</p>
          </div>
        </div>
        <figure className={science.figure}>
          <img
            src="/images/tm-trait-anxiety-reduction-chart-no-title-en.svg"
            width={881}
            height={883}
            className={styles.chart}
            alt="ინგლისურენოვანი სამეცნიერო დიაგრამა: ხასიათობრივი შფოთვის შემცირების შედარება TM-ისა და სხვა მეთოდების შემთხვევაში, ორიგინალური კვლევის მითითებით."
            loading="lazy"
          />
        </figure>
      </div>
    </section>
  );
}
