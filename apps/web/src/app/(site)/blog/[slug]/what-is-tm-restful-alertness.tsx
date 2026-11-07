import research from '@/components/research-layout.module.css';
import styles from './what-is-tm-different.module.css';
import mirrored from './what-is-tm-restful-alertness.module.css';

export function WhatIsTmRestfulAlertness() {
  return (
    <section aria-labelledby="tm-restful-alertness-heading" className={research.section}>
      <div className={research.layout}>
        <div className={`${styles.copy} ${mirrored.copy}`}>
          <h2 id="tm-restful-alertness-heading" className={styles.heading}>ღრმა დასვენებისა და სიფხიზლის უნიკალური მდგომარეობა</h2>
          <div className={styles.description}>
            <p>ბოლო ათწლეულების განმავლობაში ჩატარებული სამეცნიერო კვლევები აჩვენებს, რომ ტრანსცენდენტული მედიტაციის პრაქტიკის დროს წარმოიქმნება განსაკუთრებული ფიზიოლოგიური მდგომარეობა, რომელშიც სხეული ღრმად ისვენებს, გონება კი ფხიზლად რჩება.</p>
            <p>ამ მდგომარეობას ახასიათებს სუნთქვის სიხშირის შემცირება და ორგანიზმის ფიზიოლოგიური ფუნქციონირების ცვლილებები. კვლევებში აღწერილია ისეთი მაჩვენებლების ცვლილებები, როგორიცაა კანის ელექტრული გამტარობა და სისხლის პლაზმაში ლაქტატის კონცენტრაცია, რაც ღრმა დასვენების მდგომარეობასთან არის დაკავშირებული.</p>
            <p>მაჰარიშის მიერ აღწერილი ცნობიერების მოდელის თანახმად, ტრანსცენდენტული ცნობიერება ცნობიერების მეოთხე ძირითადი მდგომარეობაა, რომელიც განსხვავდება სიფხიზლის, სიზმრიანი ძილისა და ღრმა ძილის მდგომარეობებისგან. მას ახასიათებს ღრმა დასვენებისა და შინაგანი სიფხიზლის ერთდროული გამოცდილება.</p>
          </div>
        </div>
        <figure className={`${research.figure} ${mirrored.figure}`}>
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
              className={`${research.chart} ${mirrored.chart}`}
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
