import { ResearchCarousel } from '../stress-and-anxiety/research-carousel';
import styles from './peace-research-carousel.module.css';

const RESEARCH = [
  {
    summary: 'ახლო აღმოსავლეთში ჩატარებულმა კვლევამ გამოავლინა კავშირი TM-ისა და TM-Sidhi პროგრამის ჯგუფური პრაქტიკის მონაწილეთა რაოდენობას, ლიბანში ომის მსხვერპლთა რაოდენობასა და ისრაელში ცხოვრების ხარისხის მაჩვენებლებს შორის.',
    authors: 'Orme-Johnson DW, Alexander CN, Davies JL, Chandler HM, Larimore WE.',
    source: 'International Peace Project in the Middle East: The Effects of the Maharishi Technology of the Unified Field',
    url: 'https://doi.org/10.1177/0022002788032004009',
  },
  {
    summary: 'შვიდი ექსპერიმენტის მონაცემებით, კონფლიქტის დონე 48%-ით, ომთან დაკავშირებული სიკვდილიანობა 71%-ით შემცირდა, ხოლო დაპირისპირებულ მხარეებს შორის თანამშრომლობა 66%-ით გაიზარდა.',
    authors: 'Davies JL, Alexander CN.',
    source: 'Alleviating Political Violence through Reducing Collective Tension: Impact Assessment Analyses of the Lebanon War',
    url: 'https://www.gusp.org/pdf/JSBP-davies-alex-2005.pdf',
  },
  {
    summary: 'აშშ-ში TM-ისა და TM-Sidhi პროგრამის ჯგუფური პრაქტიკა დაკავშირებული იყო კონფლიქტების შემცირებასა და ცხოვრების ხარისხის გაუმჯობესებასთან.',
    authors: 'Orme-Johnson DW, Cavanaugh KL, Dillbeck MC, Goodman RS.',
    source: 'Field-Effects of Consciousness: A Seventeen-Year Study of the Effects of Group Practice of the Transcendental Meditation and TM-Sidhi Programs on Reducing National Stress in the United States',
    url: 'https://www.sciedupress.com/journal/index.php/wjss/article/view/22214',
  },
  {
    summary: 'სამეცნიერო კვლევებისა და პუბლიკაციების ვრცელი მიმოხილვა ტრანსცენდენტული მედიტაციის გავლენის შესახებ საზოგადოებრივ ურთიერთობებზე, კონფლიქტებსა და მსოფლიო მშვიდობაზე.',
    authors: 'Spivack B.',
    source: 'Benefits to Society — A Summary of Research on the Maharishi Effect',
    url: 'https://healingsocialdivisions.anantidotetoviolence.org/healing-social-divisions/benefits-to-society/',
  },
];

export function PeaceResearchCarousel() {
  return (
    <div className={styles.carousel}>
      <ResearchCarousel
        research={RESEARCH}
        heading="კვლევები ტრანსცენდენტულ მედიტაციაზე: მსოფლიო მშვიდობა"
        idPrefix="peace"
        sourceClassName={styles.publicationTitle}
      />
    </div>
  );
}
