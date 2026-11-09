/** 받침에 맞춰 "로/으로"를 붙인다. 받침이 없거나 ㄹ 받침이면 "로". (검토로, 추진으로, 결정으로) */
export function withRo(word: string) {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  if (code < 0 || code > 11171) return `${word}로`;
  const final = code % 28;
  return final === 0 || final === 8 ? `${word}로` : `${word}으로`;
}
