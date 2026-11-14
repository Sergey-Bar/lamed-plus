import type { Question } from '../../lib/content/schema'

export type Phase = 'intro' | 'active' | 'result'

export interface QuestionResult {
  question: Question
  selected: number[]
  correct: boolean
  correctIndexes: number[]
}

export interface Result {
  score: number
  total: number
  passed: boolean
  threshold: number
  durationSec: number
  results: QuestionResult[]
}

export interface Draft {
  category: string
  ids: string[]
  selections: number[][]
  flags: number[]
  index: number
  deadline: number
}

export const DRAFT_KEY = 'lamed-exam-draft'
/** Earlier builds used the old product name; keep resuming those drafts. */
export const LEGACY_DRAFT_KEY = 'theoria-exam-draft'

export function shuffle<T>(items: T[]): T[] {
  const array = [...items]
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

export function readDraft(category?: string): Draft | null {
  if (!category) return null
  try {
    const raw = localStorage.getItem(DRAFT_KEY) ?? localStorage.getItem(LEGACY_DRAFT_KEY)
    if (!raw) return null
    const draft = JSON.parse(raw) as Draft
    if (
      draft.category !== category ||
      !Array.isArray(draft.ids) ||
      draft.ids.length === 0 ||
      typeof draft.deadline !== 'number' ||
      draft.deadline <= Date.now()
    ) {
      return null
    }
    return draft
  } catch {
    return null
  }
}