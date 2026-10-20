import Link from 'next/link';
import styles from './what-is-tm-not.module.css';

export function WhatIsTmNot() {
  return (
    <section aria-labelledby="tm-not-heading" className={styles.section}>
      <div className={styles.content}>
        <h2 id="tm-not-heading" className={styles.heading}>რა არ არის ტრანსცენდენტული მედიტაცია?</h2>
        <div className={styles.description}>
          <p>ტრანსცენდენტული მედიტაცია არ არის რელიგია და არ ეწინააღმდეგება ადამიანის რელიგიურ რწმენას ან მის არქონას.</p>
          <p>ის არ არის რწმენის სისტემა. ტრანსცენდენტული მედიტაციის პრაქტიკისთვის არ არის აუცილებელი მისი ეფექტურობის წინასწარ გჯეროდეს.</p>
          <p>ტრანსცენდენტული მედიტაცია სხვა მედიტაციური მეთოდებისგან განსხვავდება როგორც პრაქტიკის შესრულების წესით, ისე იმ გავლენით, რომელსაც ის ახდენს გონებასა და სხეულზე.</p>
        </div>
        <Link
          href="/#why"
          className="mt-8 inline-flex min-h-14 max-w-full items-center justify-center rounded-full bg-mist-300 px-7 py-4 text-[15px] leading-6 text-plum-800 transition-colors hover:bg-mist-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-plum-800"
        >
          გაეცანი TM-ის სარგებელს
        </Link>
      </div>
    </section>
  );
}
