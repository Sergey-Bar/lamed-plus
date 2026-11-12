import { GAME } from './config'

export function computeLevel(totalXp: number): number {
  let level = 1
  for (const threshold of GAME.levelThresholds) {
    if (totalXp >= threshold) level++
  }
  return level
}

export function xpForCorrect(streakCount: number): number {
  const multiplier =
    streakCount >= GAME.streakMultiplierStartDay ? GAME.streakMultiplier : 1
  return Math.round(GAME.xpPerCorrect * multiplier)
}

export function nextSrs(currentIntervalDays: number, correct: boolean): number {
  if (!correct) return 1
  const intervals: number[] = [...GAME.srsIntervalsDays]
  const index = intervals.indexOf(currentIntervalDays)
  if (index >= 0) return intervals[Math.min(index + 1, intervals.length - 1)]
  // Intervals written by an older schedule may not exist any more. Move to the
  // next larger step instead of jumping straight to the maximum.
  return intervals.find((value) => value > currentIntervalDays) ?? intervals[intervals.length - 1]
}

export function isMastered(intervalDays: number): boolean {
  return intervalDays >= GAME.masteredIntervalDays
}

export function todayKey(ts = Date.now()): string {
  const date = new Date(ts)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export interface StreakState {
  count: number
  best: number
  lastDay: string
}

export function updateStreak(
  prev: StreakState,
  nowTs = Date.now(),
): StreakState {
  const key = todayKey(nowTs)
  let { count } = prev
  if (prev.lastDay !== key) {
    if (prev.lastDay) {
      const prevTime = new Date(`${prev.lastDay}T00:00:00Z`).getTime()
      const curTime = new Date(`${key}T00:00:00Z`).getTime()
      const diffDays = Math.round((curTime - prevTime) / 86400000)
      count = diffDays === 1 ? count + 1 : 1
    } else {
      count = 1
    }
  }
  return { count, lastDay: key, best: Math.max(prev.best, count) }
}

export interface LivesState {
  lives: number
  lastLivesTs: number
}

export function refillLives(prev: LivesState, nowTs = Date.now()): LivesState {
  if (prev.lives >= GAME.maxLives) {
    return { lives: GAME.maxLives, lastLivesTs: nowTs }
  }
  const gained = Math.floor((nowTs - prev.lastLivesTs) / GAME.livesRegenMs)
  const lives = Math.min(GAME.maxLives, prev.lives + gained)
  if (lives >= GAME.maxLives) return { lives, lastLivesTs: nowTs }
  return { lives, lastLivesTs: prev.lastLivesTs + gained * GAME.livesRegenMs }
}

export interface ReadyInput {
  answers: Array<{ correct: boolean; ts: number }>
  passRate: number
  minSample?: number
  window?: number
}

export interface ReadyResult {
  estimatedAccuracy: number
  sample: number
  recommended: boolean
}

export function readyCheck(input: ReadyInput): ReadyResult {
  const windowSize = input.window ?? GAME.readyCheck.weightWindow
  const minSample = input.minSample ?? GAME.readyCheck.minSample
  const recent = input.answers.slice(-windowSize)
  const weights = recent.map((_, i) => i + 1)
  const weightSum = weights.reduce((sum, w) => sum + w, 0)
  const scored = recent.reduce(
    (sum, answer, i) => sum + (answer.correct ? weights[i] : 0),
    0,
  )
  const estimatedAccuracy = weightSum > 0 ? scored / weightSum : 0
  const sample = recent.length
  const recommended = sample >= minSample && estimatedAccuracy >= input.passRate
  return { estimatedAccuracy, sample, recommended }
}

export function weakestTopic(
  mastery: Array<{ topicId: string; correct: number; answered: number }>,
): string | null {
  const scored = mastery.filter((m) => m.answered > 0)
  if (scored.length === 0) return null
  const ratios = scored.map((m) => ({
    topicId: m.topicId,
    ratio: m.correct / m.answered,
  }))
  ratios.sort((a, b) => a.ratio - b.ratio)
  return ratios[0].topicId
}

export function dailyTopic(topicIds: string[], ts = Date.now()): string | null {
  if (topicIds.length === 0) return null
  const start = new Date(ts)
  const startOfYear = new Date(start.getFullYear(), 0, 0)
  const dayOfYear = Math.floor(
    (start.getTime() - startOfYear.getTime()) / 86400000,
  )
  return topicIds[dayOfYear % topicIds.length]
}

export function masteryKey(category: string, topicId: string): string {
  return `${category}:${topicId}`
}

export function answerIsCorrect(
  correctIndexes: number[],
  selected: number[],
): boolean {
  if (selected.length !== correctIndexes.length) return false
  const sortedSelected = [...selected].sort((a, b) => a - b)
  const sortedCorrect = [...correctIndexes].sort((a, b) => a - b)
  return sortedSelected.every((value, i) => value === sortedCorrect[i])
}

export { GAME } from './config'
export { defaultInventory } from './config'
