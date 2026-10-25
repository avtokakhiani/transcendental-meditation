import { ResearchCarousel } from '../stress-and-anxiety/research-carousel';

const RESEARCH = [
  {
    "summary": "42 საკვლევი ჯგუფის მონაცემების მეტაანალიზში ტრანსცენდენტული მედიტაციის პრაქტიკა თვითრეალიზაციის მაჩვენებლების გაუმჯობესებაში დაახლოებით სამჯერ უფრო ეფექტური აღმოჩნდა, ვიდრე შედარებისთვის გამოყენებული მედიტაციისა და რელაქსაციის სხვა მეთოდები.",
    "authors": "Alexander CN, Rainforth MV, Gelderloos P.",
    "source": "Transcendental Meditation, Self-Actualization, and Psychological Health: A Conceptual Overview and Statistical Meta-Analysis",
    "url": "https://search.proquest.com/openview/96282a627d15a9e40a80a4c5ea6ccba4/1?pq-origsite=gscholar&cbl=1819046"
  },
  {
    "summary": "დაქორწინებულ ქალებზე ჩატარებულ კვლევაში ტრანსცენდენტული მედიტაციის პრაქტიკოსებმა საკონტროლო ჯგუფთან შედარებით უფრო მაღალი შედეგები აჩვენეს ქორწინებით კმაყოფილებისა და ოჯახურ ურთიერთობებთან შეგუების მაჩვენებლებში.",
    "authors": "Aron EN, Aron A.",
    "source": "Transcendental Meditation Program and Marital Adjustment",
    "url": "https://pubmed.ncbi.nlm.nih.gov/6761733/"
  },
  {
    "summary": "მკაცრი რეჟიმის ციხის 160 პატიმრის კვლევაში TM-ის პრაქტიკოსებს სხვა პატიმრებთან შედარებით უკეთესი მაჩვენებლები ჰქონდათ პიროვნული განვითარების, ცნობიერებასთან დაკავშირებული გამოცდილებისა და ფსიქოლოგიური მდგომარეობის რამდენიმე მიმართულებით.",
    "authors": "Alexander CN, Walton KG, Goodman R.",
    "source": "Walpole Study of the Transcendental Meditation Program in Maximum Security Prisoners I: Cross-Sectional Differences in Development and Psychopathology",
    "url": "https://doi.org/10.1300/J076v36n01_06"
  },
  {
    "summary": "45 მოზარდის რანდომიზებულ კვლევაში TM-ის ჯგუფში შემცირდა გაკვეთილების გაცდენა, სკოლის წესების დარღვევა და დისციპლინური გარიცხვის დღეები, მაშინ როდესაც საკონტროლო ჯგუფში ეს მაჩვენებლები გაიზარდა.",
    "authors": "Barnes VA, Bauza LB, Treiber FA.",
    "source": "Impact of Stress Reduction on Negative School Behavior in Adolescents",
    "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC155630/"
  },
  {
    "summary": "101 მეექვსეკლასელის კვლევაში TM-ის პრაქტიკოსებს საკონტროლო ჯგუფთან შედარებით მნიშვნელოვნად გაუუმჯობესდათ სოციალურ-ემოციური კომპეტენციები. მაღალი რისკის მოსწავლეებში ასევე გამოიკვეთა უარყოფითი ემოციური სიმპტომების შემცირების ტენდენცია.",
    "authors": "Valosek L, Nidich S, Wendt S, Grant J, Nidich R.",
    "source": "Effect of Meditation on Social-Emotional Learning in Middle School Students",
    "url": "https://eric.ed.gov/?id=EJ1320707"
  },
  {
    "summary": "ორ სამუშაო გარემოში ჩატარებულ კვლევაში TM-ის რეგულარულ პრაქტიკოსებს საკონტროლო ჯგუფთან შედარებით შეუმცირდათ შფოთვა, სამუშაო დაძაბულობა და დაღლილობა, ხოლო გაუუმჯობესდათ სამუშაოთი კმაყოფილება და პირადი თუ პროფესიული ურთიერთობები.",
    "authors": "Alexander CN, Swanson GC, Rainforth MV, et al.",
    "source": "Effects of the Transcendental Meditation Program on Stress Reduction, Health, and Employee Development: A Prospective Study in Two Occupational Settings",
    "url": "https://doi.org/10.1080/10615809308248383"
  },
  {
    "summary": "ვიეტნამის ომის ვეტერანების მცირე რანდომიზებულ კვლევაში TM-ის ჯგუფს სამთვიანი პერიოდის შემდეგ გაუუმჯობესდა ფსიქოლოგიური მდგომარეობისა და ოჯახურ ურთიერთობებთან დაკავშირებული რამდენიმე მაჩვენებელი, ფსიქოთერაპიის ჯგუფთან შედარებით.",
    "authors": "Brooks JS, Scarano T.",
    "source": "Transcendental Meditation in the Treatment of Post-Vietnam Adjustment",
    "url": "https://doi.org/10.1002/j.1556-6676.1985.tb01078.x"
  },
  {
    "summary": "ოჯახების შედარებით კვლევაში, ხუთ წელზე მეტი ხნის განმავლობაში TM-ის პრაქტიკოს ოჯახებს საერთო ოჯახური ფუნქციონირების რამდენიმე მაჩვენებლით უკეთესი შედეგები ჰქონდათ, ვიდრე ოჯახებს, რომლებმაც მედიტაციის პრაქტიკა შედარებით ცოტა ხნის წინ დაიწყეს.",
    "authors": "Chen ME.",
    "source": "A Comparative Study of Dimensions of Healthy Functioning Between Families Practicing the TM Program for Five Years or More or for Less Than a Year",
    "url": "https://pubmed.ncbi.nlm.nih.gov/3312395/"
  }
];

export function RelationshipsResearchCarousel() {
  return (
    <ResearchCarousel
      research={RESEARCH}
      heading="კვლევები ტრანსცენდენტულ მედიტაციაზე: ურთიერთობების გაუმჯობესება"
      idPrefix="relationships"
    />
  );
}
