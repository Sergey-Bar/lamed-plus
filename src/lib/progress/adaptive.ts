import type { MasteryRecord, SrsRecord } from './types'
import { masteryKey } from './engine'

/**
 * Weight for a question's topic. Weak or unseen topics are picked more often;
 * a fully mastered topic is still reachable so the queue never gets stuck.
 */
export function adaptiveWeight(record: MasteryRecord | undefined): number {
  const accuracy = record && record.answered > 0 ? record.correct / record.answered : 0.5
  return 1 + (1 - accuracy) * 2
}

const DAY_MS = 86400000

/**
 * Weight for a single question, from its spaced-repetition state. Unlike topic
 * accuracy this is per item: questions that are due come back first, questions
 * answered moments ago are suppressed, and unseen material stays attractive so
 * a round never repeats the same ten questions.
 */
export function reviewWeight(record: SrsRecord | undefined, now = Date.now()): number {
  if (!record) return 1.6
  if (record.dueTs <= now) return 2.2 + Math.min(record.lapses, 3) * 0.3
  if (now - record.lastSeenTs < DAY_MS) return 0.2
  if (record.dueTs - now <= 3 * DAY_MS) return 1.2
  return 1
}

/** Combined weight of a question: weak topic × review urgency. */
export function questionWeight(
  mastery: Record<string, MasteryRecord>,
  srs: Record<string, SrsRecord>,
  category: string,
  question: { id: string; topicId: string },
  now = Date.now(),
): number {
  return (
    adaptiveWeight(mastery[masteryKey(category, question.topicId)]) *
    reviewWeight(srs[question.id], now)
  )
}

/**
 * Weighted sampling without replacement, by topic weakness and review state.
 * Order stays varied between rounds.
 */
export function pickAdaptive<T extends { id: string; topicId: string }>(
  questions: T[],
  mastery: Record<string, MasteryRecord>,
  category: string,
  count: number,
  random: () => number = Math.random,
  srs: Record<string, SrsRecord> = {},
  now = Date.now(),
): T[] {
  const pool = [...questions]
  const weights = pool.map((question) =>
    questionWeight(mastery, srs, category, question, now),
  )
  const picked: T[] = []
  const target = Math.min(count, pool.length)

  while (picked.length < target) {
    const total = weights.reduce((sum, weight) => sum + weight, 0)
    let ticket = random() * total
    let index = 0
    while (index < pool.length - 1 && ticket >= weights[index]) {
      ticket -= weights[index]
      index += 1
    }
    picked.push(pool[index])
    pool.splice(index, 1)
    weights.splice(index, 1)
  }

  return picked
}
