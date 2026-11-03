import research from '@/components/research-layout.module.css';
import science from '../blog/[slug]/what-is-tm-different.module.css';

export function MedicalUtilizationSection() {
  return (
    <section aria-labelledby="medical-utilization-heading" className={research.section}>
      <div className={research.layout}>
        <div className={science.copy}>
          <h2 id="medical-utilization-heading" className={science.heading}>ტრანსცენდენტული მედიტაციის პრაქტიკა დაკავშირებულია სამედიცინო მომსახურების საჭიროების შემცირებასთან</h2>
          <div className={science.description}>
            <p>ერთ-ერთმა კვლევამ შეადარა სამედიცინო მომსახურების გამოყენების ხუთწლიანი მონაცემები დაახლოებით 2 000 ადამიანისთვის, რომლებიც ტრანსცენდენტულ მედიტაციას (TM) პრაქტიკულად მისდევდნენ, და იმავე სადაზღვევო კომპანიის დაახლოებით 600 000 დაზღვეულის მონაცემები. ჯგუფები მსგავსი იყო სადაზღვევო პირობებითა და სქესობრივი განაწილებით.</p>
            <p>TM-ის პრაქტიკოსთა ჯგუფში სამედიცინო მომსახურების გამოყენების მაჩვენებლები შედარებით დაბალი აღმოჩნდა ყველა შესწავლილ კატეგორიაში. სტაციონარში გატარებული დღეების რაოდენობა ბავშვებსა და ახალგაზრდებში 50%-ით, ხოლო 40 წელზე უფროსი ასაკის ადამიანებში 69%-ით ნაკლები იყო. ამბულატორიული ვიზიტების მაჩვენებელი კი შესაბამის ასაკობრივ ჯგუფებში 46.8%-ით, 54.7%-ითა და 73.7%-ით დაბალი აღმოჩნდა.</p>
          </div>
        </div>
        <figure className={research.figure}>
          <img
            src="/images/tm-medical-utilization-chart-en.svg"
            width={2611}
            height={1518}
            className={research.chart}
            alt="ინგლისურენოვანი სამეცნიერო დიაგრამა: სამედიცინო მომსახურების გამოყენების შედარება TM-ის პრაქტიკოსებსა და საკონტროლო ჯგუფში, ლეგენდითა და კვლევის მითითებით."
            loading="lazy"
          />
        </figure>
      </div>
    </section>
  );
}
