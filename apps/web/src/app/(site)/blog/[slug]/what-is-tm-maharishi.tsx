import Image from 'next/image';
import styles from './what-is-tm-maharishi.module.css';

export function WhatIsTmMaharishi() {
  return (
    <section aria-labelledby="tm-maharishi-heading" className={styles.section}>
      <div className={styles.portrait}>
        <Image
          src="/images/maharishi-mahesh-yogi-canada-1978.jpeg"
          alt="მაჰარიში მაჰეშ იოგი მიკროფონთან, კანადა, 1978 წელი."
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className={styles.image}
        />
      </div>
      <div className={styles.text}>
        <div className={styles.copy}>
          <h2 id="tm-maharishi-heading" className={styles.heading}>მაჰარიში მაჰეშ იოგი</h2>
          <p className={styles.subtitle}>ტრანსცენდენტული მედიტაციის ფუძემდებელი</p>
          <div className={styles.description}>
            <p>უძველეს ვედურ ცოდნაზე დაყრდნობით, მაჰარიშიმ აღადგინა და სისტემური სახე მისცა ტრანსცენდენტული მედიტაციის ბუნებრივ, ძალდაუტანებელ ტექნიკას, რათა მისი შესწავლა და პრაქტიკა ყველასთვის ხელმისაწვდომი გამხდარიყო.</p>
            <p>1958 წლიდან მაჰარიში მთელ მსოფლიოში მოგზაურობდა, ასწავლიდა ტრანსცენდენტულ მედიტაციას და საფუძველს უყრიდა გლობალურ მოძრაობას, რომლის მიზანიც ადამიანის ცნობიერების განვითარება იყო.</p>
            <p>მან პირადად მოამზადა ათასობით სერტიფიცირებული მასწავლებელი და დააფუძნა არაკომერციული ორგანიზაციები, რათა ტრანსცენდენტული მედიტაციის ტექნიკის ავთენტურობა და ეფექტურობა მომავალი თაობებისთვისაც შენარჩუნებულიყო.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
