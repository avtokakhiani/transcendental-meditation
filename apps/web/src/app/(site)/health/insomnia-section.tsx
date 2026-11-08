import research from '@/components/research-layout.module.css';
import styles from './insomnia-section.module.css';
import science from '../blog/[slug]/what-is-tm-different.module.css';

export function InsomniaSection() {
  return (
    <section aria-labelledby="insomnia-heading" className={research.section}>
      <div className={research.layout}>
        <div className={science.copy}>
          <h2 id="insomnia-heading" className={science.heading}>ტრანსცენდენტული მედიტაცია აუმჯობესებს ძილის ხარისხს</h2>
          <div className={science.description}>
            <p>ტრანსცენდენტული მედიტაციის რეგულარული პრაქტიკა მნიშვნელოვნად ამცირებს სტრესთან დაკავშირებული ჰორმონების, მათ შორის კორტიზოლის დონეს, რაც დადებითად აისახება ცხოვრების მრავალ ასპექტზე, განსაკუთრებით კი ძილის ხარისხზე.</p>
            <p>ტრანსცენდენტული მედიტაციის პრაქტიკა ასევე ხელს უწყობს სეროტონინის დონის მატებას. სეროტონინი ნეირომედიატორია, რომელიც მნიშვნელოვან როლს ასრულებს განწყობისა და ძილ-ღვიძილის ციკლის რეგულირებაში. მისი ჯანსაღი დონე ხელს უწყობს მშვიდ და ხარისხიან ძილს, რაც აუმჯობესებს საერთო კეთილდღეობას და ორგანიზმის მდგრადობას დაავადებების მიმართ.</p>
            <p>ძილის ხარისხის გაუმჯობესება არა მხოლოდ დაღლილობის შემცირებას უწყობს ხელს, არამედ ემოციური წონასწორობის შენარჩუნებასაც, რაც დღის განმავლობაში უფრო სტაბილურ განწყობას უზრუნველყოფს.</p>
          </div>
        </div>
        <figure className={research.figure}>
          <img
            src="/images/tm-sleep-quality-chart-en.svg"
            width={1815}
            height={1539}
            className={`${research.chart} ${styles.chart}`}
            alt="ძილის ხარისხის გაუმჯობესება ხელმძღვანელებსა და თანამშრომლებში: საკონტროლო ჯგუფი — 0.1, ტრანსცენდენტული მედიტაციის ჯგუფი — 1.3; კვლევის მითითებით."
            loading="lazy"
          />
        </figure>
      </div>
    </section>
  );
}
