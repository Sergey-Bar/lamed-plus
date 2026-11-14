import type {
  ProgressState,
  AnswerInput,
  FinishExamInput,
  PowerupKind,
} from './context'
import type { MasteryRecord, SrsRecord, DailyRecord, InventoryRecord } from './types'
import type { ReadyResult } from './engine'
import {
  computeLevel,
  xpForCorrect,
  nextSrs,
  todayKey,
  updateStreak,
  refillLives,
  weakestTopic,
  masteryKey,
  dailyTopic,
  GAME,
} from './engine'
import { newlyUnlocked } from './achievements'

export interface RecordAnswerResult {
  state: ProgressState
  newAchievements: string[]
  dailyCompleted: boolean
  levelUp: boolean
}

export function recordAnswer(
  prev: ProgressState,
  input: AnswerInput,
): RecordAnswerResult {
  if (!prev.ready) {
    return { state: prev, newAchievements: [], dailyCompleted: false, levelUp: false }
  }

  const now = Date.now()
  const key = todayKey(now)

  const streak = updateStreak(prev.streak, now)
  const inventory: InventoryRecord = {
    ...prev.inventory,
    ...refillLives(prev.inventory, now),
  }

  const gain = xpForCorrect(streak.count)
  let xp = prev.xp + (input.correct ? gain : 0)

  if (input.correct && inventory.energy < GAME.maxEnergy) {
    inventory.energy += GAME.energyPerCorrect
  }

  // Practice is deliberately forgiving: the setup screen promises "no lives".
  // Lives and shields therefore only change through game surfaces, never here.

  const mkey = masteryKey(input.category, input.topicId)
  const prevMastery = prev.mastery[mkey] ?? {
    id: mkey,
    category: input.category,
    topicId: input.topicId,
    correct: 0,
    answered: 0,
  }
  const mastery: Record<string, MasteryRecord> = {
    ...prev.mastery,
    [mkey]: {
      ...prevMastery,
      answered: prevMastery.answered + 1,
      correct: prevMastery.correct + (input.correct ? 1 : 0),
    },
  }

  const prevSrs = prev.srs[input.questionId]
  const interval = prevSrs ? nextSrs(prevSrs.intervalDays, input.correct) : 1
  const srs: Record<string, SrsRecord> = {
    ...prev.srs,
    [input.questionId]: {
      id: input.questionId,
      intervalDays: interval,
      dueTs: now + interval * 86400000,
      lapses: prevSrs
        ? prevSrs.lapses + (input.correct ? 0 : 1)
        : input.correct
        ? 0
        : 1,
      lastSeenTs: now,
    },
  }

  let daily = prev.daily
  let bonus = 0
  if (daily && daily.id === key && (!daily.topicId || daily.topicId === input.topicId)) {
    const answered = daily.answered + 1
    const correct = daily.correct + (input.correct ? 1 : 0)
    const completed = answered >= daily.target
    if (!daily.completed && completed) bonus = GAME.xpDailyClear
    daily = { ...daily, answered, correct, completed }
  }
  xp += bonus

  const answeredEvents = prev.answeredCount + 1
  const newAch = newlyUnlocked(prev.achievements, {
    answeredEvents,
    streak,
    mastery: Object.values(mastery),
    examsCompleted: prev.stats.examsCompleted,
    examsPassed: prev.stats.examsPassed,
    perfectRound: !!input.perfectRound,
  })
  const achievements = [...prev.achievements, ...newAch]

  const next: ProgressState = {
    ...prev,
    xp,
    level: computeLevel(xp),
    streak,
    inventory,
    mastery,
    srs,
    daily,
    achievements,
    answeredCount: answeredEvents,
  }

  return {
    state: next,
    newAchievements: newAch,
    dailyCompleted: !!daily?.completed && !prev.daily?.completed,
    levelUp: next.level > prev.level,
  }
}

export function spendPowerup(
  prev: ProgressState,
  kind: PowerupKind,
): { state: ProgressState; success: boolean } {
  const cost = GAME.powerups[kind]
  if (!prev.ready || prev.inventory.energy < cost) {
    return { state: prev, success: false }
  }
  // Buying a shield stores it as a charge; the next wrong answer in a game
  // consumes the charge instead of a life.
  const shield =
    kind === 'shield'
      ? Math.min(GAME.maxShield, prev.inventory.shield + 1)
      : prev.inventory.shield
  const inventory: InventoryRecord = {
    ...prev.inventory,
    energy: prev.inventory.energy - cost,
    shield,
    used: { ...prev.inventory.used, [kind]: (prev.inventory.used[kind] ?? 0) + 1 },
  }
  return { state: { ...prev, inventory }, success: true }
}

export interface LoseLifeResult {
  state: ProgressState
  lives: number
  shielded: boolean
}

/**
 * Spend a life in a game round. A shield charge absorbs the hit instead.
 * Lives regenerate over time, so the timestamp is preserved when possible.
 */
export function loseLife(prev: ProgressState): LoseLifeResult {
  if (!prev.ready) {
    return { state: prev, lives: prev.inventory.lives, shielded: false }
  }
  const now = Date.now()
  const refilled: InventoryRecord = {
    ...prev.inventory,
    ...refillLives(prev.inventory, now),
  }

  if (refilled.shield > 0) {
    return {
      state: { ...prev, inventory: { ...refilled, shield: refilled.shield - 1 } },
      lives: refilled.lives,
      shielded: true,
    }
  }

  const lives = Math.max(0, refilled.lives - 1)
  return {
    state: { ...prev, inventory: { ...refilled, lives } },
    lives,
    shielded: false,
  }
}

export interface FinishExamResult {
  state: ProgressState
  newAchievements: string[]
}

export function finishExam(
  prev: ProgressState,
  input: FinishExamInput,
): FinishExamResult {
  if (!prev.ready) return { state: prev, newAchievements: [] }

  const now = Date.now()
  const stats = {
    id: 'stats' as const,
    examsCompleted: prev.stats.examsCompleted + 1,
    examsPassed: prev.stats.examsPassed + (input.passed ? 1 : 0),
  }
  const record: import('./context').ExamRecord = {
    id: `exam-${now}-${Math.random().toString(36).slice(2, 8)}`,
    category: input.category,
    ts: now,
    score: input.score,
    total: input.total,
    passed: input.passed,
    durationSec: input.durationSec,
  }
  const exams = [record, ...prev.exams].slice(0, 50)

  const newAch = newlyUnlocked(prev.achievements, {
    answeredEvents: prev.answeredCount,
    streak: prev.streak,
    mastery: Object.values(prev.mastery),
    examsCompleted: stats.examsCompleted,
    examsPassed: stats.examsPassed,
    perfectRound: false,
  })
  const achievements = [...prev.achievements, ...newAch]

  return {
    state: { ...prev, stats, exams, achievements },
    newAchievements: newAch,
  }
}

export function ensureDaily(
  prev: ProgressState,
  topics: string[],
): { state: ProgressState; daily: DailyRecord | null } {
  const key = todayKey()
  if (prev.daily && prev.daily.id === key && prev.ready) {
    return { state: prev, daily: prev.daily }
  }
  const topicId = dailyTopic(topics)
  const daily: DailyRecord = {
    id: key,
    topicId,
    target: prev.dailyGoal || 20,
    answered: 0,
    correct: 0,
    completed: false,
  }
  return { state: { ...prev, daily }, daily }
}

export function completeOnboarding(
  prev: ProgressState,
  category: string,
  goal: number,
  testDate: string | null,
  displayName = '',
  studyStage = 'starting',
): ProgressState {
  return {
    ...prev,
    onboarded: true,
    dailyGoal: goal,
    defaultCategory: category,
    testDate,
    displayName,
    studyStage,
  }
}

export function completeLesson(prev: ProgressState, lessonId: string): ProgressState {
  if (prev.lessons.includes(lessonId)) return prev
  return { ...prev, lessons: [...prev.lessons, lessonId] }
}

export function setDisplayName(prev: ProgressState, name: string): ProgressState {
  return { ...prev, displayName: name.trim().slice(0, 40) }
}

export function setStudyStage(prev: ProgressState, stage: string): ProgressState {
  return { ...prev, studyStage: stage }
}

export function setDailyGoal(prev: ProgressState, goal: number): ProgressState {
  return { ...prev, dailyGoal: goal }
}

export function setDefaultCategory(prev: ProgressState, category: string): ProgressState {
  return { ...prev, defaultCategory: category }
}

export function setTestDate(prev: ProgressState, date: string | null): ProgressState {
  return { ...prev, testDate: date }
}

export async function getReadyInfo(
  prev: ProgressState,
  category: string,
): Promise<ReadyResult & { weakest: string | null }> {
  const { all } = await import('../store/store')
  const { getCategory } = await import('../content/categories')
  const { readyCheck } = await import('./engine')

  const history = await all<{
    category: string
    correct: boolean
    ts: number
  }>('history')

  const answers = history
    .filter((h) => h.category === category)
    .map((h) => ({ correct: h.correct, ts: h.ts }))

  const cfg = getCategory(category)
  const passRate = cfg ? cfg.passThreshold / cfg.questionCount : 0.86

  const mastery = Object.values(prev.mastery).filter((m) => m.category === category)
  const weakest = weakestTopic(mastery)

  const ready = readyCheck({ answers, passRate })

  return { ...ready, weakest }
}