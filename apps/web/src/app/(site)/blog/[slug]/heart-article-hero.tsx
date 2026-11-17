import Image from 'next/image';
import { TeacherCta } from '@/components/teacher-cta';
import { INTRODUCTORY_MEETING_ROUTE } from '@/lib/routes';
import type { Article } from '@/content/articles';
import hero from '../../stress-and-anxiety/stress-and-anxiety.module.css';
import overlay from '../articles-hero.module.css';
import { ArticlesHeaderBackground } from '../articles-header-background';
import styles from './heart-article-hero.module.css';
import sleepArticle from './sleep-article-hero.module.css';
import research from '@/components/research-layout.module.css';

export function HeartArticleHero({ title, image }: { title: string; image: NonNullable<Article['image']> }) {
  return (
    <article>
      <ArticlesHeaderBackground />
      <section aria-labelledby="heart-article-heading" className={`${hero.hero} ${overlay.hero} ${styles.hero}`}>
        <Image
          src={image.src}
          alt={image.alt}
          fill
          preload
          quality={90}
          sizes="100vw"
          className={`${hero.photograph} ${styles.photograph}`}
        />
        <h1 id="heart-article-heading" className={hero.heading}>{title}</h1>
      </section>
      <div className={`${styles.articleSpacing} bg-cream-100 text-plum-800`}>
        <div className="mx-auto max-w-[800px] space-y-6 px-5 text-left text-base leading-[1.85] sm:text-lg">
          <p>გულის დაავადებები მსოფლიოში სიკვდილიანობის ერთ-ერთი მთავარი მიზეზია, ამიტომ გულის ჯანმრთელობაზე ზრუნვა განსაკუთრებით მნიშვნელოვანია. ჯანსაღი კვება და რეგულარული ფიზიკური აქტივობა გულის დაავადებების რისკის შემცირების კარგად ცნობილი საშუალებებია. თუმცა კვლევებმა აჩვენა, რომ ტრანსცენდენტული მედიტაციის პრაქტიკაც ღირებული დამატებითი მეთოდია გულის ჯანმრთელობის გასაუმჯობესებლად.</p>
          <h2 className="pt-6 text-2xl font-normal leading-[1.45] sm:text-[1.75rem]">როგორ აუმჯობესებს TM გულის ჯანმრთელობას?</h2>
          <p>ტრანსცენდენტული მედიტაციის პრაქტიკის დროს გონება <strong>ძალისხმევის გარეშე მშვიდდება</strong> და ღრმა დასვენების მდგომარეობას აღწევს. ეს, თავის მხრივ, სხეულს მოდუნებისა და <strong>დაგროვილი სტრესისგან გათავისუფლების</strong> საშუალებას აძლევს.</p>
          <p>კვლევები აჩვენებს, რომ TM-ის რეგულარული პრაქტიკა <strong>დადებით გავლენას ახდენს გულის დაავადებების მომატებულ რისკთან დაკავშირებულ მრავალ მაჩვენებელსა და მდგომარეობაზე</strong>, მათ შორის:</p>
          <ul className="list-disc space-y-2 pl-6 leading-[1.5]">
            <li>სტრესის მაღალი დონე</li>
            <li>სხეულის მასის ინდექსის (BMI) მომატებული მაჩვენებელი</li>
            <li>მაღალი არტერიული წნევა</li>
            <li>მარცხენა პარკუჭის გაზრდილი მასა</li>
            <li>სტენოკარდია</li>
            <li>ქოლესტერინის მაღალი დონე</li>
          </ul>
          <h2 className="pt-6 text-2xl font-normal leading-[1.45] sm:text-[1.75rem]">TM ამცირებს არტერიულ წნევას</h2>
          <p>მაღალ არტერიულ წნევას, ანუ ჰიპერტენზიას, და გულის დაავადებებს შორის მჭიდრო კავშირი არსებობს. მაღალი არტერიული წნევა აზიანებს არტერიებს და გულს დამატებით დატვირთვას უქმნის. ეს განსაკუთრებით საყურადღებოა, რადგან მაღალი არტერიული წნევა <strong>ხშირად წლების განმავლობაში შეუმჩნეველი რჩება</strong>.</p>
          <p>სწორედ ამიტომ მნიშვნელოვანია ყოველდღიურ ცხოვრებაში ჯანსაღი და მდგრადი ჩვევების დამკვიდრება. მათ შორისაა ნაკლებად დამუშავებული საკვების მიღება, რეგულარული ფიზიკური აქტივობა, თამბაქოსა და ალკოჰოლის მოხმარების შეზღუდვა, ასევე ყოველდღიური მედიტაცია გონებისა და სხეულის მოსადუნებლად.</p>
        </div>
        <div className={`${research.embedded} ${styles.bloodPressureSpacing} text-left text-base leading-[1.85] sm:text-lg`}>
          <p>2007 წელს გამოქვეყნებულმა მეტაანალიზმა, რომელიც 107 კვლევას მოიცავდა, აჩვენა, რომ ტრანსცენდენტული მედიტაციის რეგულარული პრაქტიკა არტერიულ წნევას <strong>უფრო ეფექტურად ამცირებს</strong>, ვიდრე ბიოუკუკავშირი, სტრესის მართვის მეთოდები, კუნთების მოდუნების ტექნიკები და კომბინირებული მკურნალობა.</p>
          <figure className={`${research.figure} ${styles.chartFigure} ${styles.bloodPressureFigure}`}>
            <img
              src="/images/tm-blood-pressure-chart-en.svg"
              alt="Reduction of high blood pressure: health education −1.8, control techniques −4, TM practice −11 mm Hg. Reference: Anderson JW, Liu C, Kryscio RJ, American Journal of Hypertension 21 (3): 310–316, 2008."
              width={2123}
              height={1589}
              className={`${research.chart} ${styles.articleChart}`}
            />
          </figure>
        </div>
        <div className={`${styles.bloodPressureSpacing} mx-auto max-w-[800px] space-y-6 px-5 text-left text-base leading-[1.85] sm:text-lg`}>
          <h2 className="text-2xl font-normal leading-[1.45] sm:text-[1.75rem]">TM ამცირებს გულის მარცხენა პარკუჭის მასას</h2>
          <p>ჯანდაცვის სპეციალისტები ხშირად იყენებენ „მარცხენა პარკუჭის მასის“ მაჩვენებელს გულის დაავადებების რისკისა და გულზე არტერიული წნევის გავლენის შესაფასებლად. <strong>მარცხენა პარკუჭის გაზრდილი მასა გულის შეტევის, ინსულტისა და სიკვდილის მომატებულ რისკზე მიუთითებს.</strong></p>
          <p>კიდევ ერთმა სამეცნიერო კვლევამ აჩვენა, რომ TM-ის ტექნიკას ახალგაზრდების ჯანმრთელობისთვის <strong>მრავალი სარგებელი</strong> მოაქვს.</p>
          <p>კვლევის მონაწილეებში <strong>გაზომვადი გაუმჯობესება დაფიქსირდა</strong> შემდეგ მაჩვენებლებში:</p>
          <ul className="list-disc space-y-2 pl-6 leading-[1.5]">
            <li>სტრესის დონე</li>
            <li>არტერიული წნევა</li>
            <li>სისხლძარღვების ფუნქციონირება</li>
            <li>სუნთქვის სიხშირე</li>
            <li>სისხლის შრატში ქოლესტერინის დონე</li>
            <li>თამბაქოსა და ალკოჰოლის მოხმარება</li>
          </ul>
        </div>
        <div className={`${research.embedded} ${styles.bloodPressureSpacing} text-left text-base leading-[1.85] sm:text-lg`}>
          <div className="space-y-6">
            <h2 className="text-2xl font-normal leading-[1.45] sm:text-[1.75rem]">TM ამცირებს გულ-სისხლძარღვთა დაავადებების რისკფაქტორებს</h2>
            <p>სხვა კვლევებმაც აჩვენა, რომ TM-ის ტექნიკა ამცირებს გულ-სისხლძარღვთა დაავადებების <strong>რისკფაქტორების ფართო სპექტრს</strong> ჰიპერტენზიის განვითარების რისკის მქონე მოზარდებსა და ახალგაზრდებში. გულ-სისხლძარღვთა დაავადებების რისკფაქტორებია ქცევები და ჯანმრთელობის მდგომარეობასთან დაკავშირებული მაჩვენებლები, რომლებიც გულისა და სისხლძარღვების დაავადებების განვითარების რისკს ზრდის.</p>
            <p>კვლევებში ასევე დაფიქსირდა, რომ მონაწილეებს <strong>მნიშვნელოვნად შეუმცირდათ</strong> ჰიპერტენზიისა და გულის დაავადებების სამკურნალოდ გამოყენებული სტანდარტული მედიკამენტების საჭიროება.</p>
            <p>2012 წელს გამოქვეყნებულმა კვლევამ აჩვენა, რომ იმ ჯგუფში, რომლის მონაწილეებიც რეგულარულად აპრაქტიკებდნენ TM-ს, საკონტროლო ჯგუფთან შედარებით <strong>მნიშვნელოვნად შემცირდა გულის შეტევის, ინსულტისა და სიკვდილის რისკი</strong>.</p>
          </div>
          <figure className={`${research.figure} ${styles.chartFigure} ${styles.heartRiskFigure}`}>
            <img
              src="/images/tm-heart-health-chart-en.svg"
              alt="Original English research chart showing reduced risk of heart attacks, strokes, and death with Transcendental Meditation, including its scientific reference."
              width={1007}
              height={1278}
              className={`${research.chart} ${styles.articleChart}`}
            />
          </figure>
        </div>
      </div>
      <TeacherCta
        className={sleepArticle.ctaSpacing}
        headingId="heart-teacher-heading"
        heading="გსურს ტრანსცენდენტული მედიტაციის სწავლა?"
        buttonText="ჩაეწერე გაცნობით შეხვედრაზე"
        buttonHref={INTRODUCTORY_MEETING_ROUTE}
      >
        <p>შემოგვიერთდი გაცნობით შეხვედრაზე — ონლაინ ან პირისპირ — და გაიგე მეტი ტრანსცენდენტული მედიტაციის შესახებ.</p>
      </TeacherCta>
    </article>
  );
}
