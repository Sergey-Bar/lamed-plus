import type { LanguageId } from './schema'
import data from '../../../data/explanations.json'

type Entry = Partial<Record<LanguageId, string>>

interface ExplanationFile {
  version: number
  updatedAt: string
  questions: Record<string, Entry>
}

const FILE = data as ExplanationFile

/** Languages we authored. Other UI languages read English, then Hebrew. */
const AUTHORED_FALLBACK: LanguageId[] = ['en', 'he']

export interface Explanation {
  text: string
  /** The language the text is actually written in. */
  language: LanguageId
}

/**
 * Authored explanation for a question, used after a mistake in practice and in
 * the mock-exam review. The official bank ships no explanations, so this file
 * covers the core questions; everything else falls back to the authored lesson
 * point in `related.ts`.
 */
export function getExplanation(questionId: string, language: LanguageId): Explanation | null {
  const entry = FILE.questions[questionId]
  if (!entry) return null
  const exact = entry[language]
  if (exact) return { text: exact, language }
  for (const fallback of AUTHORED_FALLBACK) {
    const text = entry[fallback]
    if (text) return { text, language: fallback }
  }
  return null
}

export function hasExplanation(questionId: string): boolean {
  return Boolean(FILE.questions[questionId])
}

export function explanationCount(): number {
  return Object.keys(FILE.questions).length
}

export function explanationUpdatedAt(): string {
  return FILE.updatedAt
}

export function explanationQuestionIds(): string[] {
  return Object.keys(FILE.questions)
}
