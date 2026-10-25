import science from '../blog/[slug]/what-is-tm-different.module.css';
import chart from '../health/insomnia-section.module.css';
import placement from '../health/heart-health-section.module.css';
import styles from './communication-section.module.css';

export function CommunicationSection() {
  return (
    <section aria-labelledby="communication-heading" className={science.section}>
      <div className={`${science.layout} ${chart.layout}`}>
        <div className={`${science.copy} ${placement.copy}`}>
          <h2 id="communication-heading" className={science.heading}>ტრანსცენდენტული მედიტაცია ხელს უწყობს კომუნიკაციისა და ურთიერთგაგების გაუმჯობესებას</h2>
          <div className={science.description}>
            <p>ტრანსცენდენტული მედიტაციის (TM) პრაქტიკა ხელს უწყობს მშვიდი სიფხიზლისა და გონების სიცხადის განვითარებას, რაც შეიძლება დადებითად აისახოს სხვების მოსმენის, გააზრებული რეაგირებისა და კონსტრუქციული საუბრის უნარზე. კვლევები მიუთითებს, რომ TM-ის პრაქტიკას შესაძლოა თან ახლდეს ყურადღების, კომუნიკაციისა და თანამშრომლობის გაუმჯობესება.</p>
            <p>რეგულარულმა პრაქტიკამ შესაძლოა ხელი შეუწყოს ემოციების უკეთ გაცნობიერებასა და მართვას, რაც სხვების გრძნობების გაგებასა და მათ მიმართ მეტი თანაგრძნობის გამოვლენაში გვეხმარება.</p>
            <p>ემოციური რეაქტიულობის შემცირება და შინაგანი სიმშვიდის გაძლიერება ხელს უწყობს უფრო თბილი და ჰარმონიული ურთიერთობების ჩამოყალიბებას, განსაკუთრებით ოჯახის წევრებსა და მეგობრებთან. ამასთან, საკუთარი ემოციების უკეთ გაცნობიერება და თვითშეფასების განვითარება შეიძლება ურთიერთგაგების გაღრმავებასაც უწყობდეს ხელს.</p>
          </div>
        </div>
        <figure className={`${science.figure} ${placement.figure}`}>
          <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
            <defs>
              <filter id="family-chart-background" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
                <feFlood floodColor="#f9f7e9" result="originalBackground" />
                <feBlend in="SourceGraphic" in2="originalBackground" mode="difference" result="difference" />
                <feColorMatrix
                  in="difference"
                  type="matrix"
                  values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  255 255 255 0 0"
                  result="chartMask"
                />
                <feComposite in="SourceGraphic" in2="chartMask" operator="in" result="chartContent" />
                <feFlood floodColor="var(--color-cream-100)" result="sectionBackground" />
                <feComposite in="sectionBackground" in2="chartMask" operator="out" result="matchedBackground" />
                <feMerge>
                  <feMergeNode in="matchedBackground" />
                  <feMergeNode in="chartContent" />
                </feMerge>
              </filter>
            </defs>
          </svg>
          <img
            src="/images/tm-less-family-problems-chart.png"
            width={620}
            height={540}
            className={`${chart.chart} ${styles.chart}`}
            alt="ინგლისურენოვანი დიაგრამა Less family problems: ოჯახური პრობლემების ცვლილება ფსიქოთერაპიისა და TM-ის პრაქტიკის დროს, სამეცნიერო წყაროს მითითებით."
            loading="lazy"
          />
        </figure>
      </div>
    </section>
  );
}
