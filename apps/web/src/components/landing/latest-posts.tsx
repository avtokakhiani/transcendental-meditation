import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { PostCard } from '@/components/post-card';
import type { PostCard as PostCardData } from '@/server/services/posts';

// Homepage card copy only; full titles and descriptions remain on article pages.
const HOMEPAGE_ARTICLE_COPY: Record<string, { title: string; excerpt: string }> = {
  'meditatsia-uketesi-dzilistvis': {
    title: 'მედიტაცია უკეთესი ძილისთვის',
    excerpt: 'გაიგე, როგორ შეიძლება მედიტაცია დაგეხმაროს სტრესის შემცირებაში, უფრო მარტივად ჩაძინებასა და ძილის ხარისხის გაუმჯობესებაში.',
  },
  'gulis-janmrteloba-da-meditatsia': {
    title: 'გულის ჯანმრთელობა და მედიტაცია',
    excerpt: 'აღმოაჩინე, რას აჩვენებს სამეცნიერო კვლევები ტრანსცენდენტული მედიტაციის გავლენაზე არტერიულ წნევასა და გულის ჯანმრთელობაზე.',
  },
  'meditatsia-stresis-shesamtsireblad': {
    title: 'მედიტაცია სტრესის შესამცირებლად',
    excerpt: 'გაიგე, როგორ მოქმედებს სტრესი სხეულსა და გონებაზე და როგორ უწყობს ხელს ტრანსცენდენტული მედიტაცია მის შემცირებასა და შინაგან სიმშვიდეს.',
  },
};

export function LatestPosts({ posts }: { posts: PostCardData[] }) {
  if (posts.length === 0) return null;

  return (
    <section aria-labelledby="latest-posts-heading" className="bg-cream-100 py-12 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <h2 id="latest-posts-heading" className="text-2xl leading-relaxed font-light text-plum-800 sm:text-3xl">
            ბოლო სტატიები
          </h2>
          <Link href="/blog" className="inline-flex min-h-11 items-center gap-2 rounded-sm text-[15px] text-plum-700 hover:text-plum-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-plum-700">
            ყველა სტატია
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>

        <div className="mt-7 grid gap-x-8 gap-y-0 sm:mt-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.slice(0, 3).map((post, index) => (
            <PostCard key={post.id} post={{ ...post, ...HOMEPAGE_ARTICLE_COPY[post.slug] }} index={index} variant="latest" />
          ))}
        </div>
      </div>
    </section>
  );
}
