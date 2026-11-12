import { describe, expect, it } from 'vitest'
import {
  loadCategoryQuestions,
  loadTopicQuestions,
  isPlayable,
} from './questions'

describe('bank loading', () => {
  it('loads only playable questions for a category', async () => {
    const questions = await loadCategoryQuestions('B')

    expect(questions.length).toBeGreaterThan(0)
    expect(questions.every((question) => isPlayable(question))).toBe(true)
    expect(questions.every((question) => question.categories.includes('B'))).toBe(true)
  })

  it('loads a single topic without the rest of the bank', async () => {
    const questions = await loadTopicQuestions('B', 'signs')

    expect(questions.length).toBeGreaterThan(0)
    expect(questions.every((question) => question.topicId === 'signs')).toBe(true)
    expect(questions.every((question) => question.categories.includes('B'))).toBe(true)
  })

  it('reuses the cached topic promise', async () => {
    const first = await loadTopicQuestions('B', 'signs')
    const second = await loadTopicQuestions('B', 'signs')

    expect(second).toBe(first)
  })
})
