// Versioned geometry extracted from the approved original. Editorial values live in revisions.
import research from "@/components/research-layout.module.css";
import styles from "@/app/(site)/blog/[slug]/what-is-tm-different.module.css";
import mirrored from "@/app/(site)/blog/[slug]/what-is-tm-restful-alertness.module.css";
import type { ReactNode } from 'react';
export function PresetWhatIsTmRestfulAlertnessV1({fields: f, visuals = []}: {fields: Record<string,string>; visuals?: ReactNode[]}) { return ((<section aria-labelledby="tm-restful-alertness-heading" className={research.section}>
      <div className={research.layout}>
        <div className={`${styles.copy} ${mirrored.copy}`}>
          <h2 id="tm-restful-alertness-heading" className={styles.heading}>{f["f1"]!}</h2>
          <div className={styles.description}>
            <p>{f["f2"]!}</p>
            <p>{f["f3"]!}</p>
            <p>{f["f4"]!}</p>
          </div>
        </div>
        <>{visuals[0]}</>
      </div>
    </section>)); }
export function Graph1({fields: f}: {fields: Record<string,string>}) { return (<figure className={`${research.figure} ${mirrored.figure}`}>
          <p id="tm-restful-alertness-scroll-hint" className={styles.scrollHint}>{f["f5"]!}<span aria-hidden="true">{f["f6"]!}</span>
          </p>
          <div className={styles.chartViewport} role="region" aria-label={f["f7"]!} aria-describedby="tm-restful-alertness-scroll-hint" tabIndex={0}>
            <img className={`${research.chart} ${mirrored.chart}`} src={f["f8"]!} width={1425} height={1589} alt={f["f9"]!} loading="lazy"/>
          </div>
        </figure>); }
