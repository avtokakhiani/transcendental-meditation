import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Check, Monitor, UserRound, UsersRound } from 'lucide-react';
import { FaqAccordion } from '@/components/site/faq-accordion';
import { INTRODUCTORY_MEETING_ROUTE } from '@/lib/routes';
import hero from '../stress-and-anxiety/stress-and-anxiety.module.css';
import styles from './how-to-learn.module.css';

export const metadata: Metadata = {
  title: 'როგორ ვისწავლო ტრანსცენდენტული მედიტაცია?',
};

const steps = [
  {
    number: '01',
    heading: 'გაეცანი ტრანსცენდენტულ მედიტაციას',
    description: 'გაიგე, რა არის TM, როგორ მუშაობს და რით განსხვავდება მედიტაციის სხვა მეთოდებისგან.',
    link: { href: '/blog/ra-aris-transtsendentuli-meditatsia', text: 'რა არის TM?' },
  },
  {
    number: '02',
    heading: 'აღმოაჩინე TM-ის სარგებელი',
    description: 'გაეცანი ტრანსცენდენტული მედიტაციის სარგებელს ჯანმრთელობისთვის, გონებრივი სიცხადისთვის, ურთიერთობებისა და ყოველდღიური ცხოვრებისთვის.',
    link: { href: '/benefits', text: 'ყველა სარგებელი' },
  },
  {
    number: '03',
    heading: 'ჩაეწერე გაცნობით შეხვედრაზე',
    description: 'შეხვდი TM-ის სერტიფიცირებულ მასწავლებელს, მიიღე პასუხები შენთვის საინტერესო კითხვებზე და გაეცანი სწავლების პროცესს.',
    link: { href: INTRODUCTORY_MEETING_ROUTE, text: 'ჩაეწერე გაცნობით შეხვედრაზე' },
  },
  {
    number: '04',
    heading: 'შეათანხმე სწავლების დრო',
    description: 'გაცნობითი შეხვედრის შემდეგ მასწავლებელთან ინდივიდუალურად შეათანხმებ სწავლების თარიღსა და დროს და ჩაეწერები კურსზე.',
  },
] as const;

const questions = [
  {
    id: 'learn-online',
    question: 'შესაძლებელია TM-ის მთლიანად ონლაინ სწავლა?',
    answer: 'არა. ტრანსცენდენტული მედიტაციის სწავლების პირველი დღე ინდივიდუალურად, მასწავლებელთან პირისპირ მიმდინარეობს. მომდევნო სამი შეხვედრა ონლაინ ტარდება და შესაძლებელია ჯგუფურ ფორმატშიც მიმდინარეობდეს.',
  },
  {
    id: 'learn-experience',
    question: 'აუცილებელია მედიტაციის წინასწარი გამოცდილება?',
    answer: 'არა. ტრანსცენდენტული მედიტაციის შესასწავლად მედიტაციის წინასწარი გამოცდილება საჭირო არ არის.',
  },
  {
    id: 'learn-duration',
    question: 'როგორ გავიგო, როდის იწყება შემდეგი კურსი?',
    answer: 'სწავლების თარიღი და დრო მასწავლებელთან ინდივიდუალურად თანხმდება გაცნობითი შეხვედრის შემდეგ.',
  },
  {
    id: 'learn-registration',
    question: 'როგორ ხდება სწავლებაზე ჩაწერა?',
    answer: 'პირველ რიგში, ჩაეწერე გაცნობით შეხვედრაზე. შეხვედრის დროს მასწავლებელი გაგაცნობს სწავლების პროცესს, უპასუხებს შენს კითხვებს და მასთან ერთად შეათანხმებ კურსის დაწყების დროს.',
  },
  {
    id: 'learn-after-course',
    question: 'რა ხდება კურსის დასრულების შემდეგ?',
    answer: 'ოთხდღიანი კურსის დასრულების შემდეგ შეგიძლია უფასოდ მიიღო მონაწილეობა ყოველკვირეულ ჯგუფურ მედიტაციებში, როგორც პირადად, ისე ონლაინ.',
  },
];

export default function HowToLearnPage() {
  return (
    <>
    <section aria-labelledby="learn-heading" className={`${hero.hero} ${styles.hero}`}>
      <Image
        src="/images/learn-hero-dunes.jpeg"
        alt="ქალი მშვიდად ზის ქვიშის დიუნებზე მზის ჩასვლისას."
        fill
        preload
        quality={90}
        sizes="100vw"
        className={`${hero.photograph} ${styles.photograph}`}
      />
      <h1 id="learn-heading" className={`${hero.heading} ${styles.heading}`}>როგორ ვისწავლო ტრანსცენდენტული მედიტაცია?</h1>
    </section>
    <div className={styles.pageContent}>
      <section aria-labelledby="learn-start-heading" className={styles.section}>
        <div className={styles.container}>
          <h2 id="learn-start-heading" className={styles.sectionHeading}>როგორ დავიწყო?</h2>
          <ol className={styles.steps}>
            {steps.map((step) => (
              <li key={step.number} className={`${styles.step}${step.number === '03' ? ` ${styles.registrationStep}` : ''}`}>
                <span className={styles.number}>{step.number}</span>
                {'link' in step ? (
                  <Link href={step.link.href} className={`${styles.stepBody} ${styles.stepLink}`}>
                    <h3>
                        {step.heading}
                        {step.number === '03' && <ArrowUpRight aria-hidden="true" size={16} className={styles.headingArrow} />}
                    </h3>
                    <p>{step.description}</p>
                  </Link>
                ) : (
                  <div className={styles.stepBody}>
                    <h3>{step.heading}</h3>
                    <p>{step.description}</p>
                  </div>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="learn-course-heading" className={`${styles.section} ${styles.course}`}>
        <div className={styles.container}>
          <h2 id="learn-course-heading" className={styles.sectionHeading}>როგორ მიმდინარეობს სწავლება?</h2>
          <p className={styles.introduction}>ტრანსცენდენტული მედიტაციის სწავლება ოთხდღიანი კურსის ფარგლებში მიმდინარეობს. პირველი შეხვედრა ინდივიდუალურია, ხოლო მომდევნო სამი შეხვედრა ონლაინ ტარდება და შესაძლებელია ჯგუფურ ფორმატშიც მიმდინარეობდეს.</p>
          <div className={styles.courseGrid}>
            <div className={styles.courseBlock}>
              <span className={styles.label}><UserRound aria-hidden="true" size={17} />პირადად</span>
              <div aria-hidden="true" className={styles.dayMarkers}><span>01</span></div>
              <h3>პირველი დღე — ინდივიდუალური სწავლება</h3>
              <p>მასწავლებელს პირადად ხვდები და ინდივიდუალურად სწავლობ ტრანსცენდენტული მედიტაციის ტექნიკას.</p>
            </div>
            <div className={styles.courseBlock}>
              <span className={styles.label}><Monitor aria-hidden="true" size={17} />ონლაინ</span>
              <div aria-hidden="true" className={styles.dayMarkers}><span>02</span><span>03</span><span>04</span></div>
              <h3>მეორე–მეოთხე დღეები — ონლაინ შეხვედრები</h3>
              <p>მომდევნო სამი შეხვედრა ონლაინ მიმდინარეობს, ინდივიდუალურად ან ჯგუფურად. ამ შეხვედრებზე იღებ დამატებით ცოდნას, პასუხებს შენს კითხვებზე და პრაქტიკისთვის საჭირო განმარტებებს.</p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="learn-support-heading" className={styles.section}>
        <div className={styles.container}>
          <div className={styles.support}>
            <div className={styles.supportCopy}>
              <h2 id="learn-support-heading" className={styles.sectionHeading}>სწავლების შემდეგ — განაგრძე პრაქტიკა ჩვენთან ერთად</h2>
              <p>ოთხდღიანი კურსის დასრულების შემდეგ შეგიძლია <strong>უფასოდ</strong> მიიღო მონაწილეობა ყოველკვირეულ ჯგუფურ მედიტაციებში, რომლებიც ტარდება როგორც პირადად, ისე ონლაინ.</p>
              <p>ეს შეხვედრები შესაძლებლობას გაძლევს, რეგულარულად იმედიტირო სხვა პრაქტიკოსებთან ერთად და შეინარჩუნო კავშირი TM-ის საზოგადოებასთან.</p>
            </div>
            <ul className={styles.supportOptions}>
              <li><UsersRound aria-hidden="true" size={24} strokeWidth={1.4} /><span>ჯგუფური მედიტაცია პირადად</span></li>
              <li><Monitor aria-hidden="true" size={24} strokeWidth={1.4} /><span>ჯგუფური მედიტაცია ონლაინ</span></li>
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="learn-pricing-heading" className={`${styles.section} ${styles.pricing}`}>
        <div className={styles.container}>
          <h2 id="learn-pricing-heading" className={styles.sectionHeading}>სწავლების საფასური</h2>
          <div className={styles.pricingGrid}>
            {[
              { age: '24 წლის ჩათვლით და 60 წლიდან', price: '450' },
              { age: '25–59 წლის ასაკში', price: '850' },
            ].map((option) => (
              <div key={option.price} className={styles.priceCard}>
                <h3>{option.age}</h3>
                <p className={styles.price}>{option.price} <span>₾</span></p>
                <p className={styles.priceLabel}><Check aria-hidden="true" size={18} />სწავლების სრული კურსი</p>
              </div>
            ))}
          </div>
          <p className={styles.introduction}>სწავლების საფასური მოიცავს ოთხდღიან კურსს — ერთ ინდივიდუალურ და სამ ონლაინ შეხვედრას. კურსის დასრულების შემდეგ ყოველკვირეულ ჯგუფურ მედიტაციებში მონაწილეობა უფასოა.</p>
          <div className={styles.pricingAction}>
            <Link href={INTRODUCTORY_MEETING_ROUTE} className={styles.cta}>ჩაეწერე გაცნობით შეხვედრაზე<ArrowUpRight aria-hidden="true" size={18} /></Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="learn-faq-heading" className={`${styles.section} ${styles.faq}`}>
        <div className={styles.faqContainer}>
          <h2 id="learn-faq-heading" className={styles.sectionHeading}>ხშირად დასმული კითხვები</h2>
          <FaqAccordion items={questions} />
        </div>
      </section>
    </div>
    </>
  );
}
