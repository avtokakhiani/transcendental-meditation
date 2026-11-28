import research from '@/components/research-layout.module.css';
import science from '../blog/[slug]/what-is-tm-different.module.css';
import placement from '../health/heart-health-section.module.css';
import styles from './communication-section.module.css';

export function CommunicationSection() {
  return (
    <section aria-labelledby="communication-heading" className={research.section}>
      <div className={research.layout}>
        <div className={`${science.copy} ${placement.copy}`}>
          <h2 id="communication-heading" className={science.heading}>ტრანსცენდენტული მედიტაცია აუმჯობესებს კომუნიკაციასა და ურთიერთგაგებას</h2>
          <div className={science.description}>
            <p>ტრანსცენდენტული მედიტაციის რეგულარული პრაქტიკა ხელს უწყობს შინაგანი სიმშვიდისა და გონებრივი სიცხადის განვითარებას. ეს გვეხმარება, უკეთ მოვუსმინოთ სხვებს, უფრო გააზრებულად ვუპასუხოთ მათ და უფრო ნაყოფიერად ვისაუბროთ.</p>
            <p>ემოციების უკეთ გაცნობიერება და მართვა ხელს უწყობს ურთიერთგაგებისა და თანაგრძნობის გაძლიერებას. როდესაც ნაკლებად იმპულსურად ვრეაგირებთ, უფრო მარტივად შეგვიძლია განსხვავებული მოსაზრებების მიღება და უთანხმოებების მშვიდად მოგვარება.</p>
            <p>კვლევებში ასევე გამოვლენილია ტრანსცენდენტული მედიტაციის პრაქტიკასთან დაკავშირებული ოჯახური პრობლემების შემცირება. შინაგანი სიმშვიდისა და ემოციური წონასწორობის განვითარება ხელს უწყობს ოჯახის წევრებთან და ახლობლებთან უფრო თბილი და ჰარმონიული ურთიერთობების ჩამოყალიბებას.</p>
          </div>
        </div>
        <figure className={`${research.figure} ${placement.figure} ${styles.figure}`}>
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
            className={`${research.chart} ${styles.chart}`}
            alt="ინგლისურენოვანი დიაგრამა Less family problems: ოჯახური პრობლემების ცვლილება ფსიქოთერაპიისა და TM-ის პრაქტიკის დროს, სამეცნიერო წყაროს მითითებით."
            loading="lazy"
          />
        </figure>
      </div>
    </section>
  );
}
