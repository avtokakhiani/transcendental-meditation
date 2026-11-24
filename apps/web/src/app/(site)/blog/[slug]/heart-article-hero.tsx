import {
  ArticleContent,
  ArticleText,
  ArticleResearch,
  ArticleChart,
  ArticleCta,
} from '@/components/article-layout';
import Image from 'next/image';
import type { Article } from '@/lib/articles/presentation';
import hero from '../../stress-and-anxiety/stress-and-anxiety.module.css';
import overlay from '../articles-hero.module.css';
import { ArticlesHeaderBackground } from '../articles-header-background';
import styles from './heart-article-hero.module.css';

export function HeartArticleHero({
  title,
  image,
}: {
  title: string;
  image: NonNullable<Article['image']>;
}) {
  return (
    <article>
      <ArticlesHeaderBackground />
      <section
        aria-labelledby="heart-article-heading"
        className={`${hero.hero} ${overlay.hero} ${styles.hero}`}
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          preload
          quality={90}
          sizes="100vw"
          className={`${hero.photograph} ${styles.photograph}`}
        />
        <h1 id="heart-article-heading" className={hero.heading}>
          {title}
        </h1>
      </section>
      <ArticleContent>
        <ArticleText>
          <p>გულის დაავადებები მსოფლიოში სიკვდილიანობის ერთ-ერთი მთავარი მიზეზია, ამიტომ გულის ჯანმრთელობაზე ზრუნვა განსაკუთრებით მნიშვნელოვანია. ჯანსაღი კვება და რეგულარული ფიზიკური აქტივობა გულის დაავადებების რისკის შემცირების კარგად ცნობილი საშუალებებია. თუმცა კვლევებმა აჩვენა, რომ ტრანსცენდენტული მედიტაციის პრაქტიკაც ღირებული დამატებითი მეთოდია გულის ჯანმრთელობის გასაუმჯობესებლად.</p>
          <h2>როგორ აუმჯობესებს TM გულის ჯანმრთელობას?</h2>
          <p>ტრანსცენდენტული მედიტაციის პრაქტიკის დროს გონება <strong>ძალისხმევის გარეშე მშვიდდება</strong> და ღრმა დასვენების მდგომარეობას აღწევს. ეს, თავის მხრივ, სხეულს მოდუნებისა და <strong>დაგროვილი სტრესისგან გათავისუფლების</strong> საშუალებას აძლევს.</p>
          <p>კვლევები აჩვენებს, რომ TM-ის რეგულარული პრაქტიკა <strong>დადებით გავლენას ახდენს გულის დაავადებების მომატებულ რისკთან დაკავშირებულ მრავალ მაჩვენებელსა და მდგომარეობაზე</strong>, მათ შორის:</p>
          <ul>
            <li>სტრესის მაღალი დონე</li>
            <li>სხეულის მასის ინდექსის (BMI) მომატებული მაჩვენებელი</li>
            <li>მაღალი არტერიული წნევა</li>
            <li>მარცხენა პარკუჭის გაზრდილი მასა</li>
            <li>სტენოკარდია</li>
            <li>ქოლესტერინის მაღალი დონე</li>
          </ul>
          <h2>TM ამცირებს არტერიულ წნევას</h2>
          <p>მაღალ არტერიულ წნევას, ანუ ჰიპერტენზიას, და გულის დაავადებებს შორის მჭიდრო კავშირი არსებობს. მაღალი არტერიული წნევა აზიანებს არტერიებს და გულს დამატებით დატვირთვას უქმნის. ეს განსაკუთრებით საყურადღებოა, რადგან მაღალი არტერიული წნევა <strong>ხშირად წლების განმავლობაში შეუმჩნეველი რჩება</strong>.</p>
          <p>სწორედ ამიტომ მნიშვნელოვანია ყოველდღიურ ცხოვრებაში ჯანსაღი და მდგრადი ჩვევების დამკვიდრება. მათ შორისაა ნაკლებად დამუშავებული საკვების მიღება, რეგულარული ფიზიკური აქტივობა, თამბაქოსა და ალკოჰოლის მოხმარების შეზღუდვა, ასევე ყოველდღიური მედიტაცია გონებისა და სხეულის მოსადუნებლად.</p>
        </ArticleText>
        <ArticleResearch
          chart={
            <ArticleChart
              figureClassName={`${styles.chartFigure} ${styles.bloodPressureFigure}`}
              src="/images/tm-blood-pressure-chart-en.svg"
              alt="Reduction of high blood pressure: health education −1.8, control techniques −4, TM practice −11 mm Hg. Reference: Anderson JW, Liu C, Kryscio RJ, American Journal of Hypertension 21 (3): 310–316, 2008."
              width={2123}
              height={1589}
              className={styles.articleChart}
            />
          }
        >
          <p>2007 წელს გამოქვეყნებულმა მეტაანალიზმა, რომელიც 107 კვლევას მოიცავდა, აჩვენა, რომ ტრანსცენდენტული მედიტაციის რეგულარული პრაქტიკა არტერიულ წნევას <strong>უფრო ეფექტურად ამცირებს</strong>, ვიდრე ბიოუკუკავშირი, სტრესის მართვის მეთოდები, კუნთების მოდუნების ტექნიკები და კომბინირებული მკურნალობა.</p>
        </ArticleResearch>
        <ArticleText separated>
          <h2>TM ამცირებს გულის მარცხენა პარკუჭის მასას</h2>
          <p>ჯანდაცვის სპეციალისტები ხშირად იყენებენ „მარცხენა პარკუჭის მასის“ მაჩვენებელს გულის დაავადებების რისკისა და გულზე არტერიული წნევის გავლენის შესაფასებლად. <strong>მარცხენა პარკუჭის გაზრდილი მასა გულის შეტევის, ინსულტისა და სიკვდილის მომატებულ რისკზე მიუთითებს.</strong></p>
          <p>კიდევ ერთმა სამეცნიერო კვლევამ აჩვენა, რომ TM-ის ტექნიკას ახალგაზრდების ჯანმრთელობისთვის <strong>მრავალი სარგებელი</strong> მოაქვს.</p>
          <p>კვლევის მონაწილეებში <strong>გაზომვადი გაუმჯობესება დაფიქსირდა</strong> შემდეგ მაჩვენებლებში:</p>
          <ul>
            <li>სტრესის დონე</li>
            <li>არტერიული წნევა</li>
            <li>სისხლძარღვების ფუნქციონირება</li>
            <li>სუნთქვის სიხშირე</li>
            <li>სისხლის შრატში ქოლესტერინის დონე</li>
            <li>თამბაქოსა და ალკოჰოლის მოხმარება</li>
          </ul>
        </ArticleText>
        <ArticleResearch
          chart={
            <ArticleChart
              figureClassName={`${styles.chartFigure} ${styles.heartRiskFigure}`}
              src="/images/tm-heart-health-chart-en.svg"
              alt="Original English research chart showing reduced risk of heart attacks, strokes, and death with Transcendental Meditation, including its scientific reference."
              width={1007}
              height={1278}
              className={styles.articleChart}
            />
          }
        >
          <h2>TM ამცირებს გულ-სისხლძარღვთა დაავადებების რისკფაქტორებს</h2>
          <p>სხვა კვლევებმაც აჩვენა, რომ TM-ის ტექნიკა ამცირებს გულ-სისხლძარღვთა დაავადებების <strong>რისკფაქტორების ფართო სპექტრს</strong> ჰიპერტენზიის განვითარების რისკის მქონე მოზარდებსა და ახალგაზრდებში. გულ-სისხლძარღვთა დაავადებების რისკფაქტორებია ქცევები და ჯანმრთელობის მდგომარეობასთან დაკავშირებული მაჩვენებლები, რომლებიც გულისა და სისხლძარღვების დაავადებების განვითარების რისკს ზრდის.</p>
          <p>კვლევებში ასევე დაფიქსირდა, რომ მონაწილეებს <strong>მნიშვნელოვნად შეუმცირდათ</strong> ჰიპერტენზიისა და გულის დაავადებების სამკურნალოდ გამოყენებული სტანდარტული მედიკამენტების საჭიროება.</p>
          <p>2012 წელს გამოქვეყნებულმა კვლევამ აჩვენა, რომ იმ ჯგუფში, რომლის მონაწილეებიც რეგულარულად აპრაქტიკებდნენ TM-ს, საკონტროლო ჯგუფთან შედარებით <strong>მნიშვნელოვნად შემცირდა გულის შეტევის, ინსულტისა და სიკვდილის რისკი</strong>.</p>
        </ArticleResearch>
      </ArticleContent>
      <ArticleCta headingId="heart-teacher-heading" />
    </article>
  );
}
