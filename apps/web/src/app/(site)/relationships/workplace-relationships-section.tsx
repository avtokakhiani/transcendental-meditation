import research from '@/components/research-layout.module.css';
import science from '../blog/[slug]/what-is-tm-different.module.css';

export function WorkplaceRelationshipsSection() {
  return (
    <section aria-labelledby="workplace-relationships-heading" className={research.section}>
      <div className={research.layout}>
        <div className={science.copy}>
          <h2 id="workplace-relationships-heading" className={science.heading}>ტრანსცენდენტული მედიტაციის პრაქტიკა ხელს უწყობს სამუშაო გარემოში ურთიერთობების გაუმჯობესებას</h2>
          <div className={science.description}>
            <p>კვლევები მიუთითებს, რომ ტრანსცენდენტული მედიტაციის (TM) პრაქტიკამ შესაძლოა ხელი შეუწყოს ემოციების უკეთ რეგულირებას, რაც დაძაბულ სიტუაციებში სიმშვიდის შენარჩუნებას გვიადვილებს. სტრესული რეაქციის შემცირება და შინაგანი წონასწორობის გაძლიერება გვეხმარება, იმპულსური ქცევის ნაცვლად უფრო გააზრებულად ვუპასუხოთ სხვადასხვა გამოწვევას.</p>
            <p>ემოციური კეთილდღეობის გაუმჯობესება შესაძლოა დადებითად აისახოს როგორც პირად ურთიერთობებზე, ისე სამუშაო გარემოში თანამშრომლობასა და კომუნიკაციაზე.</p>
            <p>ტრანსცენდენტული მედიტაციის პრაქტიკოსი თანამშრომლები ხშირად აღნიშნავენ, რომ თავს უფრო ბედნიერად და კმაყოფილად გრძნობენ. სხვადასხვა პროფესიულ ჯგუფში ჩატარებულ კვლევებში დაფიქსირდა სტრესის მიმართ მეტი გამძლეობა, შინაგანი სიმშვიდის გაძლიერება და ხელმძღვანელებსა თუ კოლეგებთან ურთიერთობების გაუმჯობესება.</p>
          </div>
        </div>
        <figure className={research.figure}>
          <img
            src="/images/tm-workplace-relationships-chart-en.svg"
            width={1011}
            height={1378}
            className={research.chart}
            alt="ინგლისურენოვანი სამეცნიერო დიაგრამა: სამუშაო გარემოში ურთიერთობების გაუმჯობესება ტრანსცენდენტული მედიტაციის პრაქტიკის დროს, კვლევის მითითებით."
            loading="lazy"
          />
        </figure>
      </div>
    </section>
  );
}
