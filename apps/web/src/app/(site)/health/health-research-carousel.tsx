import { ResearchCarousel } from '../stress-and-anxiety/research-carousel';
import styles from './health-research-carousel.module.css';

const RESEARCH = [
  {
    summary: '17 კვლევის მეტაანალიზმა აჩვენა, რომ ტრანსცენდენტული მედიტაციის პრაქტიკამ მნიშვნელოვნად შეამცირა სისტოლური არტერიული წნევა საშუალოდ 5 მმ ვწყ. სვ.-ით, ხოლო დიასტოლური — 2,8 მმ ვწყ. სვ.-ით.',
    authors: 'Rainforth MV, Schneider RH, Nidich SI, et al.',
    source: 'Stress Reduction Programs in Patients with Elevated Blood Pressure: A Systematic Review and Meta-analysis',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC2268875/',
  },
  {
    summary: 'ტრანსცენდენტული მედიტაციისა და TM-Sidhi პროგრამის ხანგრძლივ პრაქტიკოსებს ზოგად მოსახლეობასთან შედარებით საშუალოდ 12 წლით ახალგაზრდა ბიოლოგიური ასაკი აღენიშნებოდათ, ხოლო ხუთწლიანი პრაქტიკის მქონეებს — 5 წლით.',
    authors: 'Wallace RK, Dillbeck M, Jacobe E, Harrington B.',
    source: 'The Effects of the Transcendental Meditation and TM-Sidhi Program on the Aging Process',
    url: 'https://pubmed.ncbi.nlm.nih.gov/6763007/',
  },
  {
    summary: 'ტრანსცენდენტული მედიტაციის პრაქტიკამ საკონტროლო ჯგუფთან შედარებით მნიშვნელოვნად გაზარდა სეროტონინის დონე და შეამცირა ადრენალინის დონე, რაც ხელს უწყობს სიმშვიდესა და სტრესული რეაქციის შემცირებას.',
    authors: 'Bujatti M, Riederer P.',
    source: 'Serotonin, Noradrenaline, Dopamine Metabolites in Transcendental Meditation-Technique',
    url: 'https://pubmed.ncbi.nlm.nih.gov/789821/',
  },
  {
    summary: 'ტრანსცენდენტული მედიტაციის პრაქტიკამ თანამშრომლებში შეამცირა შფოთვა, სამუშაო დაძაბულობა, უძილობა და დაღლილობა. ამავდროულად გაუმჯობესდა ჯანმრთელობა, შრომის ეფექტურობა, სამუშაოთი კმაყოფილება და ურთიერთობები.',
    authors: 'Alexander CN, Swanson GC, Rainforth MV, et al.',
    source: 'Effects of the Transcendental Meditation Program on Stress Reduction, Health, and Employee Development: A Prospective Study in Two Occupational Settings',
    url: 'https://doi.org/10.1080/10615809308248383',
  },
  {
    summary: 'გულის კორონარული დაავადების მქონე აფროამერიკელებში ტრანსცენდენტულმა მედიტაციამ 48%-ით შეამცირა სიკვდილის, გულის შეტევისა და ინსულტის ერთობლივი რისკი საკონტროლო ჯგუფთან შედარებით.',
    authors: 'Schneider RH, Grim CE, Rainforth MV, et al.',
    source: 'Stress Reduction in the Secondary Prevention of Cardiovascular Disease: A Randomized Controlled Trial of Transcendental Meditation and Health Education in African Americans',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7269100/',
  },
  {
    summary: 'ხუთწლიანმა კვლევამ აჩვენა, რომ ტრანსცენდენტული მედიტაციის პრაქტიკოსებს 50%-ით ნაკლები სამედიცინო ვიზიტი და სტაციონარში გატარებული დღე ჰქონდათ, ხოლო ასაკთან ერთად სამედიცინო მომსახურების საჭიროება უმნიშვნელოდ იზრდებოდა.',
    authors: 'Orme-Johnson D.',
    source: 'Medical Care Utilization and the Transcendental Meditation Program',
    url: 'https://pubmed.ncbi.nlm.nih.gov/3313489/',
  },
];

export function HealthResearchCarousel() {
  return (
    <ResearchCarousel
      research={RESEARCH}
      heading="კვლევები ტრანსცენდენტულ მედიტაციაზე: ჯანმრთელობის გაუმჯობესება"
      idPrefix="health"
      sourceClassName={styles.publicationTitle}
    />
  );
}
