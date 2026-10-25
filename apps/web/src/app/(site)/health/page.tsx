import type { Metadata } from 'next';
import Image from 'next/image';
import introduction from '../blog/[slug]/what-is-tm-intro.module.css';
import hero from '../stress-and-anxiety/stress-and-anxiety.module.css';
import styles from './health.module.css';
import { InsomniaSection } from './insomnia-section';
import { HeartHealthSection } from './heart-health-section';
import { MedicalUtilizationSection } from './medical-utilization-section';
import { BloodPressureSection } from './blood-pressure-section';
import { HealthResearchCarousel } from './health-research-carousel';

const HEADING = 'ტრანსცენდენტული მედიტაცია ჯანმრთელობის გაუმჯობესებისთვის';

export const metadata: Metadata = {
  title: { absolute: `${HEADING} | learnTM.ge` },
};

export default function HealthPage() {
  return (
    <article>
      <section aria-labelledby="health-heading" className={`${hero.hero} ${styles.hero}`}>
        <Image
          src="/images/health-hero-hands-flower.jpeg"
          alt="ხელისგულებში მოთავსებული პატარა ყვითელი ყვავილი."
          fill
          preload
          quality={90}
          sizes="100vw"
          className={`${hero.photograph} ${styles.photograph}`}
        />
        <h1 id="health-heading" className={hero.heading}>{HEADING}</h1>
      </section>
      <section aria-label="შესავალი" className={introduction.continuation}>
        <div className={introduction.continuationCopy}>
          <p>სტრესი უარყოფითად მოქმედებს ჩვენს ჯანმრთელობაზე და ხელს უწყობს უძილობის, მაღალი არტერიული წნევის, გულის დაავადებების, იმუნური სისტემის დასუსტებისა და მრავალი სხვა დარღვევის განვითარებას.</p>
          <p>სტრესის შემცირებით ტრანსცენდენტული მედიტაციის (TM) ტექნიკა ხელს უწყობს ფიზიკური ჯანმრთელობის გაუმჯობესებას — გულის უკეთ ფუნქციონირებას, ხარისხიან ძილსა და ენერგიის მატებას.</p>
        </div>
      </section>
      <section aria-labelledby="health-research-heading" className={hero.research}>
        <div className={hero.researchContent}>
          <h2 id="health-research-heading" className={hero.researchHeading}>სამეცნიერო კვლევები: ტრანსცენდენტული მედიტაცია და ჯანმრთელობა</h2>
          <div className={hero.researchDescription}>
            <p>ასობით რეცენზირებულ სამეცნიერო კვლევაში შესწავლილია ტრანსცენდენტული მედიტაციის (TM) მრავალფეროვანი სარგებელი. დღეში ორჯერ, 20 წუთის განმავლობაში TM-ის რეგულარული პრაქტიკა შესაძლოა ხელს უწყობდეს ჯანმრთელობისა და საერთო კეთილდღეობის ხანგრძლივ გაუმჯობესებას.</p>
            <p>სამეცნიერო კვლევების მიხედვით, ტრანსცენდენტული მედიტაციის რეგულარულ პრაქტიკას შესაძლოა შემდეგი დადებითი შედეგები ახლდეს:</p>
          </div>
          <ul className={`${hero.researchList} ${styles.researchList}`}>
            <li>უფრო ღრმა და მშვიდი ძილი</li>
            <li>კორტიზოლის დონის შემცირება</li>
            <li>გონებისა და სხეულის მეტი სიმშვიდე და წონასწორობა</li>
            <li>გულის ჯანმრთელობის გაუმჯობესება და არტერიული წნევის რეგულირება</li>
            <li>ენერგიის მატება და იმუნური სისტემის გაძლიერება</li>
            <li>მეტი სიცოცხლისუნარიანობა და შედარებით ახალგაზრდა ბიოლოგიური ასაკი</li>
          </ul>
        </div>
      </section>
      <InsomniaSection />
      <HeartHealthSection />
      <MedicalUtilizationSection />
      <BloodPressureSection />
      <HealthResearchCarousel />
    </article>
  );
}
