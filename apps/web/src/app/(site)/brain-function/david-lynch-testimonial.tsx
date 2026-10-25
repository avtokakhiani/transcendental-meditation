import styles from './david-lynch-testimonial.module.css';

export function DavidLynchTestimonial() {
  return (
    <section aria-label="დევიდ ლინჩის გამოცდილება" className={styles.section}>
      <div className={styles.portrait}>
        <img
          src="/images/david-lynch-testimonial.jpg"
          width={2000}
          height={1335}
          alt="დევიდ ლინჩი ფერადი ხელოვნების ნამუშევრის წინ."
          loading="lazy"
          className={styles.photograph}
        />
      </div>
      <div className={styles.panel}>
        <figure className={styles.testimonial}>
          <blockquote className={styles.quote}>
            <p>„ტრანსცენდენტული მედიტაციის პრაქტიკა 1973 წელს დავიწყე... მან საშუალება მომცა, ძალისხმევის გარეშე მივწვდე ჩემში ღრმად არსებულ ენერგიის, შემოქმედებითობისა და ბედნიერების ამოუწურავ მარაგს.“</p>
          </blockquote>
          <figcaption className={styles.attribution}>დევიდ ლინჩი, კინორეჟისორი და ხელოვანი</figcaption>
        </figure>
      </div>
    </section>
  );
}
