import { ResearchCarousel } from '../stress-and-anxiety/research-carousel';

const RESEARCH = [
  {
    "summary": "60–74 წლის ადამიანების კვლევაში TM-ის ხანგრძლივ პრაქტიკოსებს საკონტროლო ჯგუფთან შედარებით უკეთესი შედეგები ჰქონდათ ლოგიკურ აზროვნებაში, ვერბალურ ინტელექტში, ხანგრძლივ მეხსიერებასა და ინფორმაციის დამუშავების სისწრაფეში.",
    "authors": "Nidich SI, Schneider RH, Nidich RJ, et al.",
    "source": "Effect of the Transcendental Meditation Program on Intellectual Development in Community-Dwelling Older Adults",
    "url": "https://openurl.ebsco.com/contentitem/gcd%3A17123970?id=ebsco%3Agcd%3A17123970&sid=ebsco%3Aplink%3Acrawler"
  },
  {
    "summary": "96 სასკოლო ადმინისტრატორისა და თანამშრომლის მონაწილეობით ჩატარებულ კვლევაში TM-ის ჯგუფში შემცირდა ფსიქოლოგიური დისტრესის მაჩვენებლები, გაიზარდა ენერგიულობა და გაუმჯობესდა ტვინის ინტეგრირებული ფუნქციონირების EEG-მაჩვენებლები.",
    "authors": "Travis F, Valosek L, Konrad A IV, Link J, et al.",
    "source": "Effect of Meditation on Psychological Distress and Brain Functioning: A Randomized Controlled Study",
    "url": "https://pubmed.ncbi.nlm.nih.gov/29936408/"
  },
  {
    "summary": "ტაივანში ჩატარებულ სამ რანდომიზებულ კვლევაში, რომლებშიც 362 მოსწავლე მონაწილეობდა, TM-ის პრაქტიკა დაკავშირებული იყო შვიდივე შესწავლილი შემეცნებითი მაჩვენებლის გაუმჯობესებასთან და ზოგიერთ მაჩვენებელში სხვა მედიტაციის მეთოდზე უკეთეს შედეგთან.",
    "authors": "So KT, Orme-Johnson DW.",
    "source": "Three Randomized Experiments on the Longitudinal Effects of the Transcendental Meditation Technique on Cognition",
    "url": "https://doi.org/10.1016/S0160-2896(01)00070-8"
  },
  {
    "summary": "11–14 წლის ყურადღების დეფიციტისა და ჰიპერაქტივობის აშლილობის (ADHD) მქონე მოსწავლეების მცირე, საძიებო კვლევაში TM-ის პრაქტიკის შემდეგ შემცირდა სტრესი და შფოთვა, გაუმჯობესდა ADHD-ის სიმპტომები და აღმასრულებელი ფუნქციების მაჩვენებლები.",
    "authors": "Grosswald SJ, Stixrud WR, Travis F, Bateh MA.",
    "source": "Use of the Transcendental Meditation Technique to Reduce Symptoms of Attention Deficit Hyperactivity Disorder (ADHD) by Reducing Stress and Anxiety: An Exploratory Study",
    "url": "https://cie.asu.edu/ojs/index.php/cieatasu/article/view/1569"
  },
  {
    "summary": "კოლეჯის 50 სტუდენტის რანდომიზებულ კვლევაში TM-ის პრაქტიკასთან დაკავშირებული იყო ტვინის ინტეგრაციის მაჩვენებლების გაუმჯობესება და ძილიანობის შემცირება. შესწავლილი იყო აგრეთვე სტიმულებზე ნერვული სისტემის რეაგირება.",
    "authors": "Travis F, Haaga DAF, Hagelin J, Tanner M, et al.",
    "source": "Effects of Transcendental Meditation Practice on Brain Functioning and Stress Reactivity in College Students",
    "url": "https://pubmed.ncbi.nlm.nih.gov/18854202/"
  },
  {
    "summary": "EEG-ის კვლევამ TM-ის პრაქტიკის დროს გამოავლინა ტვინის სხვადასხვა უბანს შორის კოჰერენტულობის ზრდასთან დაკავშირებული თავისებურებები. შედეგები მიუთითებს ტვინის ფუნქციური შეთანხმებულობის შესაძლო ცვლილებებზე მედიტაციისას.",
    "authors": "Travis F, Haaga DAF, Hagelin J, Tanner M, et al.",
    "source": "A Self-Referential Default Brain State: Patterns of Coherence, Power, and eLORETA Sources During Eyes-Closed Rest and Transcendental Meditation Practice",
    "url": "https://pubmed.ncbi.nlm.nih.gov/19862565/"
  },
  {
    "summary": "189 მოსწავლის კვლევაში TM-ის პრაქტიკოსებს საკონტროლო ჯგუფთან შედარებით ინგლისურსა და მათემატიკაში უკეთესი შედეგები ჰქონდათ. მეტმა მოსწავლემ შეძლო აკადემიური მოსწრების მინიმუმ ერთი საფეხურით გაუმჯობესება.",
    "authors": "Nidich SI, Mjasiri S, Nidich RJ, Rainforth MV, et al.",
    "source": "Academic Achievement and Transcendental Meditation: A Study with At-Risk Urban Middle School Students",
    "url": "https://eric.ed.gov/?id=EJ996375"
  },
  {
    "summary": "უგანდაში სიღარიბის პირობებში მცხოვრები 130 ახალგაზრდა ქალის კვლევაში TM-ის პრაქტიკის შემდეგ გაუმჯობესდა თვითშეფასება, თვითეფექტურობა და მადლიერების განცდა, ხოლო შემდგომი გამოკითხვისას მონაწილეებმა სტრესისა და შფოთვის შემცირებაც აღნიშნეს.",
    "authors": "Goldstein L, Smith AM, Romagnoli D, Katergi E.",
    "source": "The Effect of Transcendental Meditation on Self-Esteem, Self-Efficacy, and Gratitude, for Increasing Empowerment of Female Youth in Uganda",
    "url": "https://doi.org/10.1080/07399332.2024.2358789"
  }
];

export function BrainResearchCarousel() {
  return (
    <ResearchCarousel
      research={RESEARCH}
      heading="კვლევები ტრანსცენდენტულ მედიტაციაზე: ტვინის ფუნქციონირება და გონებრივი შესაძლებლობები"
      idPrefix="brain"
    />
  );
}
