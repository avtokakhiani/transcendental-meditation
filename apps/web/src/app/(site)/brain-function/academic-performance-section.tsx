import research from '@/components/research-layout.module.css';
import science from '../blog/[slug]/what-is-tm-different.module.css';

export function AcademicPerformanceSection() {
  return (
    <section aria-labelledby="academic-performance-heading" className={research.section}>
      <div className={research.layout}>
        <figure className={research.figure}>
          <img
            src="/images/tm-academic-performance-chart-en.svg"
            width={2218}
            height={3331}
            className={research.chart}
            alt="ინგლისურენოვანი სამეცნიერო დიაგრამა: აკადემიური მოსწრების გაუმჯობესება ტრანსცენდენტული მედიტაციის პრაქტიკის დროს."
            loading="lazy"
          />
        </figure>
        <div className={science.copy}>
          <h2 id="academic-performance-heading" className={science.heading}>ტრანსცენდენტული მედიტაცია აუმჯობესებს აკადემიურ მოსწრებასა და ინტელექტუალურ შესაძლებლობებს</h2>
          <div className={science.description}>
            <p>სამეცნიერო კვლევები აჩვენებს, რომ ტრანსცენდენტული მედიტაციის პრაქტიკა ხელს უწყობს მოსწავლეთა აკადემიური მოსწრებისა და ინტელექტუალური შესაძლებლობების გაუმჯობესებას, რაც მათი პიროვნული განვითარების ახალ შესაძლებლობებს ქმნის.</p>
            <p>კვლევებში გამოვლენილია მნიშვნელოვანი გაუმჯობესება მათემატიკისა და ინგლისური ენის შედეგებში. ასევე დაფიქსირდა სკოლის დასრულების უფრო მაღალი და სწავლის მიტოვების უფრო დაბალი მაჩვენებლები. ეს შედეგები აჩვენებს, რომ ტრანსცენდენტული მედიტაციის სასწავლო პროგრამაში ჩართვას შეუძლია მნიშვნელოვანი წვლილი შეიტანოს მოსწავლეთა განვითარებაში.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
