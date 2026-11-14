import { describe, expect, it } from 'vitest'
import { loadCategoryQuestions } from './questions'
import {
  explanationCount,
  explanationQuestionIds,
  getExplanation,
  hasExplanation,
} from './explanations'

describe('authored explanations', () => {
  it('references only real bank questions', async () => {
    const ids = new Set((await loadCategoryQuestions('B')).map((question) => question.id))
    for (const id of explanationQuestionIds()) {
      expect(ids.has(id), `explanation for unknown question ${id}`).toBe(true)
    }
  })

  it('covers a meaningful core set, not a token sample', () => {
    expect(explanationCount()).toBeGreaterThanOrEqual(40)
  })

  it('is authored in Hebrew and English for every entry', () => {
    for (const id of explanationQuestionIds()) {
      expect(getExplanation(id, 'he')?.language, id).toBe('he')
      expect(getExplanation(id, 'en')?.language, id).toBe('en')
      expect((getExplanation(id, 'he')?.text ?? '').length).toBeGreaterThan(20)
      expect((getExplanation(id, 'en')?.text ?? '').length).toBeGreaterThan(20)
    }
  })

  it('falls back to English for languages without an authored text', () => {
    const explanation = getExplanation('q0001', 'ru')
    expect(explanation?.language).toBe('en')
    expect(explanation?.text.length).toBeGreaterThan(0)
  })

  it('returns null for questions without an authored explanation', async () => {
    const uncovered = (await loadCategoryQuestions('B')).find(
      (question) => !hasExplanation(question.id),
    )
    expect(uncovered).toBeDefined()
    expect(getExplanation(uncovered!.id, 'he')).toBeNull()
  })
})
