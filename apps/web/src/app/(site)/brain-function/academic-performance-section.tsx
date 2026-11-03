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
          <h2 id="academic-performance-heading" className={science.heading}>TM პრაქტიკა ინტელექტუალური შესაძლებლობების მრავალმხრივ გაუმჯობესებას უწყობს ხელს</h2>
          <div className={science.description}>
            <p>ეს კვლევა აჩვენებს, რომ ტრანსცენდენტული მედიტაციის პრაქტიკა ინტელექტის ყველა სტანდარტულ მაჩვენებელში მნიშვნელოვან გაუმჯობესებას იწვევს და პიროვნული განვითარების ახალ შესაძლებლობებს ხსნის.</p>
            <p>ჩვეულებრივ განათლებას მოზარდობის შემდეგ ინტელექტის განვითარების მკაფიო ეფექტი არ დაუდასტურებია. თუმცა, როდესაც ტრანსცენდენტული მედიტაციის პრაქტიკა საშუალო სკოლის ან კოლეჯის სასწავლო პროგრამას ემატება, ინტელექტის მაჩვენებლები მნიშვნელოვნად იზრდება.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
