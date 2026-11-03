import Image from 'next/image';
import { TeacherCta } from '@/components/teacher-cta';
import type { Article } from '@/content/articles';
import hero from '../../stress-and-anxiety/stress-and-anxiety.module.css';
import overlay from '../articles-hero.module.css';
import { ArticlesHeaderBackground } from '../articles-header-background';
import styles from './heart-article-hero.module.css';
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
      <div className="bg-cream-100 py-12 text-plum-800 sm:py-16">
        <div className="mx-auto max-w-[800px] space-y-6 px-5 text-left text-base leading-[1.85] sm:text-lg">
          <p>აშშ-ში სიკვდილიანობის მთავარი მიზეზი გულის დაავადებაა, ამიტომ ეს არის რამ, რომლის თავიდან ასაცილებლადაც ყველამ უნდა მივიღოთ ზომები. ჯანსაღი კვება და ვარჯიში გულის დაავადების რისკის შესამცირებლად კარგად ცნობილი საშუალებებია, მაგრამ კვლევებმა დაამტკიცა, რომ TM-ის პრაქტიკა კიდევ ერთი ღირებული ჩარევაა.</p>
          <h2 className="pt-6 text-2xl font-normal leading-[1.45] sm:text-[1.75rem]">როგორ აუმჯობესებს TM გულის ჯანმრთელობას?</h2>
          <p>ტრანსცენდენტული მედიტაციის ტექნიკის დროს გონება ძალდაუტანებლად წყნარდება და ღრმა დასვენების მდგომარეობას აღწევს. ეს, თავის მხრივ, სხეულს საშუალებას აძლევს მოდუნდეს და დაგროვილი სტრესი გაანეიტრალოს.</p>
          <p>კვლევები აჩვენებს, რომ TM-ის რეგულარული პრაქტიკა აუმჯობესებს გულის დაავადების მაღალი რისკთან დაკავშირებულ მრავალ სიმპტომს, მათ შორის:</p>
          <ul className="list-disc space-y-2 pl-6 leading-[1.5]">
            <li>სტრესის მაღალი დონე</li>
            <li>სხეულის მასის ინდექსის (BMI) მომატებული მაჩვენებელი</li>
            <li>მაღალი არტერიული წნევა</li>
            <li>მარცხენა პარკუჭის მომატებული მასა</li>
            <li>სტენოკარდია</li>
            <li>მაღალი ქოლესტერინი</li>
          </ul>
          <h2 className="pt-6 text-2xl font-normal leading-[1.45] sm:text-[1.75rem]">TM ამცირებს არტერიულ წნევას</h2>
          <p>მაღალ არტერიულ წნევას, ანუ ჰიპერტენზიას, და გულის დაავადებებს შორის ძლიერი კორელაცია არსებობს. მაღალი არტერიული წნევა აზიანებს არტერიებს და გულს დამატებით დატვირთვას აკისრებს. ეს განსაკუთრებით საყურადღებოა, რადგან მაღალი არტერიული წნევის სიმპტომები <strong>ხშირად წლების განმავლობაში შეუმჩნეველი რჩება</strong>.</p>
          <p>სწორედ ამიტომ მნიშვნელოვანია ყოველდღიურ ცხოვრებაში ჯანსაღი, გრძელვადიანად შესანარჩუნებელი ჩვევების დანერგვა. მათ შორისაა დაუმუშავებელი საკვების მიღება, რეგულარული ფიზიკური ვარჯიში, თამბაქოსა და ალკოჰოლის მოხმარების შეზღუდვა, ასევე ყოველდღიური მედიტაცია გონებისა და სხეულის მოსადუნებლად.</p>
        </div>
        <div className={`${research.embedded} text-left text-base leading-[1.85] sm:text-lg`}>
          <p>2007 წელს ჩატარებულმა 107 კვლევის მეტაანალიზმა აჩვენა, რომ ტრანსცენდენტული მედიტაციის რეგულარული პრაქტიკა არტერიულ წნევას უფრო ეფექტურად ამცირებს, ვიდრე ბიოუკუკავშირი, სტრესის მართვა, კუნთების მოდუნება და კომბინირებული მკურნალობა.</p>
          <figure className="min-w-0">
            <img
              src="/images/tm-blood-pressure-chart-en.svg"
              alt="Reduction of high blood pressure: health education −1.8, control techniques −4, TM practice −11 mm Hg. Reference: Anderson JW, Liu C, Kryscio RJ, American Journal of Hypertension 21 (3): 310–316, 2008."
              width={2123}
              height={1589}
              className={research.chart}
            />
          </figure>
        </div>
        <div className="mx-auto mt-24 max-w-[800px] space-y-6 px-5 text-left text-base leading-[1.85] sm:mt-32 sm:text-lg lg:mt-44">
          <h2 className="text-2xl font-normal leading-[1.45] sm:text-[1.75rem]">TM ამცირებს გულის მარცხენა პარკუჭის მასას</h2>
          <p>ჯანდაცვის სპეციალისტები ხშირად იყენებენ მაჩვენებელს, რომელსაც „მარცხენა პარკუჭის მასა“ ეწოდება, რათა შეაფასონ ადამიანის გულის დაავადების რისკი და არტერიული წნევის მაჩვენებლების გავლენა გულზე. მარცხენა პარკუჭის გაზრდილი მასა გულის შეტევის, ინსულტისა და სიკვდილის რისკის <strong>გამაფრთხილებელი ნიშანია</strong>.</p>
          <p>კიდევ ერთმა სამეცნიერო პუბლიკაციამ აჩვენა TM-ის ტექნიკის მრავალი სარგებელი ახალგაზრდების ჯანმრთელობისთვის.²</p>
          <p>მათ შემდეგ მაჩვენებლებში დაფიქსირდა <strong>გაზომვადი გაუმჯობესება</strong>:</p>
          <ul className="list-disc space-y-2 pl-6 leading-[1.5]">
            <li>სტრესის დონე</li>
            <li>არტერიული წნევა</li>
            <li>სისხლძარღვების ფუნქციონირება</li>
            <li>სუნთქვის სიხშირე</li>
            <li>სისხლის შრატში ქოლესტერინის დონე</li>
            <li>თამბაქოსა და ალკოჰოლის მოხმარება</li>
          </ul>
        </div>
        <div className={`${research.embedded} text-left text-base leading-[1.85] sm:text-lg`}>
          <div className="space-y-6">
            <h2 className="text-2xl font-normal leading-[1.45] sm:text-[1.75rem]">TM ამცირებს გულ-სისხლძარღვთა დაავადებების რისკფაქტორებს</h2>
            <p>სხვა კვლევებმაც აჩვენა, რომ TM-ის ტექნიკა ამცირებს გულ-სისხლძარღვთა დაავადებების <strong>რისკფაქტორების ფართო სპექტრს</strong> ჰიპერტენზიის განვითარების რისკის მქონე მოზარდებსა და ახალგაზრდებში.³ გულ-სისხლძარღვთა დაავადებების რისკფაქტორები არის ქცევები და სიმპტომები, რომლებიც ჩვეულებრივ გულის დაავადებებთან არის დაკავშირებული.</p>
            <p>ხშირად შეინიშნება, რომ კვლევის მონაწილეებს შეუძლიათ <strong>მნიშვნელოვნად შეამცირონ</strong> ჰიპერტენზიისა და გულის დაავადებების სამკურნალოდ გამოყენებული სტანდარტული სამედიცინო საშუალებების მოხმარება.</p>
            <p>2012 წლის ეს კვლევა აჩვენებს გულის შეტევის, ინსულტისა და სიკვდილის <strong>რისკის მნიშვნელოვან შემცირებას</strong> საკონტროლო ჯგუფთან შედარებით იმ ჯგუფში, რომლის მონაწილეებიც რეგულარულად აპრაქტიკებენ TM-ს.</p>
          </div>
          <figure className={research.figure}>
            <img
              src="/images/tm-heart-health-chart-en.svg"
              alt="Original English research chart showing reduced risk of heart attacks, strokes, and death with Transcendental Meditation, including its scientific reference."
              width={1007}
              height={1278}
              className={research.chart}
            />
          </figure>
        </div>
      </div>
      <TeacherCta headingId="heart-teacher-heading">
        <p>ტრანსცენდენტული მედიტაციის ტექნიკა ერთ-ერთი სასარგებლო საშუალებაა, რომელიც შეგიძლია გამოიყენო გულის ჯანმრთელობის გასაუმჯობესებლად და გულის დაავადებების რისკის შესამცირებლად.</p>
        <p>დაუკავშირდი შენს რეგიონში მოქმედ სერტიფიცირებულ TM-ის მასწავლებელს, რათა მეტი გაიგო ტრანსცენდენტული მედიტაციის ტექნიკისა და მისი მრავალი სხვა სარგებლის შესახებ.</p>
      </TeacherCta>
    </article>
  );
}
