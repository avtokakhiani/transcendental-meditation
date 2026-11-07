import research from '@/components/research-layout.module.css';
import science from '../blog/[slug]/what-is-tm-different.module.css';

export function TraitAnxietySection() {
  return (
    <section aria-labelledby="trait-anxiety-heading" className={research.section}>
      <div className={research.layout}>
        <div className={science.copy}>
          <h2 id="trait-anxiety-heading" className={science.heading}>ტრანსცენდენტული მედიტაცია ხელს უწყობს ხასიათობრივი შფოთვის შემცირებას</h2>
          <div className={science.description}>
            <p>ხასიათობრივი შფოთვა გულისხმობს ადამიანის ზოგად მიდრეკილებას შფოთვისკენ, განსხვავებით მდგომარეობითი შფოთვისგან, რომელიც კონკრეტულ მომენტში განცდილ შფოთვას აღწერს. 146 სამეცნიერო კვლევის მეტაანალიზმა აჩვენა, რომ ტრანსცენდენტული მედიტაციის პრაქტიკა ხასიათობრივი შფოთვის შემცირებაში ორჯერ მეტად ეფექტური აღმოჩნდა, ვიდრე რელაქსაციის სხვა მეთოდები.</p>
            <p>ტრანსცენდენტული მედიტაციის დამამშვიდებელი გავლენა ნერვულ სისტემაზე ადამიანებს ეხმარება შფოთვასთან გამკლავებასა და ტრავმის შემდეგ აღდგენაში.</p>
          </div>
        </div>
        <figure className={research.figure}>
          <img
            src="/images/tm-trait-anxiety-reduction-chart-no-title-en.svg"
            width={881}
            height={883}
            className={research.chart}
            alt="ინგლისურენოვანი სამეცნიერო დიაგრამა: ხასიათობრივი შფოთვის შემცირების შედარება TM-ისა და სხვა მეთოდების შემთხვევაში, ორიგინალური კვლევის მითითებით."
            loading="lazy"
          />
        </figure>
      </div>
    </section>
  );
}
