import research from '@/components/research-layout.module.css';
import science from '../blog/[slug]/what-is-tm-different.module.css';
import styles from './relationships.module.css';

export function WorkplaceRelationshipsSection() {
  return (
    <section aria-labelledby="workplace-relationships-heading" className={research.section}>
      <div className={research.layout}>
        <div className={science.copy}>
          <h2 id="workplace-relationships-heading" className={science.heading}>ტრანსცენდენტული მედიტაცია აუმჯობესებს სამუშაო და პირად ურთიერთობებს</h2>
          <div className={science.description}>
            <p>სამეცნიერო კვლევები აჩვენებს, რომ ტრანსცენდენტული მედიტაციის პრაქტიკა ხელს უწყობს ემოციების უკეთ რეგულირებასა და სტრესულ სიტუაციებში სიმშვიდის შენარჩუნებას. ეს გვეხმარება, ყოველდღიურ გამოწვევებს უფრო მშვიდად და გააზრებულად ვუპასუხოთ.</p>
            <p>ემოციური კეთილდღეობის გაუმჯობესება დადებითად აისახება როგორც პირად ურთიერთობებზე, ისე სამუშაო გარემოში თანამშრომლობასა და კომუნიკაციაზე.</p>
            <p>სხვადასხვა პროფესიულ ჯგუფში ჩატარებულ კვლევებში TM-ის პრაქტიკოსებმა აღნიშნეს სამუშაოთი კმაყოფილების ზრდა, სტრესთან უკეთ გამკლავება, შინაგანი სიმშვიდის გაძლიერება და ხელმძღვანელებსა თუ კოლეგებთან ურთიერთობების გაუმჯობესება.</p>
          </div>
        </div>
        <figure className={research.figure}>
          <img
            src="/images/tm-workplace-relationships-chart-en.svg"
            width={1011}
            height={1378}
            className={`${research.chart} ${styles.workplaceChart}`}
            alt="ინგლისურენოვანი სამეცნიერო დიაგრამა: სამუშაო გარემოში ურთიერთობების გაუმჯობესება ტრანსცენდენტული მედიტაციის პრაქტიკის დროს, კვლევის მითითებით."
            loading="lazy"
          />
        </figure>
      </div>
    </section>
  );
}
