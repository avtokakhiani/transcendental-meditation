// Versioned geometry extracted from the approved original. Editorial values live in revisions.
import Link from "next/link";
import type { Route } from 'next';
import styles from "@/app/(site)/blog/[slug]/what-is-tm-not.module.css";
import type { ReactNode } from 'react';
export function PresetWhatIsTmNotV1({fields: f}: {fields: Record<string,string>; visuals?: ReactNode[]}) { return ((<section aria-labelledby="tm-not-heading" className={styles.section}>
      <div className={styles.content}>
        <h2 id="tm-not-heading" className={styles.heading}>{f["f1"]!}</h2>
        <div className={styles.description}>
          <p>{f["f2"]!}</p>
          <p>{f["f3"]!}</p>
          <p>{f["f4"]!}</p>
        </div>
        <Link href={f["f5"]! as Route} className="mt-8 inline-flex min-h-14 max-w-full items-center justify-center rounded-full bg-mist-300 px-7 py-4 text-[15px] leading-6 text-plum-800 transition-colors hover:bg-mist-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-plum-800">{f["f6"]!}</Link>
      </div>
    </section>)); }

