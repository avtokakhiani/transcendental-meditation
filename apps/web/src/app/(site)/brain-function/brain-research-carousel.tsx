import { ResearchCarousel } from '../stress-and-anxiety/research-carousel';
import styles from './brain-research-carousel.module.css';

const RESEARCH = [
  {
    "summary": "TM-ის ხანგრძლივ პრაქტიკოსებს საკონტროლო ჯგუფთან შედარებით უკეთესი შედეგები ჰქონდათ ლოგიკურ აზროვნებაში, ვერბალურ ინტელექტში, ხანგრძლივ მეხსიერებასა და ინფორმაციის დამუშავების სისწრაფეში.",
    "authors": "Nidich SI, Schneider RH, Nidich RJ, et al.",
    "source": "Effect of the Transcendental Meditation Program on Intellectual Development in Community-Dwelling Older Adults",
    "url": "https://openurl.ebsco.com/contentitem/gcd%3A17123970?id=ebsco%3Agcd%3A17123970&sid=ebsco%3Aplink%3Acrawler"
  },
  {
    "summary": "სკოლის ადმინისტრატორებსა და თანამშრომლებში TM-ის პრაქტიკამ მნიშვნელოვნად შეამცირა შფოთვა, ბრაზი, დეპრესია, დაღლილობა და დაბნეულობა, ხოლო ენერგიულობა გაზარდა.",
    "authors": "Travis F, Valosek L, Konrad A IV, Link J, et al.",
    "source": "Effect of Meditation on Psychological Distress and Brain Functioning: A Randomized Controlled Study",
    "url": "https://pubmed.ncbi.nlm.nih.gov/29936408/"
  },
  {
    "summary": "ტაივანის უფროსკლასელებში TM-ის პრაქტიკამ მნიშვნელოვნად გააუმჯობესა შვიდივე შესწავლილი შემეცნებითი მაჩვენებელი და სხვა მეთოდებზე უკეთესი შედეგები აჩვენა.",
    "authors": "So KT, Orme-Johnson DW.",
    "source": "Three Randomized Experiments on the Longitudinal Effects of the Transcendental Meditation Technique on Cognition",
    "url": "https://doi.org/10.1016/S0160-2896(01)00070-8"
  },
  {
    "summary": "ADHD-ის მქონე 11–14 წლის მოსწავლეებში TM-ის პრაქტიკამ მნიშვნელოვნად შეამცირა სტრესი და შფოთვა, შეამსუბუქა ADHD-ის სიმპტომები და გააუმჯობესა აღმასრულებელი ფუნქციები.",
    "authors": "Grosswald SJ, Stixrud WR, Travis F, Bateh MA.",
    "source": "Use of the Transcendental Meditation Technique to Reduce Symptoms of Attention Deficit Hyperactivity Disorder (ADHD) by Reducing Stress and Anxiety: An Exploratory Study",
    "url": "https://cie.asu.edu/ojs/index.php/cieatasu/article/view/1569"
  },
  {
    "summary": "კოლეჯის სტუდენტებში TM-ის პრაქტიკამ გააუმჯობესა ტვინის ინტეგრირებული ფუნქციონირება, შეამცირა ძილიანობა და დააჩქარა სტიმულებთან შეგუება.",
    "authors": "Travis F, Haaga DAF, Hagelin J, Tanner M, et al.",
    "source": "Effects of Transcendental Meditation Practice on Brain Functioning and Stress Reactivity in College Students",
    "url": "https://pubmed.ncbi.nlm.nih.gov/18854202/"
  },
  {
    "summary": "კოლეჯის სტუდენტებში TM-ის პრაქტიკამ გაზარდა ტვინის ნახევარსფეროებს შორის EEG-ტალღების კოჰერენტულობა და ალფა-1 აქტივობა ტვინის ნაგულისხმევი რეჟიმის ქსელში.",
    "authors": "Travis F, Haaga DAF, Hagelin J, Tanner M, et al.",
    "source": "A Self-Referential Default Brain State: Patterns of Coherence, Power, and eLORETA Sources During Eyes-Closed Rest and Transcendental Meditation Practice",
    "url": "https://pubmed.ncbi.nlm.nih.gov/19862565/"
  },
  {
    "summary": "საშუალო საფეხურის მოსწავლეებში TM-ის პრაქტიკამ გააუმჯობესა ინგლისურისა და მათემატიკის შედეგები. საკონტროლო ჯგუფთან შედარებით მეტმა მოსწავლემ აკადემიური მოსწრება ერთი ან მეტი საფეხურით გააუმჯობესა.",
    "authors": "Nidich SI, Mjasiri S, Nidich RJ, Rainforth MV, et al.",
    "source": "Academic Achievement and Transcendental Meditation: A Study with At-Risk Urban Middle School Students",
    "url": "https://eric.ed.gov/?id=EJ996375"
  },
  {
    "summary": "უგანდაში სიღარიბეში მცხოვრებ ქალებში TM-ის პრაქტიკამ მნიშვნელოვნად გააძლიერა საკუთარი შესაძლებლობების რწმენა, შეამცირა სტრესი და გააუმჯობესა ფსიქიკური და ფიზიკური კეთილდღეობა.",
    "authors": "Goldstein L, Smith AM, Romagnoli D, Katergi E.",
    "source": "The Effect of Transcendental Meditation on Self-Esteem, Self-Efficacy, and Gratitude, for Increasing Empowerment of Female Youth in Uganda",
    "url": "https://doi.org/10.1080/07399332.2024.2358789"
  }
];

export function BrainResearchCarousel() {
  return (
    <div className={styles.carousel}>
      <ResearchCarousel
        research={RESEARCH}
        heading="კვლევები ტრანსცენდენტულ მედიტაციაზე: ტვინის ფუნქციონირება და გონებრივი შესაძლებლობები"
        idPrefix="brain"
        sourceClassName={styles.publicationTitle}
      />
    </div>
  );
}
