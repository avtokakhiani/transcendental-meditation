import hero from '@/app/(site)/stress-and-anxiety/stress-and-anxiety.module.css';

// Reuse the internal pages' Hero sizing, typography, and responsive rules.
// The shared cream background serves as a placeholder until photos are supplied.
export function InternalPageHero({ title, headingId }: { title: string; headingId: string }) {
  return (
    <section aria-labelledby={headingId} className={hero.hero}>
      <h1 id={headingId} className={hero.heading}>{title}</h1>
    </section>
  );
}
