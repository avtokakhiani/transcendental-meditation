import { ResearchCarousel } from '../stress-and-anxiety/research-carousel';

const RESEARCH = [
  {
    summary: '17 რანდომიზებული კვლევის მეტაანალიზმა აჩვენა, რომ ტრანსცენდენტული მედიტაციის პრაქტიკა დაკავშირებული იყო სისტოლური არტერიული წნევის საშუალოდ 5 მმ ვწყ. სვ.-ით, ხოლო დიასტოლური წნევის 2.8 მმ ვწყ. სვ.-ით შემცირებასთან.',
    authors: 'Rainforth MV, Schneider RH, Nidich SI, et al.',
    source: 'Stress Reduction Programs in Patients with Elevated Blood Pressure: A Systematic Review and Meta-analysis',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC2268875/',
  },
  {
    summary: '84 ადამიანის მონაწილეობით ჩატარებულ კვლევაში TM-ისა და TM-Sidhi პროგრამის ხანგრძლივ პრაქტიკოსებს შესწავლილი ფიზიოლოგიური მაჩვენებლებით საშუალოდ 12 წლით ახალგაზრდა ბიოლოგიური ასაკი აღენიშნებოდათ ზოგად პოპულაციასთან შედარებით.',
    authors: 'Wallace RK, Dillbeck M, Jacobe E, Harrington B.',
    source: 'The Effects of the Transcendental Meditation and TM-Sidhi Program on the Aging Process',
    url: 'https://pubmed.ncbi.nlm.nih.gov/6763007/',
  },
  {
    summary: 'კვლევაში TM-ის პრაქტიკოსებში დაფიქსირდა სეროტონინის მეტაბოლიტის მატება და კატექოლამინების მეტაბოლიტის შემცირება. ავტორები ამ ცვლილებებს ორგანიზმის მოდუნებისა და სტრესულ რეაქციაზე გადასვლის შემცირების შესაძლო მექანიზმებს უკავშირებდნენ.',
    authors: 'Bujatti M, Riederer P.',
    source: 'Serotonin, Noradrenaline, Dopamine Metabolites in Transcendental Meditation-Technique',
    url: 'https://pubmed.ncbi.nlm.nih.gov/789821/',
  },
  {
    summary: 'სამუშაო გარემოში ჩატარებულ კვლევაში TM-ის რეგულარულ პრაქტიკოსებს საკონტროლო ჯგუფთან შედარებით შეუმცირდათ შფოთვა, სამუშაო დაძაბულობა, უძილობა და დაღლილობა. ამასთან, გაუუმჯობესდათ ჯანმრთელობის თვითშეფასება, სამუშაოთი კმაყოფილება და ურთიერთობები.',
    authors: 'Alexander CN, Swanson GC, Rainforth MV, et al.',
    source: 'Effects of the Transcendental Meditation Program on Stress Reduction, Health, and Employee Development: A Prospective Study in Two Occupational Settings',
    url: 'https://doi.org/10.1080/10615809308248383',
  },
  {
    summary: 'გულის კორონარული დაავადების მქონე 201 აფროამერიკელი მონაწილის კვლევაში TM-ის ჯგუფს საკონტროლო ჯგუფთან შედარებით სიკვდილის, გულის შეტევისა და ინსულტის ერთობლივი რისკი 48%-ით დაბალი ჰქონდა დაკვირვების პერიოდში.',
    authors: 'Schneider RH, Grim CE, Rainforth MV, et al.',
    source: 'Stress Reduction in the Secondary Prevention of Cardiovascular Disease: A Randomized Controlled Trial of Transcendental Meditation and Health Education in African Americans',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7269100/',
  },
  {
    summary: 'ხუთწლიანი სადაზღვევო მონაცემების შედარებისას დაახლოებით 2 000 TM-ის პრაქტიკოსს სამედიცინო მომსახურების გამოყენების უფრო დაბალი მაჩვენებლები ჰქონდა. კვლევა დაკვირვებითია და მიზეზშედეგობრივ კავშირს არ ადასტურებს.',
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
    />
  );
}
