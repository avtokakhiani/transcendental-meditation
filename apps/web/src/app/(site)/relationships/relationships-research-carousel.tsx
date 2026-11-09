import { ResearchCarousel } from '../stress-and-anxiety/research-carousel';
import styles from './relationships-research-carousel.module.css';

const RESEARCH = [
  {
    "summary": "42 კვლევის სტატისტიკურმა მიმოხილვამ აჩვენა, რომ TM-ის პრაქტიკა თვითრეალიზაციის გაუმჯობესებაში სამჯერ უფრო ეფექტური აღმოჩნდა, ვიდრე მედიტაციისა და რელაქსაციის სხვა მეთოდები.",
    "authors": "Alexander CN, Rainforth MV, Gelderloos P.",
    "source": "Transcendental Meditation, Self-Actualization, and Psychological Health: A Conceptual Overview and Statistical Meta-Analysis",
    "url": "https://search.proquest.com/openview/96282a627d15a9e40a80a4c5ea6ccba4/1?pq-origsite=gscholar&cbl=1819046"
  },
  {
    "summary": "დაქორწინებულ ქალებში TM-ის პრაქტიკამ საკონტროლო ჯგუფთან შედარებით მნიშვნელოვნად გაზარდა ქორწინებით კმაყოფილება და გააუმჯობესა ცოლ-ქმრული ურთიერთობები.",
    "authors": "Aron EN, Aron A.",
    "source": "Transcendental Meditation Program and Marital Adjustment",
    "url": "https://pubmed.ncbi.nlm.nih.gov/6761733/"
  },
  {
    "summary": "პატიმრებში TM-ის პრაქტიკამ მნიშვნელოვნად გააუმჯობესა ფსიქოლოგიური განვითარება, ცნობიერების განვითარება და ადამიანებთან ურთიერთობები.",
    "authors": "Alexander CN, Walton KG, Goodman R.",
    "source": "Walpole Study of the Transcendental Meditation Program in Maximum Security Prisoners I: Cross-Sectional Differences in Development and Psychopathology",
    "url": "https://doi.org/10.1300/J076v36n01_06"
  },
  {
    "summary": "მოზარდებში TM-ის პრაქტიკამ შეამცირა გაკვეთილების გაცდენა, სკოლის წესების დარღვევა და სასწავლო პროცესიდან დროებითი ჩამოშორების შემთხვევები, საკონტროლო ჯგუფში ამ მაჩვენებლების ზრდის ფონზე.",
    "authors": "Barnes VA, Bauza LB, Treiber FA.",
    "source": "Impact of Stress Reduction on Negative School Behavior in Adolescents",
    "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC155630/"
  },
  {
    "summary": "მაღალი რისკის ჯგუფის მოსწავლეებში TM-ის პრაქტიკამ მნიშვნელოვნად გააუმჯობესა სოციალურ-ემოციური უნარები და შეამცირა უარყოფითი ემოციური სიმპტომები.",
    "authors": "Valosek L, Nidich S, Wendt S, Grant J, Nidich R.",
    "source": "Effect of Meditation on Social-Emotional Learning in Middle School Students",
    "url": "https://eric.ed.gov/?id=EJ1320707"
  },
  {
    "summary": "თანამშრომლებში TM-ის პრაქტიკამ გაზარდა სამუშაოს ეფექტურობა და სამუშაოთი კმაყოფილება, გააუმჯობესა პირადი და პროფესიული ურთიერთობები და შეამცირა შფოთვა, უძილობა და დაღლილობა.",
    "authors": "Alexander CN, Swanson GC, Rainforth MV, et al.",
    "source": "Effects of the Transcendental Meditation Program on Stress Reduction, Health, and Employee Development: A Prospective Study in Two Occupational Settings",
    "url": "https://doi.org/10.1080/10615809308248383"
  },
  {
    "summary": "PTSD-ის მქონე ვიეტნამის ომის ვეტერანებში TM-ის პრაქტიკამ მნიშვნელოვნად შეამცირა ოჯახური პრობლემები, დეპრესია, შფოთვა, ალკოჰოლის მოხმარება, უძილობა და დასაქმებასთან დაკავშირებული სირთულეები.",
    "authors": "Brooks JS, Scarano T.",
    "source": "Transcendental Meditation in the Treatment of Post-Vietnam Adjustment",
    "url": "https://doi.org/10.1002/j.1556-6676.1985.tb01078.x"
  },
  {
    "summary": "ოჯახები, რომელთა წევრებიც TM-ს ხუთი ან მეტი წლის განმავლობაში აპრაქტიკებდნენ, ფსიქოლოგიურად უფრო ჯანსაღები აღმოჩნდნენ, ვიდრე ოჯახები, რომლებმაც პრაქტიკა ერთ წელზე ნაკლები ხნის წინ დაიწყეს.",
    "authors": "Chen ME.",
    "source": "A Comparative Study of Dimensions of Healthy Functioning Between Families Practicing the TM Program for Five Years or More or for Less Than a Year",
    "url": "https://pubmed.ncbi.nlm.nih.gov/3312395/"
  }
];

export function RelationshipsResearchCarousel() {
  return (
    <div className={styles.carousel}>
      <ResearchCarousel
        research={RESEARCH}
        heading="კვლევები ტრანსცენდენტულ მედიტაციაზე: ურთიერთობების გაუმჯობესება"
        idPrefix="relationships"
        sourceClassName={styles.publicationTitle}
      />
    </div>
  );
}
