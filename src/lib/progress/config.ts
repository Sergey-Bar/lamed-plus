export const GAME = {
  xpPerCorrect: 10,
  streakMultiplierStartDay: 7,
  streakMultiplier: 1.5,
  xpDailyClear: 50,
  maxLives: 5,
  livesRegenMs: 30 * 60 * 1000,
  energyPerCorrect: 1,
  maxEnergy: 10,
  powerups: {
    hint: 1,
    fifty: 2,
    freeze: 3,
    shield: 2,
  },
  levelThresholds: [100, 300, 600, 1000],
  // Spaced-repetition steps. The final steps matter: without them no card can
  // ever reach the "mastered" threshold shown in Review.
  srsIntervalsDays: [1, 3, 7, 14, 30, 60],
  masteredIntervalDays: 30,
  readyCheck: {
    minSample: 20,
    weightWindow: 50,
  },
  practiceRoundSize: 10,
  practiceTimerSeconds: 120,
} as const

export type PowerupKind = keyof typeof GAME.powerups

export function defaultInventory(now: number) {
  return {
    id: 'inventory' as const,
    energy: 0,
    lives: GAME.maxLives,
    lastLivesTs: now,
    shield: 0,
    used: {},
  }
}
