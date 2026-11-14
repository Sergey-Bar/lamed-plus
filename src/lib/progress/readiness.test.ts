import { describe, expect, it } from 'vitest'
import {
  buildReadiness,
  READINESS_COVERAGE_TARGET,
  READINESS_WEIGHTS,
} from './readiness'
import type { ReadinessEvent } from './readiness'
import type { ProgressState } from './context'

const NOW = new Date('2026-03-15T12:00:00Z').getTime()
const DAY = 86400000

function events(count: number, correctRatio: number, category = 'B'): ReadinessEvent[] {
  void category
  return Array.from({ length: count }, (_, index) => ({
    questionId: `q${index}`,
    correct: index % 100 < correctRatio * 100,
    // Spread across the last five days so consistency can reach its cap.
    ts: NOW - (index % 5) * DAY,
  }))
}

const noExams: Array<{ score: number; total: number; ts: number }> = [
  { score: 28, total: 30, ts: NOW - DAY },
  { score: 27, total: 30, ts: NOW - 2 * DAY },
]

const emptyMastery = {} as ProgressState['mastery']

function report(answered: number, correctRatio = 0.9, totalQuestions = 1276) {
  return buildReadiness({
    events: events(answered, correctRatio),
    exams: noExams,
    totalQuestions,
    mastery: emptyMastery,
    category: 'B',
    now: NOW,
  })
}

describe('buildReadiness', () => {
  it('holds the score at zero until there is enough evidence', () => {
    const early = report(10)
    expect(early.band).toBe('insufficient')
    expect(early.score).toBe(0)
  })

  it('lets a consistent, accurate learner reach the strong band', () => {
    // 220 unique questions, 90% recent accuracy, five active days, 92% exams.
    const mature = report(220)
    expect(mature.sample).toBe(220)
    expect(mature.score).toBeGreaterThanOrEqual(75)
    expect(mature.band).toBe('strong')
  })

  it('keeps the score honest about the size of the bank', () => {
    const mature = report(220)
    expect(mature.totalQuestions).toBe(1276)
    expect(mature.coverageTarget).toBeLessThan(mature.totalQuestions)
  })

  it('never calls a learner ready when recent accuracy is below the pass margin', () => {
    // Plenty of coverage, consistency and exam history, but only 45% accuracy.
    const weak = report(220, 0.45)
    expect(weak.score).toBeLessThan(75)
    expect(weak.band).toBe('weak')
  })

  it('lets recent accuracy cap an otherwise flattering score', () => {
    const inconsistent = buildReadiness({
      events: events(240, 0.72),
      exams: noExams,
      totalQuestions: 1276,
      mastery: emptyMastery,
      category: 'B',
      now: NOW,
    })
    expect(inconsistent.band).not.toBe('strong')
  })

  it('measures coverage against the study target, not the whole bank', () => {
    const target = report(READINESS_COVERAGE_TARGET)
    expect(target.components.coverage).toBe(100)
    expect(target.coverageTarget).toBe(READINESS_COVERAGE_TARGET)
  })

  it('lets a small category reach full coverage', () => {
    const a3 = report(40, 0.95, 40)
    expect(a3.coverageTarget).toBe(40)
    expect(a3.components.coverage).toBe(100)
  })

  it('keeps the documented weights summing to one', () => {
    const sum = Object.values(READINESS_WEIGHTS).reduce((total, weight) => total + weight, 0)
    expect(sum).toBeCloseTo(1)
  })

  it('rates first-exposure accuracy separately from recent accuracy', () => {
    const mixed: ReadinessEvent[] = [
      ...events(30, 1),
      // A question repeated after a mistake must not leak into first-exposure accuracy.
      { questionId: 'q0', correct: false, ts: NOW },
    ]
    const value = buildReadiness({
      events: mixed,
      exams: [],
      totalQuestions: 1276,
      mastery: emptyMastery,
      category: 'B',
      now: NOW,
    })
    expect(value.components.unseen).toBe(100)
    expect(value.components.accuracy).toBeLessThan(100)
  })
})
