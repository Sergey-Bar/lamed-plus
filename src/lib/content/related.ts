import type { LanguageId, Question } from './schema'
import { LESSONS, localizeLesson } from './curriculum'
import { translate } from './questions'
import { overlapScore, tokens } from './relevance'

export interface RelatedPoint {
  lessonId: string
  subjectId: string
  title: string
  /** An authored, reviewed line from the lesson — never generated law text. */
  point: string
  score: number
}

/**
 * Find the authored lesson line that best explains a question. Used after a
 * wrong answer so feedback can point at real course material instead of only
 * marking the option red. Returns null when nothing is close enough.
 */
export function findRelatedPoint(
  question: Question,
  language: LanguageId,
): RelatedPoint | null {
  const stem = translate(question, language)?.stem ?? ''
  const stemTokens = tokens(stem)
  if (stemTokens.length === 0) return null

  let best: RelatedPoint | null = null
  for (const source of LESSONS) {
    const lesson = localizeLesson(source, language)
    const body = [
      lesson.title,
      lesson.summary,
      ...lesson.keyPoints,
      ...lesson.blocks.map((block) =>
        [block.heading ?? '', block.body, ...(block.bullets ?? [])].join(' '),
      ),
    ].join(' ')

    // The question must share a word with the lesson's title or key points.
    // Two incidental body words are not evidence that the lesson explains it.
    const conceptOverlap = Math.max(
      overlapScore(stemTokens, lesson.title),
      ...lesson.keyPoints.map((text) => overlapScore(stemTokens, text)),
    )
    if (conceptOverlap === 0) continue

    const sameSubject = lesson.subjectId === question.topicId ? 1 : 0
    const score = overlapScore(stemTokens, body) + sameSubject
    if (score < 2) continue
    if (best && score <= best.score) continue

    const point = [...lesson.keyPoints]
      .map((text) => ({ text, score: overlapScore(stemTokens, text) }))
      .sort((a, b) => b.score - a.score)[0]

    best = {
      lessonId: lesson.id,
      subjectId: lesson.subjectId,
      title: lesson.title,
      point: point?.text ?? lesson.keyPoints[0] ?? lesson.summary,
      score,
    }
  }

  return best
}
