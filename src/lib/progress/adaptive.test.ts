import { describe, expect, it } from 'vitest'
import { adaptiveWeight, pickAdaptive, reviewWeight } from './adaptive'
import type { MasteryRecord, SrsRecord } from './types'

const record = (correct: number, answered: number): MasteryRecord => ({
  id: 'B:laws',
  category: 'B',
  topicId: 'laws',
  correct,
  answered,
})

describe('adaptive practice', () => {
  it('weights unseen topics above mastered ones', () => {
    expect(adaptiveWeight(undefined)).toBe(2)
    expect(adaptiveWeight(record(0, 10))).toBe(3)
    expect(adaptiveWeight(record(10, 10))).toBe(1)
  })

  it('picks the requested number of unique questions', () => {
    const questions = Array.from({ length: 25 }, (_, index) => ({
      id: `q${index}`,
      topicId: index % 2 === 0 ? 'laws' : 'signs',
    }))
    const picked = pickAdaptive(questions, {}, 'B', 10)

    expect(picked).toHaveLength(10)
    expect(new Set(picked.map((question) => question.id)).size).toBe(10)
  })

  it('never returns more questions than the pool holds', () => {
    const questions = [
      { id: 'q1', topicId: 'laws' },
      { id: 'q2', topicId: 'signs' },
    ]
    expect(pickAdaptive(questions, {}, 'B', 10)).toHaveLength(2)
  })

  it('prefers weak topics when the random draw is deterministic', () => {
    const mastery: Record<string, MasteryRecord> = {
      'B:laws': record(0, 10),
      'B:signs': record(10, 10),
    }
    const questions = [
      { id: 'strong-1', topicId: 'signs' },
      { id: 'strong-2', topicId: 'signs' },
      { id: 'weak-1', topicId: 'laws' },
    ]

    // A high draw lands in the last, heaviest slice (the weak topic).
    const picked = pickAdaptive(questions, mastery, 'B', 1, () => 0.99)
    expect(picked[0].topicId).toBe('laws')
  })
})

const NOW = new Date('2026-03-15T12:00:00Z').getTime()
const DAY = 86400000

const srs = (overrides: Partial<SrsRecord>): SrsRecord => ({
  id: 'q1',
  intervalDays: 3,
  dueTs: NOW + DAY,
  lapses: 0,
  lastSeenTs: NOW - 2 * DAY,
  ...overrides,
})

describe('per-question review weighting', () => {
  it('prefers unseen questions over scheduled ones', () => {
    expect(reviewWeight(undefined, NOW)).toBeGreaterThan(reviewWeight(srs({}), NOW))
  })

  it('suppresses a question answered moments ago', () => {
    const justSeen = srs({ lastSeenTs: NOW - 1000, dueTs: NOW + 3 * DAY })
    expect(reviewWeight(justSeen, NOW)).toBeLessThan(reviewWeight(undefined, NOW))
  })

  it('brings due and lapsed questions back first', () => {
    const overdue = srs({ dueTs: NOW - DAY, lapses: 2 })
    expect(reviewWeight(overdue, NOW)).toBeGreaterThan(reviewWeight(srs({}), NOW))
  })

  it('avoids repeating a question seen in the same session', () => {
    const questions = [
      { id: 'seen', topicId: 'laws' },
      { id: 'fresh', topicId: 'laws' },
    ]
    const state: Record<string, SrsRecord> = {
      seen: srs({ id: 'seen', lastSeenTs: NOW - 1000, dueTs: NOW + 5 * DAY }),
    }
    const picked = pickAdaptive(questions, {}, 'B', 1, () => 0.99, state, NOW)
    expect(picked[0].id).toBe('fresh')
  })
})
