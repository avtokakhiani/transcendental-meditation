// Versioned geometry extracted from the approved original. Editorial values live in revisions.
import research from "@/components/research-layout.module.css";
import styles from "@/app/(site)/blog/[slug]/what-is-tm-different.module.css";
import type { ReactNode } from 'react';
export function PresetWhatIsTmDifferentV1({fields: f, visuals = []}: {fields: Record<string,string>; visuals?: ReactNode[]}) { return ((<section aria-labelledby="tm-different-heading" className={research.section}>
      <div className={research.layout}>
        <div className={styles.copy}>
          <h2 id="tm-different-heading" className={styles.heading}>{f["f1"]!}</h2>
          <div className={styles.description}>
            <p>{f["f2"]!}</p>
            <p>{f["f3"]!}</p>
          </div>
        </div>
        <>{visuals[0]}</>
      </div>
    </section>)); }
export function Graph1({fields: f}: {fields: Record<string,string>}) { return (<figure className={research.figure}>
          <p id="tm-comparison-scroll-hint" className={styles.scrollHint}>{f["f4"]!}<span aria-hidden="true">{f["f5"]!}</span>
          </p>
          <div className={styles.chartViewport} role="region" aria-label={f["f6"]!} aria-describedby="tm-comparison-scroll-hint" tabIndex={0}>
            <img className={`${research.chart} ${styles.chart}`} src={f["f7"]!} width={2423} height={1239} alt={f["f8"]!} loading="lazy"/>
          </div>
        </figure>); }
