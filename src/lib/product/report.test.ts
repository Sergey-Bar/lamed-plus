import { describe, expect, it, vi } from 'vitest'
import { loadCategoryQuestions } from '../content/questions'
import { buildQuestionReport, sendQuestionReport } from './report'

async function firstQuestion() {
  const questions = await loadCategoryQuestions('B')
  const question = questions[0]
  const translation = question.translations.he!
  return { question, translation }
}

describe('question report', () => {
  it('includes the identifiers a maintainer needs', async () => {
    const { question, translation } = await firstQuestion()
    const report = buildQuestionReport({
      question,
      language: 'he',
      category: 'B',
      selected: [1],
    })
    expect(report).toContain(question.id)
    expect(report).toContain(translation.stem)
    expect(report).toContain('Category: B')
    expect(report).toContain('Selected: 2')
    expect(report).toMatch(/Correct: \d/)
  })

  it('marks an unanswered question instead of inventing a choice', async () => {
    const { question } = await firstQuestion()
    const report = buildQuestionReport({ question, language: 'he', category: 'B', selected: [] })
    expect(report).toContain('Selected: —')
  })

  it('copies the report when no mail channel is configured', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    await expect(sendQuestionReport('report body')).resolves.toBe('copied')
    expect(writeText).toHaveBeenCalledWith('report body')
  })

  it('reports a failure instead of pretending it was sent', async () => {
    Object.defineProperty(navigator, 'clipboard', { value: {}, configurable: true })
    await expect(sendQuestionReport('report body')).resolves.toBe('failed')
  })
})
