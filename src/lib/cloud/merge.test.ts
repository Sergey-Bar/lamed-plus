import { describe, expect, it } from 'vitest'
import { mergeSnapshots } from './merge'
import type { Snapshot } from './snapshot'

function snapshot(overrides: Partial<Snapshot> = {}): Snapshot {
  return {
    version: 1,
    updatedAt: 1000,
    onboarded: true,
    displayName: 'A',
    studyStage: 'starting',
    lessons: [],
    dailyGoal: 20,
    defaultCategory: 'B',
    testDate: null,
    xp: 0,
    streak: { count: 0, best: 0, lastDay: '' },
    inventory: { id: 'inventory', energy: 0, lives: 3, lastLivesTs: 0, shield: 0, used: {} },
    mastery: [],
    srs: [],
    achievements: [],
    daily: null,
    stats: { id: 'stats', examsCompleted: 0, examsPassed: 0 },
    exams: [],
    answeredCount: 0,
    ...overrides,
  }
}

describe('mergeSnapshots', () => {
  it('keeps answers from both devices instead of overwriting one side', () => {
    const local = snapshot({
      mastery: [{ id: 'm1', category: 'B', topicId: 'laws', correct: 5, answered: 8 }],
    })
    const remote = snapshot({
      updatedAt: 5000,
      mastery: [{ id: 'm1', category: 'B', topicId: 'laws', correct: 9, answered: 12 }],
    })
    const merged = mergeSnapshots(local, remote)
    expect(merged.mastery).toEqual([
      { id: 'm1', category: 'B', topicId: 'laws', correct: 9, answered: 12 },
    ])
  })

  it('merges distinct topics and unions lessons and achievements', () => {
    const merged = mergeSnapshots(
      snapshot({
        lessons: ['a'],
        achievements: ['firstSteps'],
        mastery: [{ id: 'm1', category: 'B', topicId: 'laws', correct: 1, answered: 2 }],
      }),
      snapshot({
        updatedAt: 2000,
        lessons: ['b'],
        achievements: ['examPass'],
        mastery: [{ id: 'm2', category: 'B', topicId: 'signs', correct: 3, answered: 4 }],
      }),
    )
    expect(merged.mastery.map((record) => record.id).sort()).toEqual(['m1', 'm2'])
    expect(merged.lessons.sort()).toEqual(['a', 'b'])
    expect(merged.achievements.sort()).toEqual(['examPass', 'firstSteps'])
  })

  it('takes growing counters as a maximum', () => {
    const merged = mergeSnapshots(
      snapshot({ xp: 120, answeredCount: 40, streak: { count: 3, best: 7, lastDay: '2026-11-10' } }),
      snapshot({
        updatedAt: 3000,
        xp: 90,
        answeredCount: 60,
        streak: { count: 5, best: 5, lastDay: '2026-11-12' },
      }),
    )
    expect(merged.xp).toBe(120)
    expect(merged.answeredCount).toBe(60)
    expect(merged.streak).toEqual({ count: 5, best: 7, lastDay: '2026-11-12' })
  })

  it('lets the most recently edited device decide preferences', () => {
    const merged = mergeSnapshots(
      snapshot({ updatedAt: 9000, dailyGoal: 40, testDate: '2027-02-01' }),
      snapshot({ updatedAt: 1000, dailyGoal: 20, testDate: null }),
    )
    expect(merged.dailyGoal).toBe(40)
    expect(merged.testDate).toBe('2027-02-01')
  })

  it('deduplicates exams and keeps the newest first', () => {
    const exam = { id: 'e1', category: 'B', ts: 100, score: 26, total: 30, passed: true, durationSec: 900 }
    const merged = mergeSnapshots(
      snapshot({ exams: [exam] }),
      snapshot({
        updatedAt: 2000,
        exams: [exam, { ...exam, id: 'e2', ts: 200, score: 28 }],
      }),
    )
    expect(merged.exams.map((entry) => entry.id)).toEqual(['e2', 'e1'])
  })

  it('prefers the newer review card but keeps the higher lapse count', () => {
    const merged = mergeSnapshots(
      snapshot({
        srs: [{ id: 's1', intervalDays: 2, dueTs: 10, lapses: 2, lastSeenTs: 50 }],
      }),
      snapshot({
        updatedAt: 2000,
        srs: [{ id: 's1', intervalDays: 8, dueTs: 90, lapses: 1, lastSeenTs: 70 }],
      }),
    )
    expect(merged.srs[0]).toMatchObject({ intervalDays: 8, lapses: 2 })
  })
})
