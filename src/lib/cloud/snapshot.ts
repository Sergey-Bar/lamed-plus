import type { ProgressState } from '../progress/context'
import type { ExamRecord, StatsRecord } from '../progress/context'
import type { AchievementId, DailyRecord, InventoryRecord, MasteryRecord, SrsRecord } from '../progress/types'
import type { StreakState } from '../progress/engine'
import {
  saveDailyGoal,
  saveDefaultCategory,
  saveDisplayName,
  saveLessons,
  saveProgress,
  saveStudyStage,
  saveTestDate,
} from '../progress/persistence'

/** Everything that is worth carrying between devices. The answer history and the
 * daily queue stay local; they rebuild themselves from the counters. */
export interface Snapshot {
  version: 1
  updatedAt: number
  onboarded: boolean
  displayName: string
  studyStage: string
  lessons: string[]
  dailyGoal: number
  defaultCategory: string
  testDate: string | null
  xp: number
  streak: StreakState
  inventory: InventoryRecord
  mastery: MasteryRecord[]
  srs: SrsRecord[]
  achievements: AchievementId[]
  daily: DailyRecord | null
  stats: StatsRecord
  exams: ExamRecord[]
  answeredCount: number
}

export function buildSnapshot(state: ProgressState, now = Date.now()): Snapshot {
  return {
    version: 1,
    updatedAt: now,
    onboarded: state.onboarded,
    displayName: state.displayName,
    studyStage: state.studyStage,
    lessons: [...state.lessons],
    dailyGoal: state.dailyGoal,
    defaultCategory: state.defaultCategory,
    testDate: state.testDate,
    xp: state.xp,
    streak: { ...state.streak },
    inventory: { ...state.inventory, used: { ...state.inventory.used } },
    mastery: Object.values(state.mastery).map((record) => ({ ...record })),
    srs: Object.values(state.srs).map((record) => ({ ...record })),
    achievements: [...state.achievements],
    daily: state.daily ? { ...state.daily } : null,
    stats: { ...state.stats },
    exams: state.exams.map((exam) => ({ ...exam })),
    answeredCount: state.answeredCount,
  }
}

/** Writes a snapshot into IndexedDB; the caller reloads so the app boots from it. */
export async function writeSnapshot(snapshot: Snapshot): Promise<void> {
  await saveProgress({
    xp: snapshot.xp,
    streak: snapshot.streak,
    inventory: snapshot.inventory,
    mastery: snapshot.mastery,
    srs: snapshot.srs,
    achievements: snapshot.achievements,
    daily: snapshot.daily,
    stats: snapshot.stats,
    exams: snapshot.exams,
  })
  await Promise.all([
    saveLessons(snapshot.lessons),
    saveDailyGoal(snapshot.dailyGoal),
    saveDefaultCategory(snapshot.defaultCategory),
    saveTestDate(snapshot.testDate),
    saveDisplayName(snapshot.displayName),
    saveStudyStage(snapshot.studyStage),
  ])
}
