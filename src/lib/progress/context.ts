import { createContext } from 'react'
import type { PowerupKind } from './config'
import type { ReadyResult, StreakState } from './engine'
import type {
  AchievementId,
  DailyRecord,
  InventoryRecord,
  MasteryRecord,
  SrsRecord,
} from './types'
import { GAME } from './config'

export type { PowerupKind } from './config'

export interface StatsRecord {
  id: 'stats'
  examsCompleted: number
  examsPassed: number
}

export interface ExamRecord {
  id: string
  category: string
  ts: number
  score: number
  total: number
  passed: boolean
  durationSec: number
}

export interface FinishExamInput {
  category: string
  score: number
  total: number
  passed: boolean
  durationSec: number
}

export interface ProgressState {
  ready: boolean
  onboarded: boolean
  displayName: string
  studyStage: string
  lessons: string[]
  dailyGoal: number
  defaultCategory: string
  testDate: string | null
  xp: number
  level: number
  streak: StreakState
  inventory: InventoryRecord
  mastery: Record<string, MasteryRecord>
  srs: Record<string, SrsRecord>
  achievements: AchievementId[]
  daily: DailyRecord | null
  stats: StatsRecord
  exams: ExamRecord[]
  answeredCount: number
}

export interface AnswerInput {
  category: string
  topicId: string
  questionId: string
  correct: boolean
  mode: 'study' | 'practice' | 'review' | 'exam' | 'game'
  perfectRound?: boolean
  shielded?: boolean
}

export interface ProgressApi extends ProgressState {
  recordAnswer: (input: AnswerInput) => void
  spendPowerup: (kind: PowerupKind) => Promise<boolean>
  loseLife: () => Promise<{ lives: number; shielded: boolean }>
  finishExam: (input: FinishExamInput) => void
  ensureDaily: (topics: string[]) => void
  completeOnboarding: (
    category: string,
    goal: number,
    testDate?: string | null,
    displayName?: string,
    studyStage?: string,
  ) => void
  completeLesson: (lessonId: string) => void
  setDisplayName: (name: string) => void
  setStudyStage: (stage: string) => void
  setDailyGoal: (goal: number) => void
  setDefaultCategory: (category: string) => void
  setTestDate: (date: string | null) => void
  getReadyInfo: (category: string) => Promise<ReadyResult & { weakest: string | null }>
}

export const ProgressContext = createContext<ProgressApi | null>(null)

export function defaultState(): ProgressState {
  const DEFAULT_STREAK: StreakState = { count: 0, best: 0, lastDay: '' }

  function defaultInventory(now: number): InventoryRecord {
    return {
      id: 'inventory',
      energy: 0,
      lives: GAME.maxLives,
      lastLivesTs: now,
      shield: 0,
      used: {},
    }
  }

  return {
    ready: false,
    onboarded: false,
    displayName: '',
    studyStage: 'starting',
    lessons: [],
    dailyGoal: 20,
    defaultCategory: 'B',
    testDate: null,
    xp: 0,
    level: 1,
    streak: { ...DEFAULT_STREAK },
    inventory: defaultInventory(Date.now()),
    mastery: {},
    srs: {},
    achievements: [],
    daily: null,
    stats: { id: 'stats', examsCompleted: 0, examsPassed: 0 },
    exams: [],
    answeredCount: 0,
  }
}
