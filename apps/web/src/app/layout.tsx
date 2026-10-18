import type { Metadata } from 'next';
import { Noto_Sans_Georgian, Noto_Serif_Georgian } from 'next/font/google';
import './globals.css';

const sans = Noto_Sans_Georgian({
  subsets: ['georgian', 'latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-noto-sans-georgian',
  display: 'swap',
});

const serif = Noto_Serif_Georgian({
  subsets: ['georgian', 'latin'],
  weight: ['400', '500', '600'],
  variable: '--font-noto-serif-georgian',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'ტრანსცენდენტული მედიტაცია',
    template: '%s · ტრანსცენდენტული მედიტაცია',
  },
  description: 'უძალისხმევო მედიტაციის ტექნიკა შინაგანი სიმშვიდისა და ჯანმრთელობისთვის. ბლოგი და წიგნები ქართულად.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ka" className={`${sans.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
