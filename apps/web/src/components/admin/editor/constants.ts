import { CircleCheck, CircleX, Info, StickyNote, TriangleAlert } from 'lucide-react';
import type { PanelVariant } from './extensions';

export const TEXT_COLORS: ReadonlyArray<{ label: string; value: string | null }> = [
  { label: 'ნაგულისხმევი', value: null },
  { label: 'იისფერი', value: '#6b5272' },
  { label: 'წითელი', value: '#c9372c' },
  { label: 'ნარინჯისფერი', value: '#c25100' },
  { label: 'ყვითელი', value: '#946f00' },
  { label: 'მწვანე', value: '#216e4e' },
  { label: 'ზღვისფერი', value: '#206a83' },
  { label: 'ლურჯი', value: '#0055cc' },
  { label: 'მეწამული', value: '#5e4db2' },
  { label: 'ნაცრისფერი', value: '#626f86' },
];

export const HIGHLIGHTS: ReadonlyArray<{ label: string; value: string | null }> = [
  { label: 'ფონის გარეშე', value: null },
  { label: 'ფონი: ყვითელი', value: '#fff3c4' },
  { label: 'ფონი: მწვანე', value: '#dcfff1' },
  { label: 'ფონი: ლურჯი', value: '#e9f2ff' },
  { label: 'ფონი: მეწამული', value: '#f3f0ff' },
  { label: 'ფონი: წითელი', value: '#ffeceb' },
];

export const PANELS: ReadonlyArray<{ variant: PanelVariant; label: string; icon: typeof Info; swatch: string }> = [
  { variant: 'info', label: 'ინფორმაცია', icon: Info, swatch: 'text-[#0c66e4]' },
  { variant: 'note', label: 'შენიშვნა', icon: StickyNote, swatch: 'text-[#6e5dc6]' },
  { variant: 'success', label: 'წარმატება', icon: CircleCheck, swatch: 'text-[#22a06b]' },
  { variant: 'warning', label: 'გაფრთხილება', icon: TriangleAlert, swatch: 'text-[#d97008]' },
  { variant: 'error', label: 'შეცდომა', icon: CircleX, swatch: 'text-[#c9372c]' },
];
