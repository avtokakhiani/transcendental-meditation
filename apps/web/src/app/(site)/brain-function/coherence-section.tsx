import research from '@/components/research-layout.module.css';
import science from '../blog/[slug]/what-is-tm-different.module.css';

export function CoherenceSection() {
  return (
    <section aria-labelledby="brain-coherence-heading" className={research.section}>
      <div className={research.layout}>
        <div className={science.copy}>
          <h2 id="brain-coherence-heading" className={science.heading}>ტვინის ტალღების კოჰერენტულობის ზრდა ტრანსცენდენტული მედიტაციის დროს და მის შემდეგ</h2>
          <div className={science.description}>
            <p>ელექტროენცეფალოგრაფიული (EEG) კვლევები აჩვენებს, რომ ტრანსცენდენტული მედიტაციის (TM) პრაქტიკის დროს გამოვლენილი ალფა-1 ტალღები განსხვავდება თეტა ტალღებისგან, რომლებიც ხშირად უკავშირდება ცნობიერებაზე დაფუძნებული მედიტაციის (mindfulness) პრაქტიკას. ალფა-1 ტალღების კოჰერენტულობა დაკავშირებულია ტვინის სხვადასხვა უბნის უფრო შეთანხმებულ ფუნქციონირებასთან, რასაც შესაძლოა თან ახლდეს შემეცნებითი შესაძლებლობების გაუმჯობესება და მშვიდი სიფხიზლის მდგომარეობა, რომელიც მედიტაციის დასრულების შემდეგაც ნარჩუნდება.</p>
            <p>კვლევები ასევე მიუთითებს, რომ ტრანსცენდენტული მედიტაციის დროს ტრანსცენდირების გამოცდილება დაკავშირებულია ტვინის სხვადასხვა უბანს შორის ელექტრული აქტივობის უფრო მაღალ კოჰერენტულობასთან. ეს შეიძლება ასახავდეს ტვინის ფუნქციონირების უფრო ინტეგრირებულ და შეთანხმებულ ორგანიზებას.</p>
          </div>
        </div>
        <figure className={research.figure}>
          <img
            src="/images/tm-alpha-coherence-diagram-en.svg"
            width={1759}
            height={1356}
            className={research.chart}
            alt="ინგლისურენოვანი დიაგრამა: ტვინის ტალღების კოჰერენტულობის სამი ილუსტრაცია, სამეცნიერო წყაროს მითითებით."
            loading="lazy"
          />
        </figure>
      </div>
    </section>
  );
}
