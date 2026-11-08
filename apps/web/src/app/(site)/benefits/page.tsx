import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ClosingCta } from '@/components/landing/closing-cta';
import introduction from '../blog/[slug]/what-is-tm-intro.module.css';
import hero from '../stress-and-anxiety/stress-and-anxiety.module.css';
import styles from './benefits.module.css';

const HEADING = 'რა სარგებელი მოაქვს ტრანსცენდენტულ მედიტაციას?';

export const metadata: Metadata = {
  title: 'ყველა სარგებელი',
};

export default function BenefitsPage() {
  return (
    <article>
      <section aria-labelledby="benefits-heading" className={hero.hero}>
        <Image
          src="/images/benefits-hero-desert.jpeg"
          alt="უდაბნოს პეიზაჟი იოშუას ხეებით და თბილი მზის შუქით."
          fill
          preload
          quality={90}
          sizes="100vw"
          className={`${hero.photograph} ${styles.photograph}`}
        />
        <h1 id="benefits-heading" className={hero.heading}>{HEADING}</h1>
      </section>
      <section aria-label="შესავალი" className={introduction.continuation}>
        <div className={introduction.continuationCopy}>
          <p>ტრანსცენდენტული მედიტაციის პრაქტიკა როგორც გონებას, ისე სხეულს ღრმა დასვენებას ანიჭებს. ეს ხელს უწყობს ნერვულ სისტემაში ღრმად ფესვგადგმული სტრესის აღმოფხვრასა და ტვინის ფუნქციონირების გაუმჯობესებას.</p>
          <p>ტრანსცენდენტული მედიტაციის პრაქტიკის დაწყებიდან სულ რამდენიმე წუთში ადამიანები, როგორც წესი, თავს უფრო დასვენებულად და მხნედ გრძნობენ, აზროვნება უფრო ნათელი ხდება და მოქმედებისთვის მზადყოფნას იძენენ.</p>
        </div>
      </section>
      <section aria-labelledby="benefits-research-heading" className={hero.research}>
        <div className={hero.researchContent}>
          <h2 id="benefits-research-heading" className={hero.researchHeading}>ტრანსცენდენტული მედიტაციის ეფექტიანობა მეცნიერულად დადასტურებულია</h2>
          <div className={hero.researchDescription}>
            <p>1970 წლიდან დღემდე ტრანსცენდენტული მედიტაციის (TM) ტექნიკის შესახებ გამოქვეყნებულია 480-ზე მეტი ორიგინალური, რეცენზირებული სამეცნიერო კვლევა. კვლევების ასეთი მოცულობა უპრეცედენტო და უნიკალურია მედიტაციის ცალკეული ტექნიკების შესწავლის სფეროში.</p>
            <p>ეს კვლევები აჩვენებს, რომ ტრანსცენდენტულ მედიტაციას მნიშვნელოვანი სარგებელი მოაქვს როგორც ფსიქიკური და ფიზიკური ჯანმრთელობისთვის, ისე ემოციური კეთილდღეობისთვის:</p>
          </div>
          <ul className={hero.researchList}>
            <li>ტვინის ფუნქციონირების გაუმჯობესება</li>
            <li>ენერგიის მატება</li>
            <li>შემოქმედებითი შესაძლებლობების გაძლიერება</li>
            <li>ცნობიერების გაფართოება</li>
            <li>გულ-სისხლძარღვთა ჯანმრთელობის გაუმჯობესება</li>
            <li>ძილის ხარისხის გაუმჯობესება</li>
          </ul>
        </div>
      </section>
      <section aria-labelledby="benefits-stress-heading" className={styles.stressFeature}>
        <div className={styles.featureIntro}>
          <p>ასობით სამეცნიერო კვლევა ადასტურებს ტრანსცენდენტული მედიტაციის ფართო სპექტრის სარგებელს</p>
        </div>
        <div className={styles.featureLayout}>
          <div className={styles.featurePhoto}>
            <Image
              src="/images/stress-anxiety-hero-seaside.jpeg"
              alt="ქალი გაშლილი ხელებით ზღვის პირას, თბილ მზის შუქში."
              fill
              quality={90}
              sizes="(min-width: 1024px) 57vw, 100vw"
              className={styles.featureImage}
            />
          </div>
          <div className={styles.featurePanel}>
            <div className={styles.featureCopy}>
              <h2 id="benefits-stress-heading" className={styles.featureHeading}>ტრანსცენდენტული მედიტაცია სტრესისა და შფოთვის შესამცირებლად</h2>
              <p className={styles.featureDescription}>კვლევებმა აჩვენა, რომ ტრანსცენდენტული მედიტაციის ტექნიკა ერთ-ერთი ყველაზე ეფექტური საშუალებაა სტრესის შესამცირებლად და იმ პრობლემების დასაძლევად, რომლებსაც სტრესი იწვევს — მათ შორისაა ხასიათობრივი შფოთვა, დეპრესია, პოსტტრავმული სტრესული აშლილობა (PTSD), ძილის დარღვევები და უძილობა, და სხვა.</p>
              <Link href="/stress-and-anxiety" className={styles.featureButton}>გაიგე მეტი</Link>
            </div>
          </div>
        </div>
      </section>
      <section aria-labelledby="benefits-clearer-mind-heading" className={`${styles.featureLayout} ${styles.clearerMind}`}>
        <div className={`${styles.featurePhoto} ${styles.clearerMindPhoto}`}>
          <Image
            src="/images/brain-function-hero-mountains.jpeg"
            alt="ქალი მთის მწვერვალზე ზის და მზით განათებულ პეიზაჟს გადაჰყურებს."
            fill
            quality={90}
            sizes="(min-width: 1024px) 57vw, 100vw"
            className={`${styles.featureImage} ${styles.clearerMindImage}`}
          />
        </div>
        <div className={`${styles.featurePanel} ${styles.clearerMindPanel}`}>
          <div className={styles.featureCopy}>
            <h2 id="benefits-clearer-mind-heading" className={styles.featureHeading}>ტრანსცენდენტული მედიტაცია გონების მეტი სიცხადისთვის</h2>
            <p className={styles.featureDescription}>ტრანსცენდენტული მედიტაციის რეგულარული პრაქტიკა ცნობიერების გაფართოებას უწყობს ხელს და ყოველდღიურ ცხოვრებას ამდიდრებს. შედეგად, აზროვნება უფრო ნათელი ხდება, შემოქმედებითი და ინტელექტუალური შესაძლებლობები ვითარდება და გამოწვევების გადალახვის უნარი იზრდება.</p>
            <Link href="/brain-function" className={`${styles.featureButton} ${styles.clearerMindButton}`}>გაიგე მეტი</Link>
          </div>
        </div>
      </section>
      <section aria-labelledby="benefits-health-heading" className={`${styles.featureLayout} ${styles.betterHealth}`}>
        <div className={styles.featurePhoto}>
          <Image
            src="/images/health-hero-hands-flower.jpeg"
            alt="ხელისგულებში მოთავსებული პატარა ყვითელი ყვავილი."
            fill
            quality={90}
            sizes="(min-width: 1024px) 57vw, 100vw"
            className={`${styles.featureImage} ${styles.healthImage}`}
          />
        </div>
        <div className={styles.featurePanel}>
          <div className={styles.featureCopy}>
            <h2 id="benefits-health-heading" className={styles.featureHeading}>ტრანსცენდენტული მედიტაცია ჯანმრთელობის გასაუმჯობესებლად</h2>
            <p className={styles.featureDescription}>სტრესის შემცირება დადებითად მოქმედებს მთელ ორგანიზმზე. კვლევებმა აჩვენა, რომ ტრანსცენდენტული მედიტაციის ტექნიკა ხელს უწყობს გულის ფუნქციონირების გაუმჯობესებას, მაღალი არტერიული წნევის შემცირებას, სამედიცინო მომსახურების საჭიროების კლებასა და იმუნიტეტის გაძლიერებას.</p>
            <Link href="/health" className={`${styles.featureButton} ${styles.healthButton}`}>გაიგე მეტი</Link>
          </div>
        </div>
      </section>
      <section aria-labelledby="benefits-relationships-heading" className={`${styles.featureLayout} ${styles.clearerMind} ${styles.relationshipsFeature}`}>
        <div className={`${styles.featurePhoto} ${styles.clearerMindPhoto}`}>
          <Image
            src="/images/relationships-hero.jpeg"
            alt="მომღიმარი ქალი გაშლილი ხელებით ღია ცის ქვეშ."
            fill
            quality={90}
            sizes="(min-width: 1024px) 57vw, 100vw"
            className={`${styles.featureImage} ${styles.relationshipsImage}`}
          />
        </div>
        <div className={`${styles.featurePanel} ${styles.clearerMindPanel}`}>
          <div className={styles.featureCopy}>
            <h2 id="benefits-relationships-heading" className={styles.featureHeading}>ტრანსცენდენტული მედიტაცია ურთიერთობების გასაუმჯობესებლად</h2>
            <p className={styles.featureDescription}>როდესაც უფრო მშვიდად და გაწონასწორებულად ვგრძნობთ თავს, ნაკლებად იმპულსურად ვრეაგირებთ და მეტ შემწყნარებლობასა და გულისხმიერებას ვიჩენთ. სტუდენტებში, დასაქმებულებში, მოქმედ სამხედროებსა და ვეტერანებში, ასევე პატიმრებში ჩატარებული კვლევები აჩვენებს, რომ ტრანსცენდენტული მედიტაციის პრაქტიკა ურთიერთობების გაუმჯობესებას უწყობს ხელს.</p>
            <Link href="/relationships" className={`${styles.featureButton} ${styles.clearerMindButton}`}>გაიგე მეტი</Link>
          </div>
        </div>
      </section>
      <section aria-labelledby="benefits-peace-heading" className={`${styles.featureLayout} ${styles.peaceFeature}`}>
        <div className={styles.featurePhoto}>
          <Image
            src="/images/peace-hero-sunset-man.jpeg"
            alt="მომღიმარი ხანდაზმული კაცი მზის ჩასვლისას."
            fill
            quality={90}
            sizes="(min-width: 1024px) 57vw, 100vw"
            className={`${styles.featureImage} ${styles.peaceImage}`}
          />
        </div>
        <div className={styles.featurePanel}>
          <div className={styles.featureCopy}>
            <h2 id="benefits-peace-heading" className={styles.featureHeading}>ტრანსცენდენტული მედიტაცია საზოგადოებრივი და მსოფლიო მშვიდობისთვის</h2>
            <p className={styles.featureDescription}>ადამიანების შინაგან სიმშვიდეს შეუძლია საზოგადოების და მთელი მსოფლიოს კოლექტიური ცნობიერების ამაღლება. კვლევები აჩვენებს, რომ ტრანსცენდენტული მედიტაციისა და მოწინავე TM-Sidhi პროგრამის დიდი ჯგუფების მიერ პრაქტიკა საზოგადოებაში დადებით ცვლილებებსა და ომის გავლენის შემცირებასთან არის დაკავშირებული.</p>
            <Link href="/peace" className={`${styles.featureButton} ${styles.peaceButton}`}>გაიგე მეტი</Link>
          </div>
        </div>
      </section>
      <section aria-labelledby="benefits-next-step-heading" className={styles.nextStep}>
        <div className={styles.nextStepContent}>
          <h2 id="benefits-next-step-heading" className={styles.nextStepHeading}>შემდეგი ნაბიჯი: როგორ ვისწავლოთ ტრანსცენდენტული მედიტაციის ტექნიკა</h2>
          <p className={styles.nextStepDescription}>გაიგეთ მეტი ტრანსცენდენტული მედიტაციის კურსის შესახებ — როგორია მისი სტრუქტურა, რა ღირს და რას მოიცავს.</p>
          <Link href="/#contact" className={styles.nextStepButton}>გაეცანით TM-ის კურსს</Link>
        </div>
      </section>
      <ClosingCta showLearnMore={false} />
    </article>
  );
}
