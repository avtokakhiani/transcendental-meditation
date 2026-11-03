export interface Article {
  slug: string;
  publishedAt: string;
  title: string;
  description: string;
  author: string;
  readingMinutes: number;
  category: string;
  image: { src: string; alt: string } | null;
}

// Add articles here; the listing and article pages share this data.
// Supply an ISO publication timestamp (including timezone) for every new article.
// Existing timestamps initialize publication order from the order articles were added.
// Set missing images to the supplied reference photographs when available.
export const articles: readonly Article[] = [
  {
    slug: 'meditatsia-stresis-shesamtsireblad',
    publishedAt: '2026-11-03T00:00:00+04:00',
    title: 'მედიტაცია სტრესის შესამცირებლად — განავითარე შინაგანი სიმშვიდე',
    description:
      'სტრესი ფსიქოლოგიური და ფიზიოლოგიური რეაქციაა აღქმულ საფრთხეებსა თუ გამოწვევებზე, რომლის შემცირებაც შესაძლებელია...',
    author: 'Soha Abu Shakra',
    readingMinutes: 8,
    category: 'ფსიქიკური ჯანმრთელობა',
    image: {
      src: '/images/peace-hero-sunlit-man.jpeg',
      alt: 'მზის თბილი შუქით განათებული კაცი ბუნების ფონზე',
    },
  },
  {
    slug: 'gulis-janmrteloba-da-meditatsia',
    publishedAt: '2026-11-03T00:01:00+04:00',
    title: 'გულის ჯანმრთელობა და მედიტაცია — გულის დაავადებების რისკის შემცირება',
    description:
      'ტრანსცენდენტული მედიტაცია მარტივი, ძალისხმევის გარეშე შესასრულებელი ტექნიკაა, რომელიც ჯანსაღ კვებასა და ცხოვრების წესთან ერთად შესაძლოა გულის დაავადებების რისკის შემცირებას უწყობდეს ხელს...',
    author: 'Chloe Bonfield',
    readingMinutes: 4,
    category: 'ჯანმრთელობა',
    image: {
      src: '/images/heart-article-hero-beach.jpeg',
      alt: 'ქალი ზღვის სანაპიროზე მზის ჩასვლისას გაწელვის ვარჯიშს ასრულებს',
    },
  },
  {
    slug: 'meditatsia-uketesi-dzilistvis',
    publishedAt: '2026-11-03T00:02:00+04:00',
    title: 'მედიტაცია უკეთესი ძილისთვის — ღრმა დასვენების მიღწევა',
    description:
      'მედიტაციის პრაქტიკა შესაძლოა დაგვეხმაროს უფრო მარტივად ჩაძინებასა და ღამით მშვიდი ძილის შენარჩუნებაში. ის ხელს უწყობს გონებისა და სხეულის დამშვიდებას...',
    author: 'Michael Skoletsky',
    readingMinutes: 7,
    category: 'ჯანმრთელობა',
    image: {
      src: '/images/peace-hero-man-mountain.jpeg',
      alt: 'კაცი მთის ფერდობზე ზის და მზის ჩასვლისას მთის პეიზაჟს გადაჰყურებს',
    },
  },
];

export function getLatestArticles(): Article[] {
  return [...articles].sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt) || a.slug.localeCompare(b.slug),
  );
}

export function getArticle(slug: string): Article | undefined {
  return articles.find((article) => article.slug === slug);
}
