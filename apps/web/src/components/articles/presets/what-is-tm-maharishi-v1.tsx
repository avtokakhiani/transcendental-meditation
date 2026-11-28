// Versioned geometry extracted from the approved original. Editorial values live in revisions.
import Image from "next/image";
import styles from "@/app/(site)/blog/[slug]/what-is-tm-maharishi.module.css";
import type { ReactNode } from 'react';
export function PresetWhatIsTmMaharishiV1({fields: f}: {fields: Record<string,string>; visuals?: ReactNode[]}) { return ((<section aria-labelledby="tm-maharishi-heading" className={styles.section}>
      <div className={styles.portrait}>
        <Image src={f["f1"]!} alt={f["f2"]!} fill sizes="(min-width: 1024px) 50vw, 100vw" className={styles.image}/>
      </div>
      <div className={styles.text}>
        <div className={styles.copy}>
          <h2 id="tm-maharishi-heading" className={styles.heading}>{f["f3"]!}</h2>
          <p className={styles.subtitle}>{f["f4"]!}</p>
          <div className={styles.description}>
            <p>{f["f5"]!}</p>
            <p>{f["f6"]!}</p>
            <p>{f["f7"]!}</p>
          </div>
        </div>
      </div>
    </section>)); }

