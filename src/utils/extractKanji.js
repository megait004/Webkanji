/** @param {string} text */
export function extractKanjiChars(text) {
  const chars = [...text].filter((ch) => /[\u4E00-\u9FFF]/.test(ch));
  return [...new Set(chars)];
}
