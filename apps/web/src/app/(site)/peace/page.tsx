import type { Metadata } from 'next';
import Image from 'next/image';
import introduction from '../blog/[slug]/what-is-tm-intro.module.css';
import hero from '../stress-and-anxiety/stress-and-anxiety.module.css';
import styles from './peace.module.css';
import science from '../blog/[slug]/what-is-tm-different.module.css';
import chart from '../health/insomnia-section.module.css';

const HEADING = 'ტრანსცენდენტული მედიტაცია მსოფლიო მშვიდობის ხელშეწყობისთვის';

export const metadata: Metadata = {
  title: { absolute: `${HEADING} | learnTM.ge` },
};

export default function PeacePage() {
  return (
    <article>
      <section aria-labelledby="peace-heading" className={hero.hero}>
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
          <p>სტრესი აძლიერებს შიშს, იმპულსურ რეაქციებს, აზროვნების შეზღუდულობასა და შეუწყნარებლობას. დაგროვილი სტრესი საზოგადოებაში ძალადობრივი კონფლიქტების წარმოშობისთვის ხელსაყრელ პირობებს ქმნის.</p>
          <p>თუ ტრანსცენდენტული მედიტაციის (TM) ტექნიკა სტრესს ამცირებს, შეუძლია თუ არა მას მთლიანად საზოგადოების კოლექტიური ცნობიერების ამაღლება? შეუძლია თუ არა შინაგან სიმშვიდეს მსოფლიო მშვიდობის დამყარებას შეუწყოს ხელი?</p>
        </div>
      </section>
      <section aria-labelledby="peace-research-heading" className={hero.research}>
        <div className={hero.researchContent}>
          <h2 id="peace-research-heading" className={hero.researchHeading}>ტრანსცენდენტული მედიტაციის გავლენა საზოგადოებასა და მშვიდობაზე: სამეცნიერო მტკიცებულებები</h2>
          <div className={hero.researchDescription}>
            <p>ინდივიდუალური სტრესი გავლენას ახდენს ტვინის ფუნქციონირებაზე და შესაძლოა ადამიანის ქცევაც შეცვალოს. კვლევები მიუთითებს, რომ სტრესმა შეიძლება შეამციროს პრეფრონტალური ქერქის, ე.წ. „უმაღლესი ტვინის“, აქტივობა, რაც უფრო აგრესიულ, შიშზე დაფუძნებულ და ძალადობრივ ქცევას უწყობს ხელს. როდესაც საზოგადოებაში სტრესი იზრდება, მისი კოლექტიური გავლენა შესაძლოა კონფლიქტებისა და ომების სახით გამოვლინდეს.</p>
            <p>ჯერ კიდევ 1962 წელს ტრანსცენდენტული მედიტაციის დამფუძნებელმა მაჰარიში მაჰეშ იოგიმ იწინასწარმეტყველა, რომ „მსოფლიო მოსახლეობის თუნდაც ერთი პროცენტი რომ მედიტაციას აპრაქტიკებდეს, ეს საკმარისი იქნებოდა იმ სიძულვილის აღმოსაფხვრელად, რომელიც ომებს იწვევს“. მოგვიანებით ამ იდეას „მაჰარიშის ეფექტი“ ეწოდა. ამ კონცეფციის შემდგომი განვითარების მიხედვით, TM-ისა და მოწინავე TM-Sidhi პროგრამის ჯგუფური პრაქტიკისთვის საკმარისია მოსახლეობის 1%-ის კვადრატული ფესვის ტოლი რაოდენობის ადამიანი.</p>
            <p>მაჰარიშის ეფექტის შესასწავლად 50-ზე მეტი დემონსტრაცია ჩატარდა, ხოლო 23 სამეცნიერო კვლევაში აღწერილია საზოგადოებაში დაფიქსირებული დადებითი ცვლილებები და ომის გავლენის შემცირება, რომლებიც TM-ისა და TM-Sidhi პროგრამის ჯგუფური პრაქტიკის მონაწილეთა რაოდენობასთან კორელაციაში იყო.</p>
            <p>ამ კონცეფციის თანახმად, აღნიშნული ეფექტი მშვიდობაზე ფიქრისა თუ მისი სურვილის შედეგი არ არის. იგი ტრანსცენდენტული მედიტაციის ცნობიერებაზე დაფუძნებული ტექნიკების ჯგუფური პრაქტიკის შედეგად წარმოიქმნება.</p>
          </div>
        </div>
      </section>
      <section aria-labelledby="middle-east-peace-heading" className={science.section}>
        <div className={`${science.layout} ${chart.layout}`}>
          <div className={science.copy}>
            <h2 id="middle-east-peace-heading" className={science.heading}>ტრანსცენდენტული მედიტაციის ტექნიკა და ომის გავლენის შემცირება ახლო აღმოსავლეთში</h2>
            <div className={science.description}>
              <p>1983 წელს ტრანსცენდენტული მედიტაციის (TM) პრაქტიკოსები იერუსალიმში შეიკრიბნენ, რათა ისრაელსა და ლიბანს შორის ომის პერიოდში მაჰარიშის ეფექტი გამოეცადათ. ჯგუფის პრაქტიკამ კვლევაში გაზომილ მაჩვენებლებზე სტატისტიკურად მნიშვნელოვანი გავლენა მოახდინა.</p>
              <p>იმ დღეებში, როდესაც ჯგუფის მონაწილეთა რაოდენობა მაღალი იყო, მეზობელ ლიბანში ომის შედეგად დაღუპულთა რიცხვი 76%-ით შემცირდა. ექსპერიმენტმა აჩვენა საზოგადოებრივი ცხოვრების ხარისხის გაუმჯობესება იერუსალიმსა და ისრაელში, ასევე ომთან დაკავშირებული მდგომარეობის გაუმჯობესება ლიბანში.</p>
            </div>
          </div>
          <figure className={science.figure}>
            <img
              src="/images/tm-middle-east-peace-chart-en.svg"
              width={1702}
              height={1022}
              className={chart.chart}
              alt="ინგლისურენოვანი სამეცნიერო დიაგრამა: ახლო აღმოსავლეთში ომის გავლენის შემცირება, კვლევის მითითებით."
              loading="lazy"
            />
          </figure>
        </div>
      </section>
      <section aria-labelledby="peace-replications-heading" className={science.section}>
        <div className={`${science.layout} ${chart.layout}`}>
          <div className={`${science.copy} ${styles.replicationsCopy}`}>
            <h2 id="peace-replications-heading" className={science.heading}>ახლო აღმოსავლეთში ჩატარებული კვლევის ექვსჯერ გამეორება</h2>
            <div className={science.description}>
              <p>ისრაელსა და ლიბანში ჩატარებული კვლევა მომდევნო ორი წლის განმავლობაში ექვსჯერ განმეორდა.</p>
              <p>ამ ექსპერიმენტების შედეგები მოიცავდა:</p>
              <ul className={styles.resultsList}>
                <li>ომთან დაკავშირებული სიკვდილიანობა 71%-ით შემცირდა</li>
                <li>ომთან დაკავშირებული დაშავებების რაოდენობა 68%-ით შემცირდა</li>
                <li>კონფლიქტის დონე 48%-ით შემცირდა</li>
                <li>დაპირისპირებულ მხარეებს შორის თანამშრომლობა 66%-ით გაიზარდა</li>
              </ul>
            </div>
          </div>
          <figure className={`${science.figure} ${styles.replicationsFigure}`}>
            <img
              src="/images/tm-lebanon-replications-chart-en.svg"
              width={1703}
              height={941}
              className={chart.chart}
              alt="ინგლისურენოვანი სამეცნიერო დიაგრამა: ლიბანში ჩატარებული კვლევის გამეორებების შედეგები, კვლევის მითითებით."
              loading="lazy"
            />
          </figure>
        </div>
      </section>
      <section aria-labelledby="us-quality-life-heading" className={science.section}>
        <div className={`${science.layout} ${chart.layout}`}>
          <div className={science.copy}>
            <h2 id="us-quality-life-heading" className={science.heading}>ტრანსცენდენტული მედიტაცია და ცხოვრების ხარისხის გაუმჯობესება შეერთებულ შტატებში</h2>
            <div className={science.description}>
              <p>17-წლიანმა კვლევამ აჩვენა შეერთებულ შტატებში ცხოვრების ხარისხის სხვადასხვა მაჩვენებლის ფართო და მრავალმხრივი გაუმჯობესება მას შემდეგ, რაც აიოვის შტატის ქალაქ ფეირფილდში, მაჰარიშის საერთაშორისო უნივერსიტეტში, ტრანსცენდენტული მედიტაციის (TM) ტექნიკისა და TM-Sidhi პროგრამის ჯგუფურად პრაქტიკოსთა რაოდენობამ აშშ-ის მოსახლეობის 1%-ის კვადრატულ ფესვს გადააჭარბა (1 725 მონაწილე).</p>
              <p>მნიშვნელოვნად შემცირდა მკვლელობების, გაუპატიურების, ძალადობრივი თავდასხმების, ძარცვის, ჩვილთა სიკვდილიანობის, ნარკოტიკებთან დაკავშირებული სიკვდილიანობის, ავტოსაგზაო შემთხვევებით გამოწვეული სიკვდილიანობისა და დაზიანებების შედეგად ბავშვთა გარდაცვალების მაჩვენებლები.</p>
            </div>
          </div>
          <figure className={science.figure}>
            <img
              src="/images/tm-us-quality-life-chart-en.svg"
              width={1703}
              height={1108}
              className={chart.chart}
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
            <p>მაჰარიშის ეფექტის 40 წელზე მეტი ხნის დემონსტრაციების შედეგად დღეს უკვე ვხედავთ, რომ შესაძლებელია საზოგადოების კოლექტიური ცნობიერების ამაღლება, როდესაც საკმარისი რაოდენობის ადამიანი ტრანსცენდენტული მედიტაციისა (TM) და TM-Sidhi პროგრამების ჯგუფურ პრაქტიკას ეწევა.</p>
            <p>დოქტორ ტონი ნადერის ხელმძღვანელობით ტრანსცენდენტული მედიტაციის მსოფლიო ორგანიზაცია მიზნად ისახავს TM-ის ტექნიკის 10 000 პრაქტიკოსისგან შემდგარი ერთი ან რამდენიმე მუდმივი ჯგუფის შექმნას. ეს რაოდენობა ოდნავ აღემატება მსოფლიო მოსახლეობის 1%-ის კვადრატულ ფესვს, რაც საკმარისია გლობალურ მშვიდობაზე ხანგრძლივი გავლენის მოსახდენად.</p>
            <p>მაჰარიშის ეფექტის ერთ-ერთი უახლესი დემონსტრაცია 2024 წლის იანვარში, ინდოეთის ქალაქ ჰაიდერაბადში გაიმართა, სადაც ტრანსცენდენტული მედიტაციის 10 000-ზე მეტი პრაქტიკოსი შეიკრიბა.</p>
          </div>
        </div>
      </section>
    </article>
  );
}
