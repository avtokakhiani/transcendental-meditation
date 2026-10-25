import science from '../blog/[slug]/what-is-tm-different.module.css';
import styles from '../health/insomnia-section.module.css';

export function SelfEsteemSection() {
  return (
    <section aria-labelledby="self-esteem-heading" className={science.section}>
      <div className={`${science.layout} ${styles.layout}`}>
        <div className={science.copy}>
          <h2 id="self-esteem-heading" className={science.heading}>TM პრაქტიკა ამცირებს სტრესს და აძლიერებს თვითშეფასებას</h2>
          <div className={science.description}>
            <p>ეს კვლევა ეხება ტრანსცენდენტული მედიტაციის ტექნიკის სწავლებას 13–26 წლის ქალებისთვის, რომლებიც სიღარიბის პირობებში ცხოვრობენ უგანდის დედაქალაქ კამპალას ღარიბ უბნებში. ეს ახალგაზრდა ქალები ასახავენ მსოფლიოში სიღარიბეში მცხოვრები მილიონობით ქალისა და გოგოს მდგომარეობას, რომლებიც ყოველდღიურად სერიოზულ სირთულეებს აწყდებიან. ხუთი თვის შემდეგ გამოვლინდა მნიშვნელოვანი გაუმჯობესება თვითშეფასებაში, თვითეფექტურობაში და მადლიერების განცდაში, ასევე შემცირდა დაღლილობა და ალკოჰოლის ჭარბი მოხმარება.</p>
            <p>რვა თვის შემდეგ, მედიტაციის პრაქტიკაში ჩართული მონაწილეების 89%-მა აღნიშნა ჯანმრთელობის გაუმჯობესება, 98%-მა — სტრესისა და შფოთვის შემცირება, 98%-მა — ოჯახის წევრებთან ურთიერთობის გაუმჯობესება, ხოლო 88%-მა — მეგობრებთან და მეზობლებთან ურთიერთობის გაუმჯობესება.</p>
          </div>
        </div>
        <figure className={science.figure}>
          <img
            src="/images/tm-self-esteem-uganda-chart-en.svg"
            width={2864}
            height={1166}
            className={styles.chart}
            alt="ინგლისურენოვანი სამეცნიერო დიაგრამა: უგანდაში ქალების თვითშეფასების, თვითეფექტურობისა და მადლიერების ცვლილებები, კვლევის მითითებით."
            loading="lazy"
          />
        </figure>
      </div>
    </section>
  );
}
