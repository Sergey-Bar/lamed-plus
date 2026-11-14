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
  /** Size of the category bank, for context. */
  totalQuestions: number
  /** How many questions count as full coverage for the score. */
  coverageTarget: number
  components: ReadinessComponents
  weakest: string | null
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

/**
 * Coverage is measured against a realistic study target, not the whole bank.
 * A category holds well over a thousand questions, so dividing by the bank
 * meant no learner could ever reach a strong score even after answering
 * hundreds of questions correctly. The target is capped by the bank size so
 * small categories (A3) can still reach full coverage.
 */
export const READINESS_COVERAGE_TARGET = 250

const clamp = (value: number) => Math.max(0, Math.min(100, value))

const BAND_RANK: Record<ReadinessBand, number> = {
  insufficient: 0,
  weak: 1,
  building: 2,
  strong: 3,
}

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
  const coverageTarget = Math.max(1, Math.min(input.totalQuestions, READINESS_COVERAGE_TARGET))
  const coverage = clamp((sample / coverageTarget) * 100)

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
  // Breadth signals (coverage, consistency, exam history) can lift the score of
  // a learner who is still answering below the real pass margin. The band is
  // therefore capped by recent accuracy, which is what actually decides the exam.
  const scoreBand: ReadinessBand = score >= 75 ? 'strong' : score >= 50 ? 'building' : 'weak'
  const accuracyBand: ReadinessBand = accuracy >= 85 ? 'strong' : accuracy >= 70 ? 'building' : 'weak'
  const hasEnoughBand: ReadinessBand = !hasEnough ? 'insufficient' : scoreBand
  const band: ReadinessBand =
    hasEnoughBand === 'insufficient'
      ? 'insufficient'
      : BAND_RANK[hasEnoughBand] <= BAND_RANK[accuracyBand]
        ? hasEnoughBand
        : accuracyBand

  const categoryMastery = Object.values(input.mastery).filter((m) => m.category === input.category)

  return {
    score,
    band,
    sample,
    totalQuestions: input.totalQuestions,
    coverageTarget,
    components,
    weakest: weakestTopic(categoryMastery),
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
