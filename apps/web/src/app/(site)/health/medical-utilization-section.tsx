import research from '@/components/research-layout.module.css';
import science from '../blog/[slug]/what-is-tm-different.module.css';
import styles from './medical-utilization-section.module.css';

export function MedicalUtilizationSection() {
  return (
    <section aria-labelledby="medical-utilization-heading" className={research.section}>
      <div className={research.layout}>
        <div className={science.copy}>
          <h2 id="medical-utilization-heading" className={science.heading}>ტრანსცენდენტული მედიტაცია ამცირებს სამედიცინო მომსახურების საჭიროებას</h2>
          <div className={science.description}>
            <p>ერთ-ერთ კვლევაში ერთმანეთს შეადარეს Blue Cross Blue Shield-ის დაზღვევით მოსარგებლე ტრანსცენდენტული მედიტაციის 2 000 პრაქტიკოსისა და ამავე სადაზღვევო კომპანიის დაახლოებით 600 000 სხვა დაზღვეულის სამედიცინო მომსახურების გამოყენების ხუთწლიანი მონაცემები. ორივე ჯგუფს მსგავსი სადაზღვევო პირობები და სქესობრივი განაწილება ჰქონდა.</p>
            <p>ტრანსცენდენტული მედიტაციის პრაქტიკოსთა ჯგუფში სამედიცინო მომსახურების გამოყენების მაჩვენებლები ყველა შესწავლილ კატეგორიაში დაბალი აღმოჩნდა. სტაციონარში გატარებული დღეები ბავშვებსა და ახალგაზრდებში 50%-ით, ხოლო 40 წელს გადაცილებულ ადამიანებში 69%-ით ნაკლები იყო. ამბულატორიული ვიზიტების რაოდენობა კი შესაბამის ასაკობრივ ჯგუფებში 46,8%-ით, 54,7%-ითა და 73,7%-ით დაბალი აღმოჩნდა.</p>
          </div>
        </div>
        <figure className={research.figure}>
          <img
            src="/images/tm-medical-utilization-chart-en.svg"
            width={2611}
            height={1518}
            className={`${research.chart} ${styles.chart}`}
            alt="ინგლისურენოვანი სამეცნიერო დიაგრამა: სამედიცინო მომსახურების გამოყენების შედარება TM-ის პრაქტიკოსებსა და საკონტროლო ჯგუფში, ლეგენდითა და კვლევის მითითებით."
            loading="lazy"
          />
        </figure>
      </div>
    </section>
  );
}
