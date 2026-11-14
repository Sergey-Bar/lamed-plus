import { describe, expect, it } from 'vitest'
import { contentLanguage, isPublished, publishedCount, translate, isPlayable } from './questions'
import type { Question } from './schema'

const base: Question = {
  id: 'B-signs-001',
  number: '1',
  topicId: 'signs',
  type: 'single',
  difficulty: 1,
  source: 'official',
  status: 'published',
  categories: ['B'],
  translations: {
    he: { stem: 'ש', options: ['א', 'ב'], correctIndexes: [0], explanation: 'ה' },
    en: { stem: 'e', options: ['a', 'b'], correctIndexes: [0], explanation: 'x' },
    ru: { stem: 'р', options: ['а', 'б'], correctIndexes: [0], explanation: 'я' },
  },
}

describe('question helpers', () => {
  describe('translate', () => {
    it('falls back to Hebrew when a translation is missing', () => {
      const he = translate(base, 'he')
      expect(he?.stem).toBe('ש')
    })

    it('returns the requested language when present', () => {
      const en = translate(base, 'en')
      expect(en?.stem).toBe('e')
    })

    it('falls back to Hebrew when the requested translation is missing', () => {
      const ar = translate(base, 'ar')
      expect(ar?.stem).toBe('ש')
    })

    it('reports the language actually shown after fallback', () => {
      expect(contentLanguage(base, 'ar')).toBe('he')
      expect(contentLanguage(base, 'en')).toBe('en')
      expect(contentLanguage(base, 'he')).toBe('he')
    })

    it('returns undefined when a question has no translations at all', () => {
      expect(contentLanguage({ ...base, translations: {} }, 'he')).toBeUndefined()
    })

    it('handles missing translations entirely', () => {
      const noTranslations = { ...base, translations: {} }
      expect(translate(noTranslations, 'he')).toBeUndefined()
    })
  })

  describe('isPublished', () => {
    it('counts only published questions', () => {
      const draft: Question = { ...base, id: 'B-x-2', status: 'draft' }
      const reviewed: Question = { ...base, id: 'B-x-3', status: 'reviewed' }
      expect(isPublished(base)).toBe(true)
      expect(isPublished(draft)).toBe(false)
      expect(isPublished(reviewed)).toBe(false)
    })
  })

  describe('isPlayable', () => {
    it('only plays published questions from the official bank', () => {
      expect(isPlayable(base)).toBe(true)
      expect(isPlayable({ ...base, source: 'authored' })).toBe(false)
      expect(isPlayable({ ...base, source: 'community' })).toBe(false)
      expect(isPlayable({ ...base, status: 'draft' })).toBe(false)
      expect(isPlayable({ ...base, status: 'reviewed' })).toBe(false)
    })
  })

  describe('publishedCount', () => {
    it('counts published questions correctly', () => {
      const draft: Question = { ...base, id: 'B-x-2', status: 'draft' }
      const reviewed: Question = { ...base, id: 'B-x-3', status: 'reviewed' }
      expect(publishedCount([base, draft, reviewed])).toBe(1)
      expect(publishedCount([draft, reviewed])).toBe(0)
      expect(publishedCount([base, base])).toBe(2)
      expect(publishedCount([])).toBe(0)
    })
  })

  describe('isPlayable', () => {
    it('returns true for published single-choice questions', () => {
      expect(isPlayable(base)).toBe(true)
    })

    it('returns false for draft questions', () => {
      const draft: Question = { ...base, status: 'draft' }
      expect(isPlayable(draft)).toBe(false)
    })

    it('returns false for reviewed questions', () => {
      const reviewed: Question = { ...base, status: 'reviewed' }
      expect(isPlayable(reviewed)).toBe(false)
    })

    it('returns false for image questions without image', () => {
      const imageQ: Question = { ...base, type: 'image', image: undefined }
      expect(isPlayable(imageQ)).toBe(false)
    })

    it('returns true for image questions with image', () => {
      const imageQ: Question = { ...base, type: 'image', image: 'assets/official/1.jpg' }
      expect(isPlayable(imageQ)).toBe(true)
    })

    it('returns true for multi-choice questions', () => {
      const multi: Question = { ...base, type: 'multi' }
      expect(isPlayable(multi)).toBe(true)
    })
  })

  describe('category and topic filtering', () => {
    const bank: Question[] = [
      { ...base, id: '1', status: 'published', categories: ['B'], topicId: 'signs' },
      { ...base, id: '2', status: 'published', categories: ['C1'], topicId: 'laws' },
      { ...base, id: '3', status: 'draft', categories: ['B'], topicId: 'signs' },
      { ...base, id: '4', status: 'published', categories: ['B', 'C1'], topicId: 'signs' },
    ]

    it('filters by category and playability', () => {
      const bQuestions = bank.filter((q) => isPlayable(q) && q.categories.includes('B'))
      expect(bQuestions).toHaveLength(2)
      expect(bQuestions.map((q) => q.id).sort()).toEqual(['1', '4'])
    })

    it('returns empty for unknown category', () => {
      const questions = bank.filter((q) => isPlayable(q) && q.categories.includes('UNKNOWN'))
      expect(questions).toHaveLength(0)
    })

    it('filters by topic as well', () => {
      const signsQuestions = bank.filter(
        (q) => isPlayable(q) && q.topicId === 'signs' && q.categories.includes('B'),
      )
      expect(signsQuestions.map((q) => q.id).sort()).toEqual(['1', '4'])
    })

    it('returns empty for unknown topic', () => {
      const questions = bank.filter(
        (q) => isPlayable(q) && q.topicId === 'unknown' && q.categories.includes('B'),
      )
      expect(questions).toHaveLength(0)
    })
  })
})
