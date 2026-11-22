import type { Metadata } from 'next';
import Image from 'next/image';
import { MapPin, Phone } from 'lucide-react';
import { LogoMark } from '@/components/site/logo';
import benefitHero from '@/components/site/benefit-hero.module.css';
import introduction from '../blog/[slug]/what-is-tm-intro.module.css';
import hero from '../stress-and-anxiety/stress-and-anxiety.module.css';
import styles from './about.module.css';

export const metadata: Metadata = { title: 'ჩვენ შესახებ' };

type TeacherSlot = {
  id: string;
  fullName: string | null;
  photo: string | null;
  city: string | null;
  phone: string | null;
};

// Replace the visible placeholders with the teachers' supplied information.
const teacherSlots: TeacherSlot[] = ['01', '02'].map((id) => ({
  id,
  fullName: null,
  photo: null,
  city: null,
  phone: null,
}));

export default function AboutPage() {
  return (
    <div className="bg-cream-100">
      <section aria-labelledby="about-heading" className={`${hero.hero} ${benefitHero.hero} ${styles.hero}`}>
        <Image
          src="/images/about-hero-mountain-sunset.jpeg"
          alt=""
          fill
          priority
          sizes="100vw"
          className={`${hero.photograph} ${styles.photograph}`}
        />
        <h1 id="about-heading" className={hero.heading}>ჩვენ შესახებ</h1>
      </section>

      <section className={`${introduction.continuation} ${styles.sectionSpacing}`}>
        <div className={styles.introductionCopy}>
          <p>learnTM.ge არის საგანმანათლებლო პროექტი, რომლის მიზანია, ტრანსცენდენტული მედიტაციის შესახებ ცოდნა და მისი შესწავლის შესაძლებლობა საქართველოში უფრო ხელმისაწვდომი გახადოს, რათა მეტმა ადამიანმა შეძლოს საკუთარი პოტენციალის განვითარება, შინაგანი სიმშვიდის მიღწევა და ცხოვრების ხარისხის გაუმჯობესება.</p>
          <p>ჩვენს ვებგვერდზე გაეცნობით ტრანსცენდენტული მედიტაციის ტექნიკას, მის სარგებელსა და სამეცნიერო კვლევებს. ასევე იპოვით სტატიებს, წიგნებსა და სხვა საგანმანათლებლო მასალებს, რომლებიც დაგეხმარებათ ამ თემების უკეთ გააზრებაში.</p>
          <p>საიტის მეშვეობით შეგიძლიათ დაუკავშირდეთ ჩვენს სერტიფიცირებულ მასწავლებლებს, ჩაეწეროთ უფასო გაცნობით შეხვედრაზე და გაიაროთ ტრანსცენდენტული მედიტაციის ოთხდღიანი კურსი.</p>
        </div>
      </section>

      <div className="bg-cream-200">
        <section aria-labelledby="teachers-heading" className={`mx-auto max-w-6xl px-5 sm:px-6 lg:px-10 ${styles.sectionSpacing}`}>
          <h2 id="teachers-heading" className="text-center text-2xl font-normal leading-snug sm:text-3xl">ჩვენი მასწავლებლები</h2>
          <div className={styles.teachersGrid}>
            {teacherSlots.map((teacher) => (
              <article key={teacher.id} className={styles.teacher} aria-labelledby={`teacher-${teacher.id}`}>
                <div className={styles.teacherPortrait} aria-hidden={teacher.photo ? undefined : true}>
                  {teacher.photo ? (
                    <Image
                      src={teacher.photo}
                      alt={teacher.fullName ?? ''}
                      fill
                      sizes="240px"
                      className={styles.teacherPhoto}
                    />
                  ) : (
                    <div className={styles.teacherLogo}>
                      <LogoMark className={styles.teacherLogoMark} />
                      <span>learnTM</span>
                    </div>
                  )}
                </div>
                <div className={styles.teacherDetails}>
                  <h3 id={`teacher-${teacher.id}`} className={styles.teacherName}>{teacher.fullName ?? '[სახელი და გვარი]'}</h3>
                  <p className={styles.teacherCertification}>ტრანსცენდენტული მედიტაციის სერტიფიცირებული მასწავლებელი</p>
                  <p className={styles.teacherContact}>
                    <MapPin aria-hidden="true" className={styles.contactIcon} strokeWidth={1.5} />
                    <span>{teacher.city ?? '[ქალაქი]'}</span>
                  </p>
                  <div className={styles.teacherContact}>
                    <Phone aria-hidden="true" className={styles.contactIcon} strokeWidth={1.5} />
                    {teacher.phone ? (
                      <a className={styles.teacherPhone} href={`tel:${teacher.phone.replace(/[^+\d]/g, '')}`}>{teacher.phone}</a>
                    ) : (
                      <span>[ტელეფონის ნომერი]</span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
      <section aria-labelledby="location-heading" className={`${styles.location} ${styles.sectionSpacing}`}>
        <div className={styles.locationLayout}>
          <div className={styles.locationCopy}>
            <h2 id="location-heading" className="text-2xl font-normal leading-snug sm:text-3xl">სად გვიპოვით?</h2>
            <address className={styles.locationAddress}>
              <p className={styles.locationCity}>თბილისი, ვერა</p>
              <p>სოფიკო ჭიაურელის ქ. 16</p>
              <p className={styles.locationDetail}>მეორე სადარბაზო</p>
              <a href="tel:+995511308939" className={styles.locationPhone}>+995 511 30 89 39</a>
            </address>
            <a
              href="https://maps.app.goo.gl/W1US48i64FUsu7ps8"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.locationLink}
            >
              Google Maps-ზე ნახვა
            </a>
          </div>
          <div className={styles.locationMapFrame}>
            <iframe
              title="თბილისი, სოფიკო ჭიაურელის ქ. 16 — Google Maps"
              src="https://www.google.com/maps?q=41.7101393,44.7803032&z=17&output=embed"
              className={styles.locationMap}
              loading="eager"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
