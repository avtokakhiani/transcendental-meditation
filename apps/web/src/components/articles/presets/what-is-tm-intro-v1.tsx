// Versioned geometry extracted from the approved original. Editorial values live in revisions.
import styles from "@/app/(site)/blog/[slug]/what-is-tm-intro.module.css";
import benefitHero from "@/components/site/benefit-hero.module.css";
import type { ReactNode } from 'react';
export function PresetWhatIsTmIntroV1({fields: f}: {fields: Record<string,string>; visuals?: ReactNode[]}) { return ((<>
      <section aria-labelledby="tm-intro-heading" className={`${styles.intro} ${benefitHero.hero} ${benefitHero.introduction}`} style={{ backgroundImage: `url("${f["f1"]!}")` }}>
        <div className={styles.content}>
          <h1 id="tm-intro-heading" className={styles.heading}>{f["f2"]!}</h1>
        </div>
      </section>
      <section aria-label={f["f3"]!} className={styles.continuation}>
        <div className={styles.continuationCopy}>
          <p>{f["f4"]!}</p>
          <p>{f["f5"]!}<span className={styles.noWrap}>{f["f6"]!}</span>{f["f7"]!}</p>
          <p>{f["f8"]!}</p>
        </div>
      </section>
    </>)); }

