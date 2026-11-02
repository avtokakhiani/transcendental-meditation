import { ResearchCarousel } from '../stress-and-anxiety/research-carousel';

const RESEARCH = [
  {
    summary: '1983 წელს ახლო აღმოსავლეთში ჩატარებულმა კვლევამ აჩვენა კორელაცია TM-ისა და TM-Sidhi პროგრამის ჯგუფური პრაქტიკის მონაწილეთა რაოდენობას, ლიბანში ომის შედეგად დაღუპულთა მაჩვენებლებსა და ისრაელში ცხოვრების ხარისხის ცვლილებებს შორის.',
    authors: 'Orme-Johnson DW, Alexander CN, Davies JL, Chandler HM, Larimore WE.',
    source: 'International Peace Project in the Middle East: The Effects of the Maharishi Technology of the Unified Field',
    url: 'https://doi.org/10.1177/0022002788032004009',
  },
  {
    summary: 'შვიდი ექსპერიმენტის შედეგების მიხედვით, TM-ისა და TM-Sidhi პროგრამის ჯგუფური პრაქტიკის პერიოდში კონფლიქტის დონე 48%-ით, ომთან დაკავშირებული სიკვდილიანობა 71%-ით შემცირდა, ხოლო დაპირისპირებულ მხარეებს შორის თანამშრომლობა 66%-ით გაიზარდა.',
    authors: 'Davies JL, Alexander CN.',
    source: 'Alleviating Political Violence through Reducing Collective Tension: Impact Assessment Analyses of the Lebanon War',
    url: 'https://www.gusp.org/pdf/JSBP-davies-alex-2005.pdf',
  },
  {
    summary: 'აშშ-ში ჩატარებულმა 17-წლიანმა კვლევამ აჩვენა კორელაცია TM-ისა და TM-Sidhi პროგრამის ჯგუფური პრაქტიკის მონაწილეთა რაოდენობას, საზოგადოებრივი სტრესის სხვადასხვა მაჩვენებლის შემცირებასა და ცხოვრების ხარისხის გაუმჯობესებას შორის.',
    authors: 'Orme-Johnson DW, Cavanaugh KL, Dillbeck MC, Goodman RS.',
    source: 'Field-Effects of Consciousness: A Seventeen-Year Study of the Effects of Group Practice of the Transcendental Meditation and TM-Sidhi Programs on Reducing National Stress in the United States',
    url: 'https://www.sciedupress.com/journal/index.php/wjss/article/view/22214',
  },
  {
    summary: 'სამეცნიერო პუბლიკაციების ვრცელი ჩამონათვალი ტრანსცენდენტული მედიტაციისა და TM-Sidhi პროგრამის შესაძლო გავლენის შესახებ საზოგადოებრივ ურთიერთობებზე, კონფლიქტების შემცირებასა და მსოფლიო მშვიდობაზე.',
    authors: 'Spivack B.',
    source: 'Benefits to Society — A Summary of Research on the Maharishi Effect',
    url: 'https://healingsocialdivisions.anantidotetoviolence.org/healing-social-divisions/benefits-to-society/',
  },
];

export function PeaceResearchCarousel() {
  return (
    <ResearchCarousel
      research={RESEARCH}
      heading="კვლევები ტრანსცენდენტულ მედიტაციაზე: მსოფლიო მშვიდობა"
      idPrefix="peace"
    />
  );
}
