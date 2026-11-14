import { describe, expect, it } from 'vitest'
import { isSelectionCorrect, translate } from './questions'
import type { Question } from './schema'
import laws from '../../../data/bank/laws-01.json'

const questions = laws as unknown as Question[]

describe('exam grading across languages', () => {
  it('finds questions whose answer position differs between Hebrew and Russian', () => {
    // Guards the assumption behind the regression below: official translations
    // are not index-aligned, so a single-language answer key cannot be reused.
    const divergent = questions.filter(
      (question) => question.translations.he && question.translations.ru,
    ).filter(
      (question) =>
        question.translations.he!.correctIndexes[0] !==
        question.translations.ru!.correctIndexes[0],
    )
    expect(divergent.length).toBeGreaterThan(0)
  })

  it('accepts the correct option in the language the learner is reading', () => {
    for (const question of questions) {
      for (const language of ['he', 'en', 'ru', 'ar'] as const) {
        const translation = translate(question, language)
        if (!translation) continue
        expect(
          isSelectionCorrect(question, language, translation.correctIndexes),
          `${question.id} in ${language}`,
        ).toBe(true)
      }
    }
  })

  it('rejects an option that is only correct in another language', () => {
    const question = questions.find((candidate) => {
      const he = candidate.translations.he
      const ru = candidate.translations.ru
      return he && ru && he.correctIndexes[0] !== ru.correctIndexes[0]
    })
    expect(question).toBeDefined()
    const heIndex = question!.translations.he!.correctIndexes[0]
    const ruIndex = question!.translations.ru!.correctIndexes[0]
    expect(isSelectionCorrect(question!, 'ru', [ruIndex])).toBe(true)
    expect(isSelectionCorrect(question!, 'ru', [heIndex])).toBe(false)
  })
})
