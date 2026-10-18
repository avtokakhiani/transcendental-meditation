import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import { SAMPLE_BOOK } from './seed-book';

/**
 * Placeholder content so the site has something to render locally. Re-running is safe: users and
 * slugs are upserted, so edits made in the admin panel to seeded rows are overwritten only for
 * rows that still carry a seeded slug.
 */
const prisma = new PrismaClient();
const DAY = 24 * 60 * 60 * 1000;

const POSTS: ReadonlyArray<{ slug: string; title: string; daysAgo: number; content: string }> = [
  {
    slug: 'ra-aris-transtsendentuli-meditatsia',
    title: 'რა არის ტრანსცენდენტული მედიტაცია?',
    daysAgo: 2,
    content: `ტრანსცენდენტული მედიტაცია (TM) არის მარტივი, ბუნებრივი ტექნიკა, რომელსაც დღეში ორჯერ, 20 წუთის განმავლობაში ასრულებთ — თვალდახუჭულები, კომფორტულად მჯდომარე.

## როგორ მუშაობს

TM არ მოითხოვს კონცენტრაციას ან აზრების კონტროლს. გონება ბუნებრივად ეშვება აზროვნების უფრო ნატიფ დონეებზე, სანამ არ მიაღწევს სრული სიმშვიდის მდგომარეობას.

> „სიმშვიდე არ არის ის, რასაც ქმნი — ის არის ის, რაც უკვე შენშია."

## ვისთვისაა

- ვისაც დაძაბული სამუშაო რიტმი აქვს
- ვისაც ძილის პრობლემა აწუხებს
- ვინც ფიქრობს, რომ „მედიტაცია არ შეუძლია"

ტექნიკის სწავლა ხდება ინდივიდუალურად, სერტიფიცირებულ მასწავლებელთან.`,
  },
  {
    slug: 'stresi-da-kortizoli',
    title: 'სტრესი, კორტიზოლი და 20 წუთი დღეში',
    daysAgo: 6,
    content: `კორტიზოლი ორგანიზმის მთავარი „სტრესის ჰორმონია". ხანგრძლივად მომატებული დონე გავლენას ახდენს ძილზე, იმუნიტეტზე და გუნება-განწყობაზე.

## რას აჩვენებს პრაქტიკა

რეგულარული მედიტაციის დროს ორგანიზმი ღრმა დასვენების მდგომარეობაში გადადის — ზოგჯერ უფრო ღრმაში, ვიდრე ძილის დროს. ეს ნერვულ სისტემას საშუალებას აძლევს, „გადაიტვირთოს".

## პრაქტიკული რჩევა

1. აირჩიეთ მუდმივი დრო — დილით საუზმემდე და საღამოს ვახშმამდე.
2. გამორთეთ შეტყობინებები.
3. ნუ შეაფასებთ თითოეულ სესიას — მთავარია რეგულარულობა.`,
  },
  {
    slug: 'mshvidi-dzili',
    title: 'მშვიდი ძილი: რატომ გვეხმარება მედიტაცია დაძინებაში',
    daysAgo: 13,
    content: `ბევრი ადამიანი ამბობს, რომ საწოლში წოლისას გონება „ვერ ჩერდება". დღის განმავლობაში დაგროვილი დაძაბულობა ღამით იჩენს თავს.

## დღის მედიტაცია — ღამის ძილისთვის

საღამოს სესია ვახშმამდე ეხმარება ორგანიზმს, დღის სტრესი ძილამდე „ჩამოიშოროს". შედეგად დაძინება ადვილდება და ძილი უფრო ღრმა ხდება.

## პატარა ჩვევები

- ეკრანები — ძილამდე ერთი საათით ადრე გამორთეთ
- საძინებელი იყოს გრილი და ბნელი
- დაიძინეთ და გაიღვიძეთ ერთსა და იმავე დროს`,
  },
  {
    slug: 'meditatsia-da-urtiertobebi',
    title: 'როგორ ცვლის მედიტაცია ურთიერთობებს',
    daysAgo: 21,
    content: `როცა ნაკლებად ვართ დაძაბულები, უფრო ყურადღებით ვუსმენთ, ნაკლებად ვრეაგირებთ იმპულსურად და მეტ სითბოს ვაჩვენებთ ახლობლებს.

## მოთმინება იწყება შინაგანი სიმშვიდით

პრაქტიკოსები ხშირად აღნიშნავენ, რომ რამდენიმე კვირის შემდეგ ოჯახის წევრები პირველები ამჩნევენ ცვლილებას — „უფრო მშვიდი გახდი".

## ერთად მედიტაცია

ზოგი წყვილი ერთად ასრულებს დილის სესიას. ეს ხდება დღის საერთო, მშვიდი დასაწყისი.`,
  },
  {
    slug: 'pirveli-kvira',
    title: 'პირველი კვირა: რას უნდა ელოდოთ',
    daysAgo: 34,
    content: `ტექნიკის შესწავლის პირველ დღეებში ბევრი რამ ახალია. ზოგი მაშინვე გრძნობს ღრმა სიმშვიდეს, ზოგს კი რამდენიმე დღე სჭირდება.

## ნორმალურია, თუ...

- სესიის დროს ბევრი აზრი მოდის — ეს პროცესის ნაწილია
- სესიის შემდეგ ცოტა ძილი გეწყებათ
- ზოგი დღე უფრო „ღრმაა", ზოგი — ნაკლებად

## მასწავლებლის როლი

პირველი კვირის განმავლობაში მასწავლებელი რამდენჯერმე ხვდება მოსწავლეს, რათა პრაქტიკა სწორად და უძალისხმევოდ მიმდინარეობდეს.`,
  },
];

const BOOK = SAMPLE_BOOK;

async function main() {
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (adminPassword === undefined || adminPassword.length < 10) {
    throw new Error('Set SEED_ADMIN_PASSWORD (min 10 characters) in apps/web/.env before seeding');
  }

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: { role: 'admin', isActive: true },
    create: {
      username: 'admin',
      email: 'admin@tm.local',
      passwordHash: await hash(adminPassword, 12),
      firstName: 'ადმინისტრატორი',
      lastName: 'TM',
      role: 'admin',
    },
  });
  console.log('Seeded admin user');

  for (const post of POSTS) {
    const publishedAt = new Date(Date.now() - post.daysAgo * DAY);
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: { title: post.title, content: post.content },
      create: { slug: post.slug, title: post.title, content: post.content, status: 'published', publishedAt, authorId: admin.id },
    });
  }
  console.log(`Seeded ${POSTS.length} posts`);

  const book = await prisma.book.upsert({
    where: { slug: BOOK.slug },
    update: { title: BOOK.title, author: BOOK.author, description: BOOK.description },
    create: {
      slug: BOOK.slug,
      title: BOOK.title,
      author: BOOK.author,
      description: BOOK.description,
      status: 'published',
      publishedAt: new Date(),
    },
  });
  await prisma.bookPage.deleteMany({ where: { bookId: book.id } });
  await prisma.bookPage.createMany({
    data: BOOK.pages.map((page, index) => ({ bookId: book.id, number: index + 1, ...page })),
  });
  console.log(`Seeded book with ${BOOK.pages.length} pages`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
