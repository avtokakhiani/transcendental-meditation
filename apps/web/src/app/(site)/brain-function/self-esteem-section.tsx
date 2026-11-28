import research from '@/components/research-layout.module.css';
import science from '../blog/[slug]/what-is-tm-different.module.css';
import styles from './brain-function.module.css';

export function SelfEsteemSection() {
  return (
    <section aria-labelledby="self-esteem-heading" className={research.section}>
      <div className={research.layout}>
        <div className={science.copy}>
          <h2 id="self-esteem-heading" className={science.heading}>ტრანსცენდენტული მედიტაცია ამცირებს სტრესს და აძლიერებს თვითშეფასებას</h2>
          <div className={science.description}>
            <p>კვლევაში მონაწილეობდნენ 13–26 წლის ახალგაზრდა ქალები, რომლებიც უგანდის დედაქალაქ კამპალას ღარიბ უბნებში ცხოვრობდნენ. ტრანსცენდენტული მედიტაციის შესწავლიდან ხუთი თვის შემდეგ მონაწილეებში მნიშვნელოვნად გაუმჯობესდა თვითშეფასება, თვითეფექტურობა და მადლიერების განცდა, ხოლო დაღლილობა და ალკოჰოლის ჭარბი მოხმარება შემცირდა.</p>
            <p>რვა თვის შემდეგ მედიტაციის პრაქტიკოსთა 89%-მა აღნიშნა ჯანმრთელობის გაუმჯობესება, 98%-მა — სტრესისა და შფოთვის შემცირება, 98%-მა — ოჯახის წევრებთან ურთიერთობის გაუმჯობესება, ხოლო 88%-მა — მეგობრებთან და მეზობლებთან ურთიერთობის გაუმჯობესება.</p>
          </div>
        </div>
        <figure className={research.figure}>
          <img
            src="/images/tm-self-esteem-uganda-chart-en.svg"
            width={2864}
            height={1166}
            className={`${research.chart} ${styles.selfEsteemChart}`}
            alt="ინგლისურენოვანი სამეცნიერო დიაგრამა: უგანდაში ქალების თვითშეფასების, თვითეფექტურობისა და მადლიერების ცვლილებები, კვლევის მითითებით."
            loading="lazy"
          />
        </figure>
      </div>
    </section>
  );
}
