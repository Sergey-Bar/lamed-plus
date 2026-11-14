/**
 * Cheap content-word comparison used to connect official questions to the
 * authored lessons. The bank only has four broad topics, so matching on topic
 * alone would attach a question about stopping distance to a lesson about
 * vehicle ownership.
 */

// Words that say nothing about which concept a question tests.
const STOP_WORDS = new Set([
  'של', 'על', 'את', 'כל', 'לא', 'זה', 'היא', 'הוא', 'עם', 'או', 'אם',
  'מותר', 'אסור', 'אילו', 'באילו', 'לפי', 'איזה', 'מהי', 'מהו', 'כאשר',
  'בעת', 'עליך', 'חייב', 'חייבת', 'נכון', 'לפניך', 'לפניכם', 'הבא', 'הבאה',
  'בתנאים', 'אופן', 'דרך', 'כלל', 'ברכב', 'הרכב', 'נסיעה', 'נוהג', 'הנוהג',
  'נהג', 'הנהג', 'אדם', 'אחר', 'אחרת', 'יותר', 'פחות', 'גם', 'רק', 'כדי',
  'לפני', 'אחרי', 'כן', 'עליו', 'עליה', 'לוודא', 'צריך', 'אפשר', 'תמיד',
  'בתוך', 'מתי', 'כמה', 'האם', 'אשר', 'שלא', 'שלו', 'שלה', 'אתם', 'אתכם',
  'שלכם', 'שלהם', 'מול', 'בין', 'עד', 'אלא', 'כך', 'שם', 'כביש', 'כבישים',
])

export function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word.length >= 4 && !STOP_WORDS.has(word))
}

/** How many distinct content words of `words` appear in `text`. */
export function overlapScore(words: string[], text: string): number {
  const candidates = tokens(text)
  if (candidates.length === 0) return 0
  return words.reduce(
    (sum, word) =>
      sum + (candidates.some((candidate) => candidate.includes(word) || word.includes(candidate)) ? 1 : 0),
    0,
  )
}

/**
 * Rank items by shared content words with the lesson. A single shared word is
 * noise, so callers should require at least two.
 */
export function rankByRelevance<T>(
  items: T[],
  textOf: (item: T) => string,
  lessonText: string,
  minimumScore = 2,
): T[] {
  const lessonTokens = tokens(lessonText)
  if (lessonTokens.length === 0) return items
  return items
    .map((item) => ({ item, score: overlapScore(lessonTokens, textOf(item)) }))
    .filter((entry) => entry.score >= minimumScore)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.item)
}
