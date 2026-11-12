import { all } from '../store/store'
import { availableQuestionCount } from '../content/bankStats'
import { masteryKey, readyCheck, todayKey, weakestTopic } from './engine'
import type { ProgressState } from './context'

export type ReadinessBand = 'insufficient' | 'weak' | 'building' | 'strong'

export interface ReadinessComponents {
  coverage: number
  accuracy: number
  consistency: number
  exams: number
  unseen: number
}

export interface ReadinessReport {
  score: number
  band: ReadinessBand
  sample: number
  totalQuestions: number
  components: ReadinessComponents
  weakest: string | null
  firstAttemptAccuracy: number
}

export interface ReadinessEvent {
  questionId: string
  correct: boolean
  ts: number
}

export const READINESS_WEIGHTS = {
  coverage: 0.25,
  accuracy: 0.3,
  consistency: 0.15,
  exams: 0.15,
  unseen: 0.15,
} as const

const clamp = (value: number) => Math.max(0, Math.min(100, value))

export function buildReadiness(input: {
  events: ReadinessEvent[]
  exams: Array<{ score: number; total: number; ts: number }>
  totalQuestions: number
  mastery: ProgressState['mastery']
  category: string
  now?: number
}): ReadinessReport {
  const now = input.now ?? Date.now()
  const sorted = [...input.events].sort((a, b) => a.ts - b.ts)

  const firstAttempt = new Map<string, boolean>()
  for (const event of sorted) {
    if (!firstAttempt.has(event.questionId)) firstAttempt.set(event.questionId, event.correct)
  }
  const sample = firstAttempt.size
  const coverage = input.totalQuestions > 0 ? clamp((sample / input.totalQuestions) * 100) : 0

  const recent = sorted.slice(-50)
  const passRate = 0.86
  const accuracy = recent.length
    ? clamp(readyCheck({ answers: recent.map((e) => ({ correct: e.correct, ts: e.ts })), passRate }).estimatedAccuracy * 100)
    : 0

  const activeDays = new Set<number>()
  for (const event of sorted) {
    if (event.ts >= now - 13 * 86400000) {
      const key = todayKey(event.ts)
      activeDays.add(new Date(`${key}T00:00:00`).getTime())
    }
  }
  const consistency = clamp((activeDays.size / 5) * 100)

  const recentExams = [...input.exams].sort((a, b) => b.ts - a.ts).slice(0, 3)
  const exams = recentExams.length
    ? clamp(
        (recentExams.reduce((sum, exam) => sum + exam.score / Math.max(1, exam.total), 0) /
          recentExams.length) *
          100,
      )
    : 0

  const firstAttempts = [...firstAttempt.values()]
  const unseen = firstAttempts.length
    ? clamp((firstAttempts.filter(Boolean).length / firstAttempts.length) * 100)
    : 0

  const components: ReadinessComponents = {
    coverage,
    accuracy,
    consistency,
    exams,
    unseen,
  }

  const weighted =
    coverage * READINESS_WEIGHTS.coverage +
    accuracy * READINESS_WEIGHTS.accuracy +
    consistency * READINESS_WEIGHTS.consistency +
    exams * READINESS_WEIGHTS.exams +
    unseen * READINESS_WEIGHTS.unseen

  const hasEnough = sample >= 20
  const score = hasEnough ? Math.round(weighted) : 0
  const band: ReadinessBand = !hasEnough
    ? 'insufficient'
    : score >= 75
      ? 'strong'
      : score >= 50
        ? 'building'
        : 'weak'

  const categoryMastery = Object.values(input.mastery).filter((m) => m.category === input.category)

  return {
    score,
    band,
    sample,
    totalQuestions: input.totalQuestions,
    components,
    weakest: weakestTopic(categoryMastery),
    firstAttemptAccuracy: Math.round(unseen),
  }
}

export async function getReadinessReport(
  state: Pick<ProgressState, 'mastery' | 'exams'>,
  category: string,
): Promise<ReadinessReport> {
  const history = await all<{
    category: string
    questionId: string
    correct: boolean
    ts: number
  }>('history')
  return buildReadiness({
    events: history
      .filter((entry) => entry.category === category)
      .map((entry) => ({
        questionId: entry.questionId,
        correct: entry.correct,
        ts: entry.ts,
      })),
    exams: state.exams
      .filter((exam) => exam.category === category)
      .map((exam) => ({ score: exam.score, total: exam.total, ts: exam.ts })),
    totalQuestions: availableQuestionCount(category),
    mastery: state.mastery,
    category,
  })
}

export { masteryKey }
