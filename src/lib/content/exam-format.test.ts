import { describe, expect, it } from 'vitest'
import { CATEGORIES } from './categories'
import { BANK_QUESTION_COUNT, BANK_IMPORTED_AT, formatDate } from './provenance'

describe('exam format', () => {
  // Verified against the Ministry of Transport description of the theory test:
  // 30 multiple-choice questions, 40 minutes, 26 correct answers to pass.
  it('matches the official structure for every licence class', () => {
    expect(CATEGORIES).toHaveLength(7)
    for (const category of CATEGORIES) {
      expect(category.questionCount, category.id).toBe(30)
      expect(category.timeMinutes, category.id).toBe(40)
      expect(category.passThreshold, category.id).toBe(26)
    }
  })
})

describe('data provenance', () => {
  it('knows how many questions the bank holds', () => {
    expect(BANK_QUESTION_COUNT).toBeGreaterThan(1000)
  })

  it('records when the bank was imported', () => {
    expect(Number.isNaN(new Date(BANK_IMPORTED_AT).getTime())).toBe(false)
  })

  it('formats dates and passes unparseable values through', () => {
    expect(formatDate('2026-01-05T00:00:00Z', 'en')).toContain('2026')
    expect(formatDate('not-a-date', 'en')).toBe('not-a-date')
  })
})
