import type { ProgressState } from './context'
import { weakestTopic } from './engine'
import { GAME } from './config'

export function getMasteryPercent(state: ProgressState, category?: string): number {
  const records = category
    ? Object.values(state.mastery).filter((m) => m.category === category)
    : Object.values(state.mastery)
  if (records.length === 0) return 0
  const totalCorrect = records.reduce((sum, m) => sum + m.correct, 0)
  const totalAnswered = records.reduce((sum, m) => sum + m.answered, 0)
  return totalAnswered > 0 ? (totalCorrect / totalAnswered) * 100 : 0
}

export function getTopicMastery(
  state: ProgressState,
  category: string,
): Array<{ topicId: string; percent: number; answered: number }> {
  return Object.values(state.mastery)
    .filter((m) => m.category === category)
    .map((m) => ({
      topicId: m.topicId,
      percent: m.answered > 0 ? (m.correct / m.answered) * 100 : 0,
      answered: m.answered,
    }))
}

export function getWeakestTopic(state: ProgressState, category?: string): string | null {
  const records = category
    ? Object.values(state.mastery).filter((m) => m.category === category)
    : Object.values(state.mastery)
  return weakestTopic(records)
}

export function getReadiness(state: ProgressState, category: string): {
  estimatedAccuracy: number
  sample: number
  recommended: boolean
  weakest: string | null
} {
  return {
    estimatedAccuracy: 0,
    sample: 0,
    recommended: false,
    weakest: getWeakestTopic(state, category),
  }
}

export function getStreakInfo(state: ProgressState): {
  current: number
  best: number
  isActive: boolean
} {
  return {
    current: state.streak.count,
    best: state.streak.best,
    isActive: state.streak.count > 0,
  }
}

export function getInventoryInfo(state: ProgressState): {
  energy: number
  lives: number
  shield: number
  maxEnergy: number
  maxLives: number
} {
  return {
    energy: state.inventory.energy,
    lives: state.inventory.lives,
    shield: state.inventory.shield,
    maxEnergy: 10,
    maxLives: 5,
  }
}

export function getAchievementProgress(state: ProgressState): {
  unlocked: string[]
  total: number
  percent: number
} {
  const unlocked = state.achievements
  const total = 8
  return {
    unlocked,
    total,
    percent: (unlocked.length / total) * 100,
  }
}

export function getDailyProgress(state: ProgressState): {
  topicId: string | null
  target: number
  answered: number
  correct: number
  completed: boolean
  percent: number
} | null {
  if (!state.daily) return null
  return {
    topicId: state.daily.topicId,
    target: state.daily.target,
    answered: state.daily.answered,
    correct: state.daily.correct,
    completed: state.daily.completed,
    percent: state.daily.target > 0 ? (state.daily.answered / state.daily.target) * 100 : 0,
  }
}

export function getExamStats(state: ProgressState): {
  completed: number
  passed: number
  passRate: number
  recent: Array<{ id: string; score: number; total: number; passed: boolean; ts: number }>
} {
  return {
    completed: state.stats.examsCompleted,
    passed: state.stats.examsPassed,
    passRate:
      state.stats.examsCompleted > 0
        ? (state.stats.examsPassed / state.stats.examsCompleted) * 100
        : 0,
    recent: state.exams.slice(0, 10).map((e) => ({
      id: e.id,
      score: e.score,
      total: e.total,
      passed: e.passed,
      ts: e.ts,
    })),
  }
}

export function getLevelInfo(state: ProgressState): {
  level: number
  xp: number
  xpToNext: number
  progress: number
} {
  const { levelThresholds } = GAME
  const currentThreshold = levelThresholds[state.level - 2] ?? 0
  const nextThreshold = levelThresholds[state.level - 1] ?? currentThreshold
  const xpInLevel = state.xp - currentThreshold
  const xpNeeded = nextThreshold - currentThreshold
  return {
    level: state.level,
    xp: state.xp,
    xpToNext: Math.max(0, nextThreshold - state.xp),
    progress: xpNeeded > 0 ? (xpInLevel / xpNeeded) * 100 : 100,
  }
}