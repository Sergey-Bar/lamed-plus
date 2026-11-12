import type { AchievementId } from './types'
import type { MasteryRecord } from './types'
import type { StreakState } from './engine'
import type { IconName } from '../../components/Icon'

export interface AchievementDef {
  id: AchievementId
  nameKey: string
  descKey: string
  icon: IconName
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'firstSteps', nameKey: 'ach.firstSteps.name', descKey: 'ach.firstSteps.desc', icon: 'star' },
  { id: 'streak3', nameKey: 'ach.streak3.name', descKey: 'ach.streak3.desc', icon: 'flame' },
  { id: 'streak7', nameKey: 'ach.streak7.name', descKey: 'ach.streak7.desc', icon: 'crown' },
  { id: 'perfectRound', nameKey: 'ach.perfectRound.name', descKey: 'ach.perfectRound.desc', icon: 'medal' },
  { id: 'topicMaster', nameKey: 'ach.topicMaster.name', descKey: 'ach.topicMaster.desc', icon: 'trophy' },
  { id: 'examFirst', nameKey: 'ach.examFirst.name', descKey: 'ach.examFirst.desc', icon: 'clipboard' },
  { id: 'examPass', nameKey: 'ach.examPass.name', descKey: 'ach.examPass.desc', icon: 'check' },
  { id: 'readyGo', nameKey: 'ach.readyGo.name', descKey: 'ach.readyGo.desc', icon: 'target' },
]

export interface AchievementContext {
  answeredEvents: number
  streak: StreakState
  mastery: MasteryRecord[]
  examsCompleted: number
  examsPassed: number
  perfectRound: boolean
}

export function newlyUnlocked(
  current: AchievementId[],
  ctx: AchievementContext,
): AchievementId[] {
  const unlocked = new Set(current)
  const out: AchievementId[] = []

  if (ctx.answeredEvents >= 1 && !unlocked.has('firstSteps')) out.push('firstSteps')
  if (ctx.streak.count >= 3 && !unlocked.has('streak3')) out.push('streak3')
  if (ctx.streak.count >= 7 && !unlocked.has('streak7')) out.push('streak7')
  if (ctx.perfectRound && !unlocked.has('perfectRound')) out.push('perfectRound')

  const mastered = ctx.mastery.some((m) => m.answered >= 10 && m.correct / m.answered >= 0.9)
  if (mastered && !unlocked.has('topicMaster')) out.push('topicMaster')

  if (ctx.examsCompleted >= 1 && !unlocked.has('examFirst')) out.push('examFirst')
  if (ctx.examsPassed >= 1 && !unlocked.has('examPass')) out.push('examPass')
  if (ctx.examsPassed >= 1 && !unlocked.has('readyGo')) out.push('readyGo')

  return out
}
