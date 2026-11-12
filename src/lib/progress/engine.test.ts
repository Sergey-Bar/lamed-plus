import { describe, expect, it } from 'vitest'
import { GAME } from './config'
import {
  answerIsCorrect,
  computeLevel,
  dailyTopic,
  masteryKey,
  nextSrs,
  readyCheck,
  refillLives,
  todayKey,
  updateStreak,
  weakestTopic,
  xpForCorrect,
} from './engine'

describe('progress engine', () => {
  describe('computeLevel', () => {
    it('computes level from XP thresholds', () => {
      expect(computeLevel(0)).toBe(1)
      expect(computeLevel(99)).toBe(1)
      expect(computeLevel(100)).toBe(2)
      expect(computeLevel(300)).toBe(3)
      expect(computeLevel(600)).toBe(4)
      expect(computeLevel(1000)).toBe(5)
      expect(computeLevel(1001)).toBe(5)
      expect(computeLevel(999999)).toBe(5)
    })
  })

  describe('xpForCorrect', () => {
    it('applies streak multiplier at day 7+', () => {
      expect(xpForCorrect(0)).toBe(GAME.xpPerCorrect)
      expect(xpForCorrect(6)).toBe(GAME.xpPerCorrect)
      expect(xpForCorrect(7)).toBe(15)
      expect(xpForCorrect(30)).toBe(15)
    })

    it('handles negative streak gracefully', () => {
      expect(xpForCorrect(-1)).toBe(GAME.xpPerCorrect)
    })
  })

  describe('nextSrs', () => {
    it('advances SRS intervals and resets on miss', () => {
      expect(nextSrs(1, true)).toBe(3)
      expect(nextSrs(3, true)).toBe(7)
      expect(nextSrs(7, true)).toBe(14)
      expect(nextSrs(14, true)).toBe(30)
      expect(nextSrs(30, true)).toBe(60)
      expect(nextSrs(60, true)).toBe(60)
      expect(nextSrs(1, false)).toBe(1)
      expect(nextSrs(60, false)).toBe(1)
    })

    it('handles unknown intervals by moving to the next larger step', () => {
      expect(nextSrs(5, true)).toBe(7)
      expect(nextSrs(100, true)).toBe(60)
    })
  })

  describe('todayKey', () => {
    it('formats YYYY-MM-DD correctly', () => {
      expect(todayKey(Date.parse('2026-11-09T12:00:00Z'))).toBe('2026-11-09')
      expect(todayKey(Date.parse('2026-01-01T12:00:00Z'))).toBe('2026-01-01')
      expect(todayKey(Date.parse('2026-12-31T12:00:00Z'))).toBe('2026-12-31')
    })

    it('handles different times on same day consistently', () => {
      // Same day, different times
      const morning = Date.parse('2026-11-09T06:00:00Z')
      const evening = Date.parse('2026-11-09T18:00:00Z')
      expect(todayKey(morning)).toBe(todayKey(evening))
    })
  })

  describe('masteryKey', () => {
    it('creates composite keys', () => {
      expect(masteryKey('B', 'signs')).toBe('B:signs')
      expect(masteryKey('C1', 'traffic')).toBe('C1:traffic')
    })
  })

  describe('updateStreak', () => {
    it('updates streak across consecutive days and resets on a gap', () => {
      const day1 = updateStreak({ count: 0, best: 0, lastDay: '' }, Date.parse('2026-11-01T10:00:00Z'))
      expect(day1.count).toBe(1)
      const day2 = updateStreak(day1, Date.parse('2026-11-02T10:00:00Z'))
      expect(day2.count).toBe(2)
      const gap = updateStreak(day2, Date.parse('2026-11-09T10:00:00Z'))
      expect(gap.count).toBe(1)
      expect(gap.best).toBe(2)
    })

    it('keeps streak unchanged on the same day', () => {
      const day = Date.parse('2026-11-02T10:00:00Z')
      const first = updateStreak({ count: 0, best: 0, lastDay: '' }, day)
      expect(first.count).toBe(1)
      const same = updateStreak(first, Date.parse('2026-11-02T14:00:00Z'))
      expect(same.count).toBe(1)
      expect(same.lastDay).toBe(first.lastDay)
    })

    it('handles first day correctly', () => {
      const day = Date.parse('2026-11-01T10:00:00Z')
      const first = updateStreak({ count: 0, best: 0, lastDay: '' }, day)
      expect(first.count).toBe(1)
      expect(first.best).toBe(1)
    })

    it('preserves best streak across resets', () => {
      let streak = { count: 0, best: 5, lastDay: '' }
      streak = updateStreak(streak, Date.parse('2026-11-01T10:00:00Z'))
      expect(streak.count).toBe(1)
      expect(streak.best).toBe(5)
    })
  })

  describe('refillLives', () => {
    it('refills lives over time and caps at max', () => {
      const base = { lives: 2, lastLivesTs: Date.parse('2026-11-01T00:00:00Z') }
      const later = refillLives(base, Date.parse('2026-11-01T01:30:00Z'))
      expect(later.lives).toBe(5)
      expect(later.lastLivesTs).toBe(Date.parse('2026-11-01T01:30:00Z'))
    })

    it('does not exceed max lives', () => {
      const base = { lives: 5, lastLivesTs: Date.parse('2026-11-01T00:00:00Z') }
      const later = refillLives(base, Date.parse('2026-11-02T00:00:00Z'))
      expect(later.lives).toBe(5)
    })

    it('calculates partial refill correctly', () => {
      const base = { lives: 3, lastLivesTs: Date.parse('2026-11-01T00:00:00Z') }
      const later = refillLives(base, Date.parse('2026-11-01T00:30:00Z'))
      expect(later.lives).toBe(4)
    })

    it('handles zero elapsed time', () => {
      const base = { lives: 2, lastLivesTs: Date.parse('2026-11-01T00:00:00Z') }
      const same = refillLives(base, Date.parse('2026-11-01T00:00:00Z'))
      expect(same.lives).toBe(2)
      expect(same.lastLivesTs).toBe(base.lastLivesTs)
    })
  })

  describe('readyCheck', () => {
    it('recommends readiness with enough accurate samples', () => {
      const good = Array.from({ length: 30 }, () => ({
        correct: true,
        ts: 1000,
      }))
      const result = readyCheck({ answers: good, passRate: 0.86 })
      expect(result.sample).toBe(30)
      expect(result.recommended).toBe(true)

      const few = readyCheck({ answers: good.slice(0, 3), passRate: 0.86 })
      expect(few.sample).toBe(3)
      expect(few.recommended).toBe(false)

      const poor = Array.from({ length: 30 }, (_, i) => ({
        correct: i % 3 === 0,
        ts: 1000 + i,
      }))
      expect(readyCheck({ answers: poor, passRate: 0.86 }).recommended).toBe(false)
    })

    it('uses weighted accuracy with recent answers weighted more', () => {
      const answers = [
        { correct: false, ts: 1000 },
        { correct: false, ts: 2000 },
        { correct: true, ts: 3000 },
        { correct: true, ts: 4000 },
        { correct: true, ts: 5000 },
      ]
      const result = readyCheck({ answers, passRate: 0.6, window: 5, minSample: 3 })
      expect(result.sample).toBe(5)
      expect(result.estimatedAccuracy).toBeGreaterThan(0.6)
      expect(result.recommended).toBe(true)
    })

    it('handles empty answers', () => {
      const result = readyCheck({ answers: [], passRate: 0.86 })
      expect(result.sample).toBe(0)
      expect(result.recommended).toBe(false)
    })

    it('respects minSample threshold', () => {
      const answers = Array.from({ length: 10 }, () => ({ correct: true, ts: 1000 }))
      const result = readyCheck({ answers, passRate: 0.86, minSample: 20 })
      expect(result.sample).toBe(10)
      expect(result.recommended).toBe(false)
    })
  })

  describe('weakestTopic', () => {
    it('picks the weakest topic by ratio', () => {
      expect(
        weakestTopic([
          { topicId: 'signs', correct: 9, answered: 10 },
          { topicId: 'speed', correct: 1, answered: 10 },
        ]),
      ).toBe('speed')
      expect(weakestTopic([])).toBeNull()
    })

    it('handles topics with zero answered', () => {
      const topics = [
        { topicId: 'signs', correct: 0, answered: 0 },
        { topicId: 'speed', correct: 5, answered: 10 },
      ]
      expect(weakestTopic(topics)).toBe('speed')
    })

    it('handles ties by returning first', () => {
      const topics = [
        { topicId: 'signs', correct: 5, answered: 10 },
        { topicId: 'speed', correct: 5, answered: 10 },
      ]
      expect(weakestTopic(topics)).toBe('signs')
    })

    it('handles single topic', () => {
      expect(weakestTopic([{ topicId: 'signs', correct: 5, answered: 10 }])).toBe('signs')
    })
  })

  describe('dailyTopic', () => {
    it('is deterministic per day', () => {
      const topics = ['signs', 'speed', 'markings']
      const a = dailyTopic(topics, Date.parse('2026-11-01T12:00:00Z'))
      const b = dailyTopic(topics, Date.parse('2026-11-01T18:00:00Z'))
      expect(a).toBe(b)
      expect(topics).toContain(a)
    })

    it('cycles through topics consistently', () => {
      const topics = ['a', 'b', 'c']
      // Test that consecutive days cycle through topics
      const day1 = Date.parse('2026-06-15T12:00:00Z') // Summer, less likely to have DST issues
      const d1 = dailyTopic(topics, day1)
      const d2 = dailyTopic(topics, day1 + 86400000)
      const d3 = dailyTopic(topics, day1 + 2 * 86400000)
      const d4 = dailyTopic(topics, day1 + 3 * 86400000)
      // Should cycle through all three topics (order may vary by timezone)
      expect(new Set([d1, d2, d3]).size).toBe(3)
      expect(topics).toContain(d1)
      expect(topics).toContain(d2)
      expect(topics).toContain(d3)
      // Fourth day should wrap to first
      expect(d4).toBe(d1)
    })

    it('handles empty array', () => {
      expect(dailyTopic([], Date.now())).toBeNull()
    })

    it('handles single topic', () => {
      expect(dailyTopic(['only'], Date.now())).toBe('only')
    })
  })

  describe('answerIsCorrect', () => {
    it('handles single and multi', () => {
      expect(answerIsCorrect([0], [0])).toBe(true)
      expect(answerIsCorrect([0], [1])).toBe(false)
      expect(answerIsCorrect([0, 1], [1, 0])).toBe(true)
      expect(answerIsCorrect([0, 1], [0])).toBe(false)
    })

    it('handles multi-select correctly', () => {
      expect(answerIsCorrect([0, 2], [0, 2])).toBe(true)
      expect(answerIsCorrect([0, 2], [2, 0])).toBe(true)
      expect(answerIsCorrect([0, 2], [0, 1])).toBe(false)
      expect(answerIsCorrect([0, 2], [0])).toBe(false)
    })

    it('handles empty arrays', () => {
      expect(answerIsCorrect([], [])).toBe(true)
    })
  })
})
