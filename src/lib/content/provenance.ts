import meta from '../../../data/official-meta.json'
import manifest from '../../../data/bank-manifest.json'
import { explanationCount, explanationUpdatedAt } from './explanations'

/** When the official bank was last imported from data.gov.il. */
export const BANK_IMPORTED_AT: string = meta.importedAt
export const BANK_QUESTION_COUNT: number = manifest.totalQuestions
export const AUTHORED_EXPLANATION_COUNT: number = explanationCount()
export const AUTHORED_EXPLANATION_UPDATED_AT: string = explanationUpdatedAt()

export function formatDate(iso: string, language: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  try {
    return date.toLocaleDateString(language)
  } catch {
    return date.toISOString().slice(0, 10)
  }
}
