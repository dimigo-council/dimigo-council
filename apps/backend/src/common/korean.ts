/** Picks the Korean particle that fits the last syllable of a word. */
function hasFinalConsonant(word: string): boolean | null {
  const code = word.trim().codePointAt(word.trim().length - 1);
  if (code === undefined || code < 0xac00 || code > 0xd7a3) return null;
  return (code - 0xac00) % 28 !== 0;
}

/** 이서연이 / 조원이 / 안지호가 */
export function withIGa(word: string): string {
  return `${word}${hasFinalConsonant(word) === false ? '가' : '이'}`;
}

/** 정민준으로 / 안지호로 / 서울로 (ㄹ takes 로) */
export function withRo(word: string): string {
  const code = word.trim().codePointAt(word.trim().length - 1) ?? 0;
  const final = hasFinalConsonant(word);
  const isRieul = final === true && (code - 0xac00) % 28 === 8;
  return `${word}${final && !isRieul ? '으로' : '로'}`;
}
