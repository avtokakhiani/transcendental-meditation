// Versioned geometry extracted from the approved original. Editorial values live in revisions.
import Image from "next/image";
import styles from "@/app/(site)/blog/[slug]/what-is-tm-maharishi.module.css";
import portrait from "@/app/(site)/blog/[slug]/what-is-tm-tony-nader.module.css";
import type { ReactNode } from 'react';
export function PresetWhatIsTmTonyNaderV1({fields: f}: {fields: Record<string,string>; visuals?: ReactNode[]}) { return ((<section aria-labelledby="tm-tony-nader-heading" className={styles.section}>
      <div className={`${styles.text} ${portrait.text}`}>
        <div className={styles.copy}>
          <h2 id="tm-tony-nader-heading" className={styles.heading}>{f["f1"]!}</h2>
          <p className={styles.subtitle}>{f["f2"]!}</p>
          <div className={styles.description}>
            <p>{f["f3"]!}</p>
            <p>{f["f4"]!}</p>
          </div>
        </div>
      </div>
      <div className={`${styles.portrait} ${portrait.portrait}`}>
        <Image src={f["f5"]!} alt={f["f6"]!} fill sizes="(min-width: 1024px) 50vw, 100vw" className={`${styles.image} ${portrait.image}`}/>
      </div>
    </section>)); }

