import type { Metadata } from 'next';
import Image from 'next/image';
import { ClosingCta } from '@/components/landing/closing-cta';
import introduction from '../blog/[slug]/what-is-tm-intro.module.css';
import hero from '../stress-and-anxiety/stress-and-anxiety.module.css';
import styles from './relationships.module.css';
import { WorkplaceRelationshipsSection } from './workplace-relationships-section';
import { CommunicationSection } from './communication-section';
import { RelationshipsResearchCarousel } from './relationships-research-carousel';

const HEADING = 'ტრანსცენდენტული მედიტაცია ურთიერთობების გასაუმჯობესებლად';

export const metadata: Metadata = {
  title: { absolute: `${HEADING} | learnTM.ge` },
};

export default function RelationshipsPage() {
  return (
    <article>
      <section aria-labelledby="relationships-heading" className={hero.hero}>
        <Image
          src="/images/relationships-hero.jpeg"
          alt="მომღიმარი ქალი გაშლილი ხელებით ღია ცის ქვეშ."
          fill
          preload
          quality={90}
          sizes="100vw"
          className={`${hero.photograph} ${styles.photograph}`}
        />
        <h1 id="relationships-heading" className={hero.heading}>{HEADING}</h1>
      </section>
      <section aria-label="შესავალი" className={introduction.continuation}>
        <div className={introduction.continuationCopy}>
          <p>როდესაც თავს უფრო ბედნიერად ვგრძნობთ და ნაკლებ სტრესს განვიცდით, ეს დადებითი განწყობა ბუნებრივად გადადის ჩვენს ურთიერთობებშიც. ტრანსცენდენტული მედიტაციის (TM) ტექნიკა სტრესის შემცირების ეფექტური საშუალებაა, რომელიც გვეხმარება შინაგანი კეთილდღეობის, სიმშვიდისა და სიხარულის გამოვლენაში.</p>
          <p>რეგულარული პრაქტიკის შედეგად ვამჩნევთ, რომ ჩვენს ურთიერთობებში ბუნებრივად შემოგვაქვს მეტი პოზიტიური განწყობა, რაც სხვებთან უფრო თბილ და ჰარმონიულ ურთიერთობას უწყობს ხელს.</p>
        </div>
      </section>
      <section aria-labelledby="relationships-research-heading" className={hero.research}>
        <div className={hero.researchContent}>
          <h2 id="relationships-research-heading" className={hero.researchHeading}>სამეცნიერო კვლევები: ტრანსცენდენტული მედიტაცია და ურთიერთობები</h2>
          <div className={hero.researchDescription}>
            <p>სამეცნიერო კვლევები მიუთითებს, რომ ტრანსცენდენტული მედიტაციის (TM) პრაქტიკამ შესაძლოა ხელი შეუწყოს ურთიერთობების გაუმჯობესებას. როდესაც ნაკლებ სტრესს განვიცდით და ემოციურად უფრო გაწონასწორებულები ვართ, სხვებთან ურთიერთობაც ბუნებრივად უფრო მარტივი და პოზიტიური ხდება.</p>
            <p>ტრანსცენდენტული მედიტაციის გავლენის შესახებ კვლევებში შესწავლილია შემდეგი მიმართულებები:</p>
          </div>
          <ul className={hero.researchList}>
            <li>ემოციების უკეთ რეგულირება</li>
            <li>სამუშაო გარემოში ურთიერთობების გაუმჯობესება</li>
            <li>უფრო პოზიტიური ოჯახური ურთიერთობები</li>
            <li>უფრო ღრმა საუბრები და ურთიერთგაგება</li>
            <li>კონფლიქტების უფრო მშვიდად მართვა</li>
            <li>თავდაცვითი და იმპულსური რეაქციების შემცირება</li>
            <li>სასწავლო გარემოსა და მოსწავლეთა ქცევის გაუმჯობესება</li>
          </ul>
        </div>
      </section>
      <WorkplaceRelationshipsSection />
      <CommunicationSection />
      <RelationshipsResearchCarousel />
      <ClosingCta background="benefits" />
    </article>
  );
}
