/**
 * Valid English words that are 1-2 characters long.
 * Words shorter than 3 characters must appear in this set to be accepted in submissions.
 *
 * Populated from the server on connect. The hardcoded fallback ensures validation
 * works even if the server message hasn't arrived yet.
 */
const FALLBACK_WORDS = [
  "a", "i",
  "ah", "am", "an", "as", "at", "aw", "ax", "ba", "be", "by", "do", "eh", "em", "ew", "gi", "go",
  "ha", "he", "hi", "hm", "ho", "id", "if", "in", "is", "it", "ki", "lo", "ma", "me", "my", "no",
  "of", "oh", "oi", "ok", "on", "or", "ow", "ox", "pa", "pi", "qi", "sh", "so", "ta", "to", "uh",
  "um", "up", "us", "we", "ya", "ye",
];

export let SHORT_WORDS: Set<string> = new Set(FALLBACK_WORDS);

/**
 * Replace the short words set with the server-provided list.
 * Called once on initial cable connection.
 */
export function setShortWords(words: string[]) {
  SHORT_WORDS = new Set(words.map((w) => w.toLowerCase()));
}

/**
 * Check if a word meets the minimum length requirement.
 * Words must be 3+ characters, or be in the short words allowlist.
 */
export function isValidWordLength(word: string): boolean {
  if (word.length >= 3) return true;
  return SHORT_WORDS.has(word.toLowerCase());
}
