export interface MasteryRecord {
  id: string
  category: string
  topicId: string
  correct: number
  answered: number
}

export interface SrsRecord {
  id: string
  intervalDays: number
  dueTs: number
  lapses: number
  lastSeenTs: number
}

export interface XpRecord {
  id: 'xp'
  total: number
  level: number
}

export interface StreakRecord {
  id: 'streak'
  count: number
  best: number
  lastDay: string
}

export interface DailyRecord {
  id: string
  topicId: string | null
  target: number
  answered: number
  correct: number
  completed: boolean
}

export interface InventoryRecord {
  id: 'inventory'
  energy: number
  lives: number
  lastLivesTs: number
  shield: number
  used: Record<string, number>
}

export interface AnswerEvent {
  id: number
  category: string
  topicId: string
  questionId: string
  correct: boolean
  mode: string
  ts: number
}

export type AchievementId =
  | 'firstSteps'
  | 'streak3'
  | 'streak7'
  | 'perfectRound'
  | 'topicMaster'
  | 'examFirst'
  | 'examPass'
  | 'readyGo'

export interface AchievementsRecord {
  id: 'achievements'
  unlocked: AchievementId[]
}
