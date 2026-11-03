import research from '@/components/research-layout.module.css';
import science from '../blog/[slug]/what-is-tm-different.module.css';

export function PtsdSection() {
  return (
    <section aria-labelledby="ptsd-heading" className={research.section}>
      <div className={research.layout}>
        <div className={science.copy}>
          <h2 id="ptsd-heading" className={science.heading}>ტრანსცენდენტული მედიტაციის ტექნიკა PTSD-ისა და დეპრესიის სიმპტომებს 20.5%-ით ამცირებს</h2>
          <div className={science.description}>
            <p>რამდენიმე სამეცნიერო კვლევა ადასტურებს ტრანსცენდენტული მედიტაციის ტექნიკის ეფექტიანობას პოსტტრავმული სტრესული აშლილობის (PTSD) მქონე ადამიანების მდგომარეობის გაუმჯობესებაში.</p>
            <p>ერთ-ერთმა კვლევამ აჩვენა, რომ ტრანსცენდენტული მედიტაციის პრაქტიკა ამცირებს შფოთვისა და PTSD-ის მართვისთვის საჭირო ფსიქოტროპული მედიკამენტების საჭიროებას და ამავე დროს აუმჯობესებს ფსიქოლოგიურ კეთილდღეობას. ექვსი თვის შემდეგ ფსიქოლოგიური სიმპტომების სიმძიმეში TM-ის ჯგუფსა და საკონტროლო ჯგუფს შორის 20.5%-იანი განსხვავება დაფიქსირდა.</p>
          </div>
        </div>
        <figure className={research.figure}>
          <img
            src="/images/tm-ptsd-depression-reduction-chart-en.svg"
            width={1425}
            height={1589}
            className={research.chart}
            alt="ინგლისურენოვანი სამეცნიერო დიაგრამა PTSD-ისა და დეპრესიული სიმპტომების ცვლილების შესახებ, ორიგინალური სათაურით, მონაცემებითა და კვლევის მითითებით."
            loading="lazy"
          />
        </figure>
      </div>
    </section>
  );
}
