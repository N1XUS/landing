/** Split text into words, dropping empty fragments from repeated whitespace. */
export const splitWords = (text: string): string[] =>
  text.split(/\s+/).filter(Boolean);

/** Split text into words, each word an array of its characters. */
export const splitLetters = (text: string): string[][] =>
  splitWords(text).map((w) => [...w]);
