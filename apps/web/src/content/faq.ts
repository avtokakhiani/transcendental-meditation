export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

// Temporary editorial placeholders only. Replace with approved questions and answers;
// add more entries with unique IDs as needed. No FAQ answers have been supplied yet.
export const faqItems: readonly FaqItem[] = [
  {
    id: 'question-01',
    question: '[კითხვის ადგილი · 01]',
    answer: '[პასუხის ადგილი — ტექსტი მოგვიანებით დაემატება.]',
  },
  {
    id: 'question-02',
    question: '[კითხვის ადგილი · 02]',
    answer: '[პასუხის ადგილი — ტექსტი მოგვიანებით დაემატება.]',
  },
  {
    id: 'question-03',
    question: '[კითხვის ადგილი · 03]',
    answer: '[პასუხის ადგილი — ტექსტი მოგვიანებით დაემატება.]',
  },
];
