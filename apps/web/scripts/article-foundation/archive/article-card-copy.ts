// Shared short card copy. Full titles and descriptions stay on article pages.
const ARTICLE_CARD_COPY: Record<string, { title: string; excerpt: string }> = {
  'meditatsia-uketesi-dzilistvis': {
    title: 'მედიტაცია უკეთესი ძილისთვის',
    excerpt:
      'გაიგე, როგორ ეხმარება მედიტაცია სტრესის შემცირებას, ჩაძინების გამარტივებასა და ძილის ხარისხის გაუმჯობესებას.',
  },
  'gulis-janmrteloba-da-meditatsia': {
    title: 'გულის ჯანმრთელობა და მედიტაცია',
    excerpt:
      'სამეცნიერო კვლევები აჩვენებს, როგორ უწყობს ხელს ტრანსცენდენტული მედიტაცია არტერიული წნევის შემცირებასა და გულის ჯანმრთელობის გაუმჯობესებას.',
  },
  'meditatsia-stresis-shesamtsireblad': {
    title: 'მედიტაცია სტრესის შესამცირებლად',
    excerpt:
      'როგორ მოქმედებს სტრესი სხეულსა და გონებაზე და რა როლი აქვს ტრანსცენდენტულ მედიტაციას მის შემცირებასა და შინაგანი სიმშვიდის განვითარებაში?',
  },
};

export function getArticleCardCopy(slug: string) {
  return ARTICLE_CARD_COPY[slug];
}
