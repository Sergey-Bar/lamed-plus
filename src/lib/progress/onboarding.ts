export const DEFAULT_CATEGORY = 'B'

export const DAILY_GOAL_OPTIONS = [10, 20, 30]

export const PREF_ONBOARDED = 'onboarded'
export const PREF_DAILY_GOAL = 'dailyGoal'
export const PREF_DEFAULT_CATEGORY = 'defaultCategory'
export const PREF_TEST_DATE = 'testDate'
export const PREF_LAST_SESSION = 'lastSession'
export const PREF_EXAMS = 'exams'
export const PREF_DISPLAY_NAME = 'displayName'
export const PREF_STUDY_STAGE = 'studyStage'
export const PREF_LESSONS = 'lessons'
export const PREF_FIRST_SEEN = 'firstSeen'

export interface LastSession {
  mode: string
  category?: string
  ts: number
}
