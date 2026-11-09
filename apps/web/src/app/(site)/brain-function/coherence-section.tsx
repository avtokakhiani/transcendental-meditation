import research from '@/components/research-layout.module.css';
import science from '../blog/[slug]/what-is-tm-different.module.css';
import styles from './brain-function.module.css';

export function CoherenceSection() {
  return (
    <section aria-labelledby="brain-coherence-heading" className={research.section}>
      <div className={research.layout}>
        <div className={science.copy}>
          <h2 id="brain-coherence-heading" className={science.heading}>ტვინის ტალღების კოჰერენტულობის ზრდა ტრანსცენდენტული მედიტაციის დროს და მის შემდეგ</h2>
          <div className={science.description}>
            <p>ელექტროენცეფალოგრაფიული (EEG) კვლევები აჩვენებს, რომ ტრანსცენდენტული მედიტაციის დროს გამოვლენილი ალფა-1 ტალღები განსხვავდება თეტა ტალღებისგან, რომლებიც ხშირად უკავშირდება მაინდფულნესის პრაქტიკას.</p>
            <p>ალფა-1 ტალღების კოჰერენტულობა დაკავშირებულია ტვინის სხვადასხვა უბნის შეთანხმებულ ფუნქციონირებასთან, შემეცნებითი შესაძლებლობების გაუმჯობესებასა და მშვიდი სიფხიზლის მდგომარეობასთან, რომელიც მედიტაციის დასრულების შემდეგაც ნარჩუნდება.</p>
            <p>კვლევები ასევე აჩვენებს, რომ ტრანსცენდენტული მედიტაციის დროს ტრანსცენდირების გამოცდილებას თან ახლავს ტვინის სხვადასხვა უბნის ელექტრული აქტივობის მაღალი კოჰერენტულობა, რაც ასახავს ტვინის უფრო ინტეგრირებულ და შეთანხმებულ ფუნქციონირებას.</p>
          </div>
        </div>
        <figure className={research.figure}>
          <img
            src="/images/tm-alpha-coherence-diagram-en.svg"
            width={1759}
            height={1356}
            className={`${research.chart} ${styles.coherenceChart}`}
            alt="ინგლისურენოვანი დიაგრამა: ტვინის ტალღების კოჰერენტულობის სამი ილუსტრაცია, სამეცნიერო წყაროს მითითებით."
            loading="lazy"
          />
        </figure>
      </div>
    </section>
  );
}
