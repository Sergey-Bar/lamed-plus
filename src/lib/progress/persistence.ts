import { all, get, put, append, trimHistory } from '../store/store'
import type {
  MasteryRecord,
  SrsRecord,
  InventoryRecord,
  DailyRecord,
  AchievementId,
} from './types'
import type { StreakState } from './engine'
import type { StatsRecord, ExamRecord } from './context'
import {
  PREF_DAILY_GOAL,
  PREF_DEFAULT_CATEGORY,
  PREF_EXAMS,
  PREF_LAST_SESSION,
  PREF_ONBOARDED,
  PREF_TEST_DATE,
  PREF_DISPLAY_NAME,
  PREF_STUDY_STAGE,
  PREF_LESSONS,
  PREF_FIRST_SEEN,
} from './onboarding'
import type { LastSession } from './onboarding'

export interface PersistedProgress {
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
  onboarded: boolean
  dailyGoal: number
  defaultCategory: string
  testDate: string | null
  displayName: string
  studyStage: string
  lessons: string[]
  firstSeen: number
}

export async function loadProgress(): Promise<PersistedProgress> {
  const now = Date.now()

  const [
    storedXp,
    streakStored,
    inventoryStored,
    masteryAll,
    srsAll,
    achStored,
    dailyStored,
    statsStored,
    onboarded,
    goalStored,
    defaultCategoryStored,
    testDateStored,
    examsStored,
    history,
  ] = await Promise.all([
    get<{ id: string; total: number }>('xpLevel', 'xp'),
    get<StreakState>('streaks', 'streak'),
    get<InventoryRecord>('inventory', 'inventory'),
    all<MasteryRecord>('mastery'),
    all<SrsRecord>('srs'),
    get<{ unlocked: AchievementId[] }>('achievements', 'achievements'),
    get<DailyRecord>('prefs', 'daily'),
    get<StatsRecord>('prefs', 'stats'),
    get<{ id: string; value: boolean }>('prefs', PREF_ONBOARDED),
    get<{ id: string; value: number }>('prefs', PREF_DAILY_GOAL),
    get<{ id: string; value: string }>('prefs', PREF_DEFAULT_CATEGORY),
    get<{ id: string; value: string | null }>('prefs', PREF_TEST_DATE),
    get<{ id: string; items: ExamRecord[] }>('prefs', PREF_EXAMS),
    all('history'),
  ])

  const [nameStored, stageStored, lessonsStored, firstSeenStored] = await Promise.all([
    get<{ id: string; value: string }>('prefs', PREF_DISPLAY_NAME),
    get<{ id: string; value: string }>('prefs', PREF_STUDY_STAGE),
    get<{ id: string; value: string[] }>('prefs', PREF_LESSONS),
    get<{ id: string; value: number }>('prefs', PREF_FIRST_SEEN),
  ])

  const { updateStreak, refillLives, defaultInventory } = await import('./engine')
  const streak = streakStored
    ? updateStreak(streakStored, now)
    : { count: 0, best: 0, lastDay: '' }
  const baseline = inventoryStored ?? defaultInventory(now)
  const inventory: InventoryRecord = {
    ...baseline,
    ...refillLives(baseline, now),
  }

  return {
    xp: storedXp?.total ?? 0,
    streak,
    inventory,
    mastery: masteryAll,
    srs: srsAll,
    achievements: achStored?.unlocked ?? [],
    daily: dailyStored ?? null,
    stats: statsStored ?? { id: 'stats', examsCompleted: 0, examsPassed: 0 },
    exams: examsStored?.items ?? [],
    answeredCount: history.length,
    onboarded: onboarded?.value ?? false,
    dailyGoal: goalStored?.value ?? 20,
    defaultCategory: defaultCategoryStored?.value ?? 'B',
    testDate: testDateStored?.value ?? null,
    displayName: nameStored?.value ?? '',
    studyStage: stageStored?.value ?? 'starting',
    lessons: lessonsStored?.value ?? [],
    firstSeen: firstSeenStored?.value ?? now,
  }
}

export async function saveProgress(
  progress: Partial<PersistedProgress> & { streak?: StreakState; inventory?: InventoryRecord },
): Promise<void> {
  const updates: Promise<void>[] = []
  if (progress.xp !== undefined) updates.push(put('xpLevel', { id: 'xp', total: progress.xp }))
  if (progress.streak) updates.push(put('streaks', { id: 'streak', ...progress.streak }))
  if (progress.inventory) updates.push(put('inventory', progress.inventory))
  if (progress.mastery) updates.push(...progress.mastery.map((m) => put('mastery', m)))
  if (progress.srs) updates.push(...progress.srs.map((s) => put('srs', s)))
  if (progress.achievements) updates.push(put('achievements', { id: 'achievements', unlocked: progress.achievements }))
  if (progress.daily) updates.push(put('prefs', { ...progress.daily }))
  if (progress.stats) updates.push(put('prefs', { ...progress.stats }))
  if (progress.exams) updates.push(put('prefs', { id: PREF_EXAMS, items: progress.exams }))
  await Promise.all(updates)
}

/** Answer log retention. Large enough for long-term accuracy, small enough
 * that building the readiness report stays fast. */
const HISTORY_LIMIT = 5000
const TRIM_EVERY = 50
let appendsSinceTrim = 0

export async function appendHistory(entry: {
  category: string
  topicId: string
  questionId: string
  correct: boolean
  mode: string
  ts: number
}): Promise<void> {
  await append('history', entry)
  appendsSinceTrim += 1
  if (appendsSinceTrim >= TRIM_EVERY) {
    appendsSinceTrim = 0
    await trimHistory(HISTORY_LIMIT)
  }
}

export async function saveLastSession(session: LastSession): Promise<void> {
  await put('prefs', { id: PREF_LAST_SESSION, ...session })
}

export async function saveOnboarding(
  category: string,
  goal: number,
  testDate: string | null,
  displayName = '',
  studyStage = 'starting',
): Promise<void> {
  await Promise.all([
    put('prefs', { id: PREF_ONBOARDED, value: true }),
    put('prefs', { id: PREF_DAILY_GOAL, value: goal }),
    put('prefs', { id: PREF_DEFAULT_CATEGORY, value: category }),
    put('prefs', { id: PREF_TEST_DATE, value: testDate }),
    put('prefs', { id: PREF_DISPLAY_NAME, value: displayName }),
    put('prefs', { id: PREF_STUDY_STAGE, value: studyStage }),
    put('prefs', { id: PREF_FIRST_SEEN, value: Date.now() }),
  ])
}

export async function saveLessons(lessons: string[]): Promise<void> {
  await put('prefs', { id: PREF_LESSONS, value: lessons })
}

export async function saveDisplayName(name: string): Promise<void> {
  await put('prefs', { id: PREF_DISPLAY_NAME, value: name })
}

export async function saveStudyStage(stage: string): Promise<void> {
  await put('prefs', { id: PREF_STUDY_STAGE, value: stage })
}

export async function saveDailyGoal(goal: number): Promise<void> {
  await put('prefs', { id: PREF_DAILY_GOAL, value: goal })
}

export async function saveDefaultCategory(category: string): Promise<void> {
  await put('prefs', { id: PREF_DEFAULT_CATEGORY, value: category })
}

export async function saveTestDate(date: string | null): Promise<void> {
  await put('prefs', { id: PREF_TEST_DATE, value: date })
}

export async function saveStats(stats: StatsRecord): Promise<void> {
  await put('prefs', { ...stats })
}

export async function saveExams(exams: ExamRecord[]): Promise<void> {
  await put('prefs', { id: PREF_EXAMS, items: exams })
}