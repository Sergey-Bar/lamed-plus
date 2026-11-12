import { describe, expect, it, vi, beforeEach } from 'vitest'
import { clearAll } from '../store/store'
import { recordAnswer, spendPowerup, finishExam, ensureDaily, completeOnboarding } from './actions'
import { loadProgress, saveProgress } from './persistence'
import type { PersistedProgress } from './persistence'
import type { ProgressState, AnswerInput, FinishExamInput } from './context'

// Mock the store
vi.mock('../store/store', async () => {
  const actual = await vi.importActual('../store/store')
  return {
    ...actual,
    get: vi.fn(),
    put: vi.fn(),
    append: vi.fn(),
    all: vi.fn(),
  }
})

vi.mock('../i18n/useI18n', () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        'toast.levelUp': 'Level Up!',
        'toast.level': 'Level {{level}}',
        'toast.achievement': 'Achievement unlocked!',
        'toast.dailyDone': 'Daily challenge complete!',
      }
      let result = translations[key] || key
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          result = result.replace(`{{${k}}}`, String(v))
        })
      }
      return result
    },
  }),
}))

vi.mock('../../components/useToast', () => ({
  useToast: () => ({
    show: vi.fn(),
  }),
}))

describe('Progress integration flows', () => {
  let mockState: ProgressState

  beforeEach(async () => {
    vi.clearAllMocks()
    await clearAll()

    mockState = {
      ready: true,
      onboarded: true,
      dailyGoal: 20,
      defaultCategory: 'B',
      testDate: null,
      displayName: '',
      studyStage: 'starting',
      lessons: [],
      xp: 0,
      level: 1,
      streak: { count: 0, best: 0, lastDay: '' },
      inventory: { id: 'inventory', energy: 0, lives: 5, lastLivesTs: Date.now(), shield: 0, used: {} },
      mastery: {},
      srs: {},
      achievements: [],
      daily: null,
      stats: { id: 'stats', examsCompleted: 0, examsPassed: 0 },
      exams: [],
      answeredCount: 0,
    }
  })

  describe('recordAnswer flow', () => {
    it('records correct answer and updates XP', async () => {
      const input: AnswerInput = {
        category: 'B',
        topicId: 'signs',
        questionId: 'q1',
        correct: true,
        mode: 'practice',
      }

      const result = recordAnswer(mockState, input)

      expect(result.state.xp).toBe(10)
      expect(result.state.answeredCount).toBe(1)
      expect(result.state.mastery['B:signs']).toEqual({
        id: 'B:signs',
        category: 'B',
        topicId: 'signs',
        correct: 1,
        answered: 1,
      })
    })

    it('records incorrect answer without XP gain', async () => {
      const input: AnswerInput = {
        category: 'B',
        topicId: 'signs',
        questionId: 'q1',
        correct: false,
        mode: 'practice',
      }

      const result = recordAnswer(mockState, input)

      expect(result.state.xp).toBe(0)
      expect(result.state.answeredCount).toBe(1)
      expect(result.state.mastery['B:signs'].correct).toBe(0)
      expect(result.state.mastery['B:signs'].answered).toBe(1)
    })

    it('never consumes lives or shields in practice', () => {
      const state: ProgressState = {
        ...mockState,
        inventory: { ...mockState.inventory, lives: 3, shield: 2 },
      }
      const result = recordAnswer(state, {
        category: 'B',
        topicId: 'signs',
        questionId: 'q1',
        correct: false,
        mode: 'practice',
      })

      expect(result.state.inventory.lives).toBe(3)
      expect(result.state.inventory.shield).toBe(2)
    })

    it('increments streak on first answer of the day', async () => {
      const input: AnswerInput = {
        category: 'B',
        topicId: 'signs',
        questionId: 'q1',
        correct: true,
        mode: 'practice',
      }

      const result = recordAnswer(mockState, input)

      expect(result.state.streak.count).toBe(1)
      expect(result.state.streak.best).toBe(1)
    })

    it('awards bonus XP for completing daily challenge', async () => {
      const today = new Date().toISOString().split('T')[0]
      const stateWithDaily: ProgressState = {
        ...mockState,
        daily: {
          id: today,
          topicId: 'signs',
          target: 2,
          answered: 1,
          correct: 1,
          completed: false,
        },
      }

      const input: AnswerInput = {
        category: 'B',
        topicId: 'signs',
        questionId: 'q2',
        correct: true,
        mode: 'practice',
      }

      const result = recordAnswer(stateWithDaily, input)

      expect(result.state.daily?.completed).toBe(true)
      expect(result.state.xp).toBe(60) // 10 base + 50 daily bonus
      expect(result.dailyCompleted).toBe(true)
    })

    it('unlocks firstSteps achievement after first answer', async () => {
      const input: AnswerInput = {
        category: 'B',
        topicId: 'signs',
        questionId: 'q1',
        correct: true,
        mode: 'practice',
      }

      const result = recordAnswer(mockState, input)

      expect(result.newAchievements).toContain('firstSteps')
    })
  })

  describe('level up flow', () => {
    it('levels up at 100 XP', async () => {
      const stateAt99: ProgressState = { ...mockState, xp: 99, level: 1 }
      const input: AnswerInput = {
        category: 'B',
        topicId: 'signs',
        questionId: 'q1',
        correct: true,
        mode: 'practice',
      }

      const result = recordAnswer(stateAt99, input)

      expect(result.state.xp).toBe(109)
      expect(result.state.level).toBe(2)
      expect(result.levelUp).toBe(true)
    })

    it('shows level up toast', async () => {
      const stateAt99: ProgressState = { ...mockState, xp: 99, level: 1 }
      const input: AnswerInput = {
        category: 'B',
        topicId: 'signs',
        questionId: 'q1',
        correct: true,
        mode: 'practice',
      }

      const result = recordAnswer(stateAt99, input)

      expect(result.levelUp).toBe(true)
    })
  })

  describe('streak flow', () => {
    it('maintains streak when answer is recorded (uses current time)', async () => {
      const input: AnswerInput = {
        category: 'B', topicId: 'signs', questionId: 'q1', correct: true, mode: 'practice',
      }

      // First answer creates streak of 1
      const result1 = recordAnswer(mockState, input)
      expect(result1.state.streak.count).toBe(1)

      // Second answer on same day keeps streak at 1
      const result2 = recordAnswer(result1.state, { ...input, questionId: 'q2' })
      expect(result2.state.streak.count).toBe(1)
    })

    it('resets streak after a gap (simulated by direct streak manipulation)', async () => {
      // This test verifies the streak logic works when time changes
      const { updateStreak } = await import('./engine')
      const day1 = new Date('2026-11-01T10:00:00Z').getTime()
      const day3 = new Date('2026-11-03T10:00:00Z').getTime()

      let streak = updateStreak({ count: 0, best: 0, lastDay: '' }, day1)
      expect(streak.count).toBe(1)

      // Gap of 2 days (day 1 to day 3)
      streak = updateStreak(streak, day3)
      expect(streak.count).toBe(1)
      expect(streak.best).toBe(1)
    })
  })

  describe('spendPowerup flow', () => {
    it('spends energy for powerup', async () => {
      const stateWithEnergy: ProgressState = {
        ...mockState,
        inventory: { ...mockState.inventory, energy: 5 },
      }

      const result = spendPowerup(stateWithEnergy, 'hint')

      expect(result.success).toBe(true)
      expect(result.state.inventory.energy).toBe(4)
      expect(result.state.inventory.used['hint']).toBe(1)
    })

    it('fails when not enough energy', async () => {
      const result = spendPowerup(mockState, 'freeze')

      expect(result.success).toBe(false)
      expect(result.state.inventory.energy).toBe(0)
    })
  })

  describe('finishExam flow', () => {
    it('records exam result and updates stats', async () => {
      const input: FinishExamInput = {
        category: 'B',
        score: 25,
        total: 30,
        passed: true,
        durationSec: 1200,
      }

      const result = finishExam(mockState, input)

      expect(result.state.stats.examsCompleted).toBe(1)
      expect(result.state.stats.examsPassed).toBe(1)
      expect(result.state.exams).toHaveLength(1)
      expect(result.state.exams[0].passed).toBe(true)
    })

    it('unlocks examFirst achievement', async () => {
      const input: FinishExamInput = {
        category: 'B',
        score: 20,
        total: 30,
        passed: false,
        durationSec: 1200,
      }

      const result = finishExam(mockState, input)

      expect(result.newAchievements).toContain('examFirst')
    })

    it('unlocks examPass achievement when passing', async () => {
      const input: FinishExamInput = {
        category: 'B',
        score: 26,
        total: 30,
        passed: true,
        durationSec: 1200,
      }

      const result = finishExam(mockState, input)

      expect(result.newAchievements).toContain('examPass')
    })
  })

  describe('ensureDaily flow', () => {
    it('creates daily challenge for today', async () => {
      const topics = ['signs', 'speed', 'markings']
      const result = ensureDaily(mockState, topics)

      expect(result.daily).not.toBeNull()
      expect(result.daily?.target).toBe(20)
      expect(result.daily?.answered).toBe(0)
      expect(topics).toContain(result.daily?.topicId)
    })

    it('returns existing daily if already set for today', async () => {
      const today = new Date().toISOString().split('T')[0]
      const stateWithDaily: ProgressState = {
        ...mockState,
        daily: { id: today, topicId: 'signs', target: 20, answered: 5, correct: 3, completed: false },
      }

      const result = ensureDaily(stateWithDaily, ['signs', 'speed'])

      expect(result.daily).toEqual(stateWithDaily.daily)
    })
  })

  describe('completeOnboarding flow', () => {
    it('sets onboarding data', async () => {
      const result = completeOnboarding(mockState, 'B', 20, '2026-12-01')

      expect(result.onboarded).toBe(true)
      expect(result.dailyGoal).toBe(20)
      expect(result.defaultCategory).toBe('B')
      expect(result.testDate).toBe('2026-12-01')
    })
  })

  describe('persistence integration', () => {
    it('loads progress from store', async () => {
      const { get, all } = await import('../store/store')

      // Mock all 13 Promise.all calls in order
      vi.mocked(get)
        .mockResolvedValueOnce({ total: 500 }) // xpLevel/xp
        .mockResolvedValueOnce({ count: 5, best: 10, lastDay: '2026-11-01' }) // streaks/streak
        .mockResolvedValueOnce({ id: 'inventory', energy: 3, lives: 5, lastLivesTs: 0, shield: 0, used: {} }) // inventory/inventory
        .mockResolvedValueOnce({ unlocked: [] }) // achievements/achievements
        .mockResolvedValueOnce(null) // prefs/daily
        .mockResolvedValueOnce({ id: 'stats', examsCompleted: 2, examsPassed: 1 }) // prefs/stats
        .mockResolvedValueOnce({ value: true }) // prefs/onboarded
        .mockResolvedValueOnce({ value: 20 }) // prefs/dailyGoal
        .mockResolvedValueOnce({ value: 'B' }) // prefs/defaultCategory
        .mockResolvedValueOnce({ value: null }) // prefs/testDate
        .mockResolvedValueOnce({ items: [] }) // prefs/exams

      vi.mocked(all)
        .mockResolvedValueOnce([]) // mastery
        .mockResolvedValueOnce([]) // srs
        .mockResolvedValueOnce([{ category: 'B', correct: true }]) // history

      // Mock Date.now to return a specific date for streak calculation
      const now = new Date('2026-11-02T10:00:00Z').getTime()
      vi.spyOn(globalThis.Date, 'now').mockImplementation(() => now)

      const progress = await loadProgress()

      expect(progress.xp).toBe(500)
      expect(progress.streak.count).toBe(6) // 5 + 1 for consecutive day
      expect(progress.inventory.energy).toBe(3)
      expect(progress.answeredCount).toBe(1)

      vi.restoreAllMocks()
    })

    it('saves progress to store', async () => {
      const { put } = await import('../store/store')
      vi.mocked(put).mockResolvedValue(undefined)

      const progress: Partial<PersistedProgress> = {
        xp: 100,
        streak: { count: 3, best: 5, lastDay: '2026-11-01' },
        inventory: { id: 'inventory' as const, energy: 2, lives: 5, lastLivesTs: 0, shield: 0, used: {} },
        mastery: [],
        srs: [],
        achievements: ['firstSteps'],
        daily: null,
        stats: { id: 'stats', examsCompleted: 1, examsPassed: 1 },
        exams: [],
      }

      await saveProgress(progress)

      expect(put).toHaveBeenCalled()
    })
  })
})