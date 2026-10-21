import styles from './what-is-tm-different.module.css';
import mirrored from './what-is-tm-restful-alertness.module.css';

export function WhatIsTmRestfulAlertness() {
  return (
    <section aria-labelledby="tm-restful-alertness-heading" className={styles.section}>
      <div className={styles.layout}>
        <div className={`${styles.copy} ${mirrored.copy}`}>
          <h2 id="tm-restful-alertness-heading" className={styles.heading}>ტრანსცენდენტული მედიტაცია — ღრმა დასვენებისა და სიფხიზლის უნიკალური მდგომარეობა</h2>
          <div className={styles.description}>
            <p>ბოლო ათწლეულების განმავლობაში ჩატარებული კვლევები მიუთითებს, რომ ტრანსცენდენტული მედიტაციის პრაქტიკისას შეიძლება წარმოიქმნას განსაკუთრებული ფიზიოლოგიური მდგომარეობა, რომლის დროსაც სხეული ღრმად ისვენებს, ხოლო გონება ფხიზლად რჩება.</p>
            <p>ამ მდგომარეობას ახასიათებს სუნთქვის სიხშირის შემცირება და ტვინის ფუნქციონირების გარკვეული ცვლილებები. კვლევებში ასევე აღწერილია სტრესის შემცირებასთან დაკავშირებული ფიზიოლოგიური მაჩვენებლები, მათ შორის კორტიზოლის დონის, კუნთოვანი დაძაბულობისა და სისხლში ლაქტატის კონცენტრაციის ცვლილებები.</p>
            <p>მაჰარიშის მიერ აღწერილი ცნობიერების მოდელის მიხედვით, ტრანსცენდენტული ცნობიერება ცნობიერების მეოთხე ძირითადი მდგომარეობაა, რომელიც განსხვავდება ჩვეულებრივი სიფხიზლისგან, ძილისა და სიზმრისგან. მას ახასიათებენ როგორც ღრმა დასვენებისა და შინაგანი სიფხიზლის ერთდროულ გამოცდილებას.</p>
          </div>
        </div>
        <figure className={`${styles.figure} ${mirrored.figure}`}>
          <p id="tm-restful-alertness-scroll-hint" className={styles.scrollHint}>
            სრული დიაგრამის სანახავად გადაასრიალეთ ჰორიზონტალურად <span aria-hidden="true">↔</span>
          </p>
          <div
            className={styles.chartViewport}
            role="region"
            aria-label="ღრმა დასვენებისა და სიფხიზლის სამეცნიერო დიაგრამა"
            aria-describedby="tm-restful-alertness-scroll-hint"
            tabIndex={0}
          >
            <img
              className={styles.chart}
              src="/images/tm-restful-alertness-science-chart-en.svg"
              width={1425}
              height={1589}
              alt="TM-ის წყაროს ინგლისურენოვანი სამეცნიერო დიაგრამა ღრმა დასვენებისა და სიფხიზლის შესახებ, ორიგინალური მონაცემებითა და კვლევების მითითებებით."
              loading="lazy"
            />
          </div>
        </figure>
      </div>
    </section>
  );
}
