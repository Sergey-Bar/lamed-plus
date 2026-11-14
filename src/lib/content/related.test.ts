import { describe, expect, it } from 'vitest'
import { findRelatedPoint } from './related'
import type { Question } from './schema'

function question(stem: string, topicId = 'laws'): Question {
  return {
    id: 'q-test',
    topicId,
    categories: ['B'],
    type: 'single',
    difficulty: 2,
    source: 'official',
    status: 'published',
    translations: {
      he: { stem, options: ['א', 'ב', 'ג', 'ד'], correctIndexes: [0], explanation: '' },
      en: { stem, options: ['a', 'b', 'c', 'd'], correctIndexes: [0], explanation: '' },
    },
  }
}

describe('findRelatedPoint', () => {
  it('connects a stopping-distance question to the speed lesson', () => {
    const related = findRelatedPoint(
      question('כיצד משפיעה המהירות על מרחק העצירה בכביש רטוב?'),
      'he',
    )
    expect(related?.lessonId).toBe('laws-speed')
    expect(related?.point.length).toBeGreaterThan(0)
  })

  it('connects a tyre question to the tyre lesson', () => {
    const related = findRelatedPoint(
      question('מה בודקים בלחץ האוויר של הצמיגים?', 'vehicle'),
      'he',
    )
    expect(related?.lessonId).toBe('vehicle-tires')
  })

  it('connects a right-of-way question to the junctions lesson', () => {
    const related = findRelatedPoint(
      question('מי קודם בצומת שבו אין תמרורים?'),
      'he',
    )
    expect(related?.lessonId).toBe('laws-right-of-way')
  })

  it('links a terse stem to a lesson in the same subject', () => {
    const related = findRelatedPoint(question('מהירות סבירה היא:'), 'he')
    expect(related?.lessonId).toBe('laws-speed')
  })

  it('does not attach an unrelated lesson just because the subject matches', () => {
    // A U-turn question has no authored lesson; a generic "slow down" line is
    // not an explanation for it.
    const related = findRelatedPoint(
      question('נהג מתכוון לפנות פניית פרסה בקטע כביש ישר. עליו לוודא לפני כן (על פי החוק):'),
      'he',
    )
    expect(related).toBeNull()
  })

  it('returns null when the question shares no content words with a lesson', () => {
    expect(findRelatedPoint(question('מהי התשובה הנכונה?'), 'he')).toBeNull()
  })
})
