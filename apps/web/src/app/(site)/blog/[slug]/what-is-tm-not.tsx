import Link from 'next/link';
import styles from './what-is-tm-not.module.css';

export function WhatIsTmNot() {
  return (
    <section aria-labelledby="tm-not-heading" className={styles.section}>
      <div className={styles.content}>
        <h2 id="tm-not-heading" className={styles.heading}>რა არ არის ტრანსცენდენტული მედიტაცია?</h2>
        <div className={styles.description}>
          <p>ტრანსცენდენტული მედიტაცია არ არის რელიგია და არ ეწინააღმდეგება ადამიანის რელიგიურ რწმენას ან მის არქონას.</p>
          <p>ის არც რწმენის სისტემაა — ტექნიკის პრაქტიკისთვის არ არის აუცილებელი, წინასწარ გჯეროდეს მისი ეფექტურობის.</p>
          <p>ტრანსცენდენტული მედიტაცია სხვა მედიტაციური მიდგომებისგან განსხვავდება როგორც პრაქტიკის შესრულების წესით, ისე გონებასა და სხეულზე მისი გავლენით.</p>
        </div>
        <Link
          href="/benefits"
          className="mt-8 inline-flex min-h-14 max-w-full items-center justify-center rounded-full bg-mist-300 px-7 py-4 text-[15px] leading-6 text-plum-800 transition-colors hover:bg-mist-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-plum-800"
        >
          აღმოაჩინე TM-ის სარგებელი
        </Link>
      </div>
    </section>
  );
}
