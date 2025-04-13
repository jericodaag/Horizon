export interface TypewriterWord {
  text: string;
  className?: string;
}

export const typewriterWords: TypewriterWord[] = [
  { text: 'Share ' },
  { text: 'Your ' },
  { text: 'Story ', className: 'text-violet-500' },
];
