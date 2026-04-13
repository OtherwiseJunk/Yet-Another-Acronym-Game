import shortWordsList from "../../shared/short_words.json";

/**
 * Valid English words that are 1-2 characters long.
 * Words shorter than 3 characters must appear in this set to be accepted in submissions.
 * Sourced from shared/short_words.json (single source of truth for frontend + backend).
 */
export const SHORT_WORDS: Set<string> = new Set(shortWordsList);

/**
 * Check if a word meets the minimum length requirement.
 * Words must be 3+ characters, or be in the short words allowlist.
 */
export function isValidWordLength(word: string): boolean {
  if (word.length >= 3) return true;
  return SHORT_WORDS.has(word.toLowerCase());
}
