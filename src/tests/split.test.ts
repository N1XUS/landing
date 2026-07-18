import { describe, expect, it } from 'vitest';
import { splitLetters, splitWords } from '../lib/split';

describe('splitWords', () => {
  it('splits on whitespace', () => {
    expect(splitWords('Denys Severyn')).toEqual(['Denys', 'Severyn']);
  });
  it('collapses repeated whitespace and trims', () => {
    expect(splitWords('  Full-Stack   Engineer ')).toEqual(['Full-Stack', 'Engineer']);
  });
  it('returns empty array for empty/blank input', () => {
    expect(splitWords('')).toEqual([]);
    expect(splitWords('   ')).toEqual([]);
  });
});

describe('splitLetters', () => {
  it('splits words into letter arrays', () => {
    expect(splitLetters('AB CD')).toEqual([['A', 'B'], ['C', 'D']]);
  });
  it('handles single word', () => {
    expect(splitLetters('DENYS')).toEqual([['D', 'E', 'N', 'Y', 'S']]);
  });
  it('returns empty for blank', () => {
    expect(splitLetters('  ')).toEqual([]);
  });
});
