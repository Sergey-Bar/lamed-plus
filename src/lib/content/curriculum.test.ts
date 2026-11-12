import { describe, expect, it } from 'vitest'
import {
  LESSONS,
  SUBJECT_META,
  getLesson,
  getSubjectInsight,
  getSubjectLessons,
  localizeLesson,
  nextLesson,
  subjectProgress,
} from './curriculum'

const TRANSLATED = ['en', 'ru', 'ar', 'fr', 'es'] as const

describe('lesson localization', () => {
  it.each(TRANSLATED)('%s translates every lesson with the same structure', (language) => {
    for (const lesson of LESSONS) {
      const localized = localizeLesson(lesson, language)

      expect(localized.title.length).toBeGreaterThan(0)
      expect(localized.title).not.toBe(lesson.title)
      expect(localized.summary.length).toBeGreaterThan(0)
      expect(localized.blocks).toHaveLength(lesson.blocks.length)
      expect(localized.keyPoints).toHaveLength(lesson.keyPoints.length)

      localized.blocks.forEach((block, index) => {
        expect(block.body.length).toBeGreaterThan(0)
        expect(block.bullets?.length ?? 0).toBe(lesson.blocks[index].bullets?.length ?? 0)
      })
    }
  })

  it('falls back to the Hebrew source when a language is missing', () => {
    expect(localizeLesson(LESSONS[0], 'he')).toBe(LESSONS[0])
  })

  it.each(TRANSLATED)('%s translates every subject insight', (language) => {
    for (const subjectId of Object.keys(SUBJECT_META)) {
      const insight = getSubjectInsight(subjectId, language)

      expect(insight.length).toBeGreaterThan(0)
      expect(insight).not.toBe(SUBJECT_META[subjectId].insights)
    }
  })

  it('falls back to the Hebrew insight for an unknown subject', () => {
    expect(getSubjectInsight('unknown', 'en')).toBe('')
  })
})

describe('lesson lookup', () => {
  it('returns the lessons of a subject in order', () => {
    const lessons = getSubjectLessons('laws')

    expect(lessons.length).toBeGreaterThan(0)
    expect(lessons.every((lesson) => lesson.subjectId === 'laws')).toBe(true)
    expect(getSubjectLessons('unknown')).toEqual([])
  })

  it('finds a lesson by id', () => {
    expect(getLesson(LESSONS[0].id)).toBe(LESSONS[0])
    expect(getLesson('missing')).toBeUndefined()
  })

  it('returns the next lesson and stops at the end', () => {
    expect(nextLesson(LESSONS[0].id)).toBe(LESSONS[1])
    expect(nextLesson(LESSONS[LESSONS.length - 1].id)).toBeUndefined()
    expect(nextLesson('missing')).toBeUndefined()
  })

  it('computes subject progress as a rounded percentage', () => {
    const lessons = getSubjectLessons('laws')
    const [first, second] = lessons

    expect(subjectProgress([], [])).toBe(0)
    expect(subjectProgress(lessons, [])).toBe(0)
    expect(subjectProgress(lessons, [first.id, second.id])).toBe(
      Math.round((2 / lessons.length) * 100),
    )
  })
})
