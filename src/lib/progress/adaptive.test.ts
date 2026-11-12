import { describe, expect, it } from 'vitest'
import { adaptiveWeight, pickAdaptive } from './adaptive'
import type { MasteryRecord } from './types'

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
