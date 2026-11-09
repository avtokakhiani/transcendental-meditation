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
          <p>როდესაც თავს უფრო ბედნიერად ვგრძნობთ და ნაკლებ სტრესს განვიცდით, ეს დადებითი განწყობა ბუნებრივად აისახება ჩვენს ურთიერთობებზეც. ტრანსცენდენტული მედიტაციის ტექნიკა ეფექტურად ამცირებს სტრესს და ხელს უწყობს შინაგანი სიმშვიდისა და სიხარულის გაძლიერებას.</p>
          <p>რეგულარული პრაქტიკის შედეგად სხვა ადამიანების მიმართ ჩვენი დამოკიდებულება უფრო პოზიტიური ხდება, რაც ურთიერთგაგებას, თანაგრძნობასა და უფრო თბილი და ჰარმონიული ურთიერთობების ჩამოყალიბებას უწყობს ხელს.</p>
        </div>
      </section>
      <section aria-labelledby="relationships-research-heading" className={hero.research}>
        <div className={hero.researchContent}>
          <h2 id="relationships-research-heading" className={hero.researchHeading}>სამეცნიერო კვლევები: ტრანსცენდენტული მედიტაცია და ურთიერთობები</h2>
          <div className={hero.researchDescription}>
            <p>სამეცნიერო კვლევები აჩვენებს, რომ ტრანსცენდენტული მედიტაციის რეგულარული პრაქტიკა ხელს უწყობს ურთიერთობების გაუმჯობესებას. როდესაც ნაკლებ სტრესს განვიცდით და ემოციურად უფრო გაწონასწორებულები ვართ, სხვებთან ურთიერთობა ბუნებრივად უფრო მარტივი, თბილი და პოზიტიური ხდება.</p>
            <p>კვლევებით გამოვლენილ დადებით შედეგებს შორისაა:</p>
          </div>
          <ul className={hero.researchList}>
            <li>ემოციების უკეთ რეგულირება</li>
            <li>სამუშაო გარემოში ურთიერთობების გაუმჯობესება</li>
            <li>უფრო პოზიტიური ოჯახური ურთიერთობები</li>
            <li>უფრო ღრმა და გულწრფელი კომუნიკაცია</li>
            <li>კონფლიქტების უფრო მშვიდად მოგვარება</li>
            <li>თავდაცვითი და იმპულსური რეაქციების შემცირება</li>
            <li>სასწავლო გარემოსა და მოსწავლეთა ქცევის გაუმჯობესება</li>
          </ul>
        </div>
      </section>
      <WorkplaceRelationshipsSection />
      <CommunicationSection />
      <RelationshipsResearchCarousel />
      <ClosingCta showLearnMore={false} />
    </article>
  );
}
