import type { ReactNode } from 'react';
import styles from './teacher-cta.module.css';

export function TeacherCta({ headingId, children }: { headingId: string; children: ReactNode }) {
  return (
    <section aria-labelledby={headingId} className={styles.section}>
      <div className="mx-auto w-full max-w-[760px]">
        <h2 id={headingId} className="text-3xl font-normal leading-[1.45] sm:text-4xl">იპოვე TM-ის მასწავლებელი</h2>
        <div className="mt-8 space-y-6 text-base leading-[1.7] sm:text-lg">
          {children}
        </div>
        <a href="#contact" className="mt-8 inline-flex min-h-16 max-w-full items-center justify-center rounded-full bg-cream-100 px-10 py-4 text-base leading-relaxed text-plum-800 transition-colors hover:bg-cream-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-plum-800 sm:min-w-[300px] sm:text-lg">იპოვე მასწავლებელი</a>
      </div>
    </section>
  );
}
