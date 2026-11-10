import research from '@/components/research-layout.module.css';
import type { Metadata } from 'next';
import Image from 'next/image';
import benefitHero from '@/components/site/benefit-hero.module.css';
import { ClosingCta } from '@/components/landing/closing-cta';
import introduction from '../blog/[slug]/what-is-tm-intro.module.css';
import hero from '../stress-and-anxiety/stress-and-anxiety.module.css';
import styles from './peace.module.css';
import science from '../blog/[slug]/what-is-tm-different.module.css';
import { PeaceResearchCarousel } from './peace-research-carousel';

const HEADING = 'ტრანსცენდენტული მედიტაცია მსოფლიო მშვიდობის ხელშეწყობისთვის';

export const metadata: Metadata = {
  title: { absolute: `${HEADING} | learnTM.ge` },
};

export default function PeacePage() {
  return (
    <article>
      <section aria-labelledby="peace-heading" className={`${hero.hero} ${benefitHero.hero} ${benefitHero.peace}`}>
        <Image
          src="/images/peace-hero-sunset-man.jpeg"
          alt="მომღიმარი ხანდაზმული კაცი მზის ჩასვლისას."
          fill
          preload
          quality={90}
          sizes="100vw"
          className={`${hero.photograph} ${styles.photograph}`}
        />
        <h1 id="peace-heading" className={hero.heading}>{HEADING}</h1>
      </section>
      <section aria-label="შესავალი" className={introduction.continuation}>
        <div className={introduction.continuationCopy}>
          <p>სტრესი აძლიერებს შიშს, იმპულსურ რეაქციებს, აზროვნების შეზღუდულობასა და შეუწყნარებლობას. საზოგადოებაში დაგროვილი სტრესი ძალადობრივი კონფლიქტების წარმოშობისთვის ხელსაყრელ პირობებს ქმნის.</p>
          <p>თუ ტრანსცენდენტული მედიტაციის ტექნიკა ამცირებს სტრესს, შეუძლია თუ არა მას დადებითი გავლენა მოახდინოს მთელი საზოგადოების კოლექტიურ ცნობიერებაზე? შეუძლია თუ არა შინაგანი სიმშვიდის განვითარებას ხელი შეუწყოს მშვიდობის დამყარებას მთელ მსოფლიოში?</p>
        </div>
      </section>
      <section aria-labelledby="peace-research-heading" className={hero.research}>
        <div className={hero.researchContent}>
          <h2 id="peace-research-heading" className={hero.researchHeading}>სამეცნიერო კვლევები: ტრანსცენდენტული მედიტაცია და მშვიდობა</h2>
          <div className={hero.researchDescription}>
            <p>სტრესი გავლენას ახდენს ტვინის ფუნქციონირებასა და ადამიანის ქცევაზე. კვლევები აჩვენებს, რომ სტრესმა შეიძლება შეამციროს პრეფრონტალური ქერქის — ტვინის უმაღლეს ფუნქციებთან დაკავშირებული უბნის — აქტივობა, რაც ხელს უწყობს შიშით განპირობებულ, აგრესიულ და ძალადობრივ რეაქციებს. საზოგადოებაში სტრესის დაგროვებამ კი შესაძლოა ხელი შეუწყოს კონფლიქტებისა და ომების წარმოშობას.</p>
            <p>ჯერ კიდევ 1962 წელს ტრანსცენდენტული მედიტაციის ფუძემდებელმა მაჰარიში მაჰეშ იოგიმ იწინასწარმეტყველა: „მსოფლიო მოსახლეობის თუნდაც ერთი პროცენტი რომ მედიტაციას აპრაქტიკებდეს, ეს საკმარისი იქნებოდა იმ სიძულვილის აღმოსაფხვრელად, რომელიც ომებს იწვევს“. ამ იდეას მოგვიანებით „მაჰარიშის ეფექტი“ ეწოდა. ამ კონცეფციის შემდგომი განვითარების მიხედვით, ეფექტის მისაღწევად საკმარისია მოსახლეობის 1%-ის კვადრატული ფესვის ტოლი რაოდენობის ადამიანმა ტრანსცენდენტული მედიტაცია და მოწინავე TM-Sidhi პროგრამა ერთობლივად, ჯგუფურად აპრაქტიკოს.</p>
            <p>მაჰარიშის ეფექტის შესასწავლად 50-ზე მეტი დემონსტრაცია ჩატარდა. მათ საფუძველზე გამოქვეყნებულ 23 სამეცნიერო კვლევაში აღწერილია საზოგადოებაში დაფიქსირებული დადებითი ცვლილებები და ომებთან დაკავშირებული მოვლენების შემცირება, რაც TM-ისა და TM-Sidhi პროგრამის ჯგუფური პრაქტიკის მონაწილეთა რაოდენობასთან კორელაციაში იყო.</p>
            <p>ამ კონცეფციის თანახმად, მშვიდობის ხელშეწყობის ეფექტი მშვიდობაზე ფიქრით ან მისი სურვილით კი არ მიიღწევა, არამედ ტრანსცენდენტული მედიტაციისა და TM-Sidhi პროგრამის ჯგუფური პრაქტიკის შედეგად წარმოიქმნება.</p>
          </div>
        </div>
      </section>
      <section aria-labelledby="middle-east-peace-heading" className={research.section}>
        <div className={research.layout}>
          <div className={science.copy}>
            <h2 id="middle-east-peace-heading" className={science.heading}>ტრანსცენდენტული მედიტაცია და ომის გავლენის შემცირება ახლო აღმოსავლეთში</h2>
            <div className={science.description}>
              <p>1983 წელს ტრანსცენდენტული მედიტაციის პრაქტიკოსები იერუსალიმში შეიკრიბნენ, რათა ლიბანში მიმდინარე ომის დროს მაჰარიშის ეფექტი გამოეცადათ. კვლევამ ჯგუფური პრაქტიკის მონაწილეთა რაოდენობასა და საზოგადოებრივი ცხოვრების სხვადასხვა მაჩვენებელს შორის სტატისტიკურად მნიშვნელოვანი კავშირი გამოავლინა.</p>
              <p>კვლევის მიხედვით, იმ დღეებში, როდესაც ჯგუფის მონაწილეთა რაოდენობა მაღალი იყო, მეზობელ ლიბანში ომის შედეგად დაღუპულთა რიცხვი 76%-ით ნაკლები აღმოჩნდა, ვიდრე მონაწილეთა მცირე რაოდენობის დღეებში. ამავე პერიოდში დაფიქსირდა საზოგადოებრივი ცხოვრების ხარისხის გაუმჯობესება იერუსალიმსა და ისრაელში, ასევე ომის ინტენსივობის შემცირება ლიბანში.</p>
            </div>
          </div>
          <figure className={research.figure}>
            <img
              src="/images/tm-middle-east-peace-chart-en.svg"
              width={1702}
              height={1022}
              className={`${research.chart} ${styles.middleEastChart}`}
              alt="ინგლისურენოვანი სამეცნიერო დიაგრამა: ახლო აღმოსავლეთში ომის გავლენის შემცირება, კვლევის მითითებით."
              loading="lazy"
            />
          </figure>
        </div>
      </section>
      <section aria-labelledby="peace-replications-heading" className={research.section}>
        <div className={research.layout}>
          <div className={`${science.copy} ${styles.replicationsCopy}`}>
            <h2 id="peace-replications-heading" className={science.heading}>ახლო აღმოსავლეთის კვლევის ექვსი განმეორება</h2>
            <div className={science.description}>
              <p>ისრაელსა და ლიბანში ჩატარებული კვლევა მომდევნო ორი წლის განმავლობაში კიდევ ექვსჯერ განმეორდა.</p>
              <p>ამ კვლევებში დაფიქსირდა შემდეგი ცვლილებები:</p>
              <ul className={styles.resultsList}>
                <li>ომთან დაკავშირებული სიკვდილიანობა 71%-ით შემცირდა</li>
                <li>ომთან დაკავშირებული დაშავებების რაოდენობა 68%-ით შემცირდა</li>
                <li>კონფლიქტის დონე 48%-ით შემცირდა</li>
                <li>დაპირისპირებულ მხარეებს შორის თანამშრომლობა 66%-ით გაიზარდა</li>
              </ul>
            </div>
          </div>
          <figure className={`${research.figure} ${styles.replicationsFigure}`}>
            <img
              src="/images/tm-lebanon-replications-chart-en.svg"
              width={1703}
              height={941}
              className={`${research.chart} ${styles.replicationsChart}`}
              alt="ინგლისურენოვანი სამეცნიერო დიაგრამა: ლიბანში ჩატარებული კვლევის გამეორებების შედეგები, კვლევის მითითებით."
              loading="lazy"
            />
          </figure>
        </div>
      </section>
      <section aria-labelledby="us-quality-life-heading" className={research.section}>
        <div className={research.layout}>
          <div className={science.copy}>
            <h2 id="us-quality-life-heading" className={science.heading}>ტრანსცენდენტული მედიტაცია და ცხოვრების ხარისხის გაუმჯობესება შეერთებულ შტატებში</h2>
            <div className={science.description}>
              <p>17-წლიანმა კვლევამ აჩვენა შეერთებულ შტატებში ცხოვრების ხარისხის სხვადასხვა მაჩვენებლის მნიშვნელოვანი გაუმჯობესება მას შემდეგ, რაც აიოვას შტატის ქალაქ ფეირფილდში, მაჰარიშის საერთაშორისო უნივერსიტეტში, ტრანსცენდენტული მედიტაციის ტექნიკისა და TM-Sidhi პროგრამის ჯგუფური პრაქტიკის მონაწილეთა რაოდენობამ აშშ-ის მოსახლეობის 1%-ის კვადრატულ ფესვს გადააჭარბა (1 725 მონაწილე).</p>
              <p>კვლევის პერიოდში მნიშვნელოვნად შემცირდა მკვლელობების, გაუპატიურებების, ძალადობრივი თავდასხმებისა და ქურდობის მაჩვენებლები. ასევე შემცირდა ჩვილთა სიკვდილიანობა, ნარკოტიკებთან დაკავშირებული სიკვდილიანობა, ავტოსაგზაო შემთხვევების შედეგად დაღუპულთა და ტრავმებით გარდაცვლილ ბავშვთა რაოდენობა.</p>
            </div>
          </div>
          <figure className={research.figure}>
            <img
              src="/images/tm-us-quality-life-chart-en.svg"
              width={1703}
              height={1108}
              className={`${research.chart} ${styles.usQualityLifeChart}`}
              alt="ინგლისურენოვანი სამეცნიერო დიაგრამა: შეერთებულ შტატებში ცხოვრების ხარისხის გაუმჯობესება, კვლევის მითითებით."
              loading="lazy"
            />
          </figure>
        </div>
      </section>
      <section aria-labelledby="world-peace-heading" className={styles.worldPeace}>
        <div className={styles.gatheringPhoto}>
          <Image
            src="/images/tm-hyderabad-group-gathering.png"
            alt="ტრანსცენდენტული მედიტაციის პრაქტიკოსთა დიდი შეკრება ჰაიდერაბადში, ინდოეთი."
            fill
            unoptimized
            sizes="(min-width: 1024px) 50vw, 100vw"
            className={styles.gatheringImage}
          />
        </div>
        <div className={styles.worldPeaceCopy}>
          <h2 id="world-peace-heading" className={science.heading}>ნამდვილი და მუდმივი მსოფლიო მშვიდობისკენ</h2>
          <div className={science.description}>
            <p>მაჰარიშის ეფექტის 40 წელზე მეტი ხნის განმავლობაში ჩატარებულმა დემონსტრაციებმა აჩვენა, რომ საზოგადოების კოლექტიური ცნობიერების ამაღლება შესაძლებელია, როდესაც საკმარისი რაოდენობის ადამიანი ტრანსცენდენტული მედიტაციის ტექნიკასა და TM-Sidhi პროგრამას ერთობლივად, ჯგუფურად აპრაქტიკებს.</p>
            <p>დოქტორ ტონი ნეიდერის ხელმძღვანელობით, ტრანსცენდენტული მედიტაციის საერთაშორისო ორგანიზაცია მიზნად ისახავს 10 000 პრაქტიკოსისგან შემდგარი ერთი ან რამდენიმე მუდმივი ჯგუფის შექმნას. ეს რაოდენობა აღემატება მსოფლიო მოსახლეობის 1%-ის კვადრატულ ფესვს და, მაჰარიშის ეფექტის კონცეფციის თანახმად, საკმარისია მსოფლიო მშვიდობაზე ხანგრძლივი დადებითი გავლენის მოსახდენად.</p>
            <p>მაჰარიშის ეფექტის ერთ-ერთი მასშტაბური დემონსტრაცია 2024 წლის იანვარში ინდოეთის ქალაქ ჰაიდარაბადში გაიმართა, სადაც ტრანსცენდენტული მედიტაციისა და TM-Sidhi პროგრამის 10 000-ზე მეტი პრაქტიკოსი შეიკრიბა.</p>
          </div>
        </div>
      </section>
      <PeaceResearchCarousel />
      <ClosingCta showLearnMore={false} />
    </article>
  );
}
