import research from '@/components/research-layout.module.css';
import science from '../blog/[slug]/what-is-tm-different.module.css';

export function InsomniaSection() {
  return (
    <section aria-labelledby="insomnia-heading" className={research.section}>
      <div className={research.layout}>
        <div className={science.copy}>
          <h2 id="insomnia-heading" className={science.heading}>ტრანსცენდენტული მედიტაცია ხელს უწყობს უძილობის შემცირებას და ძილის ხარისხის გაუმჯობესებას</h2>
          <div className={science.description}>
            <p>სტრესი ძილის დარღვევების ერთ-ერთი მნიშვნელოვანი ხელშემწყობი ფაქტორია. ტრანსცენდენტული მედიტაციის (TM) რეგულარული პრაქტიკა ხელს უწყობს ღრმა დასვენებასა და სტრესის შემცირებას, რამაც შესაძლოა დადებითად იმოქმედოს ძილის ხარისხზე.</p>
            <p>ერთ-ერთმა კვლევამ აჩვენა, რომ TM-ის პრაქტიკის მქონე ჯგუფში უძილობის სიმპტომები მნიშვნელოვნად შემცირდა საკონტროლო ჯგუფთან შედარებით. ეს შედეგი მიუთითებს ტრანსცენდენტული მედიტაციის შესაძლო სარგებელზე ძილის დარღვევების შემცირების თვალსაზრისით.</p>
            <p>ხარისხიანი ძილი მნიშვნელოვანია ორგანიზმის აღდგენისთვის, ენერგიის შენარჩუნებისა და ემოციური წონასწორობისთვის. ძილის გაუმჯობესებამ შესაძლოა ხელი შეუწყოს დაღლილობის შემცირებასა და საერთო კეთილდღეობის ამაღლებას.</p>
          </div>
        </div>
        <figure className={research.figure}>
          <img
            src="/images/tm-insomnia-chart-en.svg"
            width={1367}
            height={998}
            className={research.chart}
            alt="ინგლისურენოვანი სამეცნიერო დიაგრამა: უძილობის შემცირება ტრანსცენდენტული მედიტაციის პრაქტიკის დროს, კვლევის მითითებით."
            loading="lazy"
          />
        </figure>
      </div>
    </section>
  );
}
