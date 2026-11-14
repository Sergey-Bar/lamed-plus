import { describe, expect, it } from 'vitest'
import { GAME, defaultInventory } from './config'
import type { PowerupKind } from './config'

describe('progress config', () => {
  describe('GAME constants', () => {
    it('has correct XP values', () => {
      expect(GAME.xpPerCorrect).toBe(10)
      expect(GAME.xpDailyClear).toBe(50)
    })

    it('has correct streak settings', () => {
      expect(GAME.streakMultiplierStartDay).toBe(7)
      expect(GAME.streakMultiplier).toBe(1.5)
    })

    it('has correct lives settings', () => {
      expect(GAME.maxLives).toBe(5)
      expect(GAME.livesRegenMs).toBe(30 * 60 * 1000)
    })

    it('has correct energy settings', () => {
      expect(GAME.energyPerCorrect).toBe(1)
      expect(GAME.maxEnergy).toBe(10)
    })

    it('has correct powerup costs', () => {
      expect(GAME.powerups.hint).toBe(1)
      expect(GAME.powerups.fifty).toBe(2)
      expect(GAME.powerups.freeze).toBe(3)
      expect(GAME.powerups.shield).toBe(2)
    })

    it('has correct level thresholds', () => {
      expect(GAME.levelThresholds).toEqual([100, 300, 600, 1000])
    })

    it('has correct SRS intervals', () => {
      expect(GAME.srsIntervalsDays).toEqual([1, 3, 7, 14, 30, 60])
      expect(GAME.masteredIntervalDays).toBe(30)
      expect(GAME.srsIntervalsDays).toContain(GAME.masteredIntervalDays)
    })

    it('has correct ready check settings', () => {
      expect(GAME.readyCheck.minSample).toBe(20)
      expect(GAME.readyCheck.weightWindow).toBe(50)
    })

    it('has correct practice settings', () => {
      expect(GAME.practiceRoundSize).toBe(10)
    })
  })

  describe('PowerupKind type', () => {
    it('includes all powerup keys', () => {
      const powerups: PowerupKind[] = ['hint', 'fifty', 'freeze', 'shield']
      expect(powerups).toHaveLength(4)
    })
  })

  describe('defaultInventory', () => {
    it('creates inventory with correct defaults', () => {
      const now = 1000000
      const inv = defaultInventory(now)
      expect(inv.id).toBe('inventory')
      expect(inv.energy).toBe(0)
      expect(inv.lives).toBe(GAME.maxLives)
      expect(inv.lastLivesTs).toBe(now)
      expect(inv.shield).toBe(0)
      expect(inv.used).toEqual({})
    })
  })
})