import type { MasteryRecord } from './types'
import { masteryKey } from './engine'

/**
 * Weight for a question's topic. Weak or unseen topics are picked more often;
 * a fully mastered topic is still reachable so the queue never gets stuck.
 */
export function adaptiveWeight(record: MasteryRecord | undefined): number {
  const accuracy = record && record.answered > 0 ? record.correct / record.answered : 0.5
  return 1 + (1 - accuracy) * 2
}

/**
 * Weighted sampling without replacement. Questions from weak topics surface
 * more often, while the order stays varied between rounds.
 */
export function pickAdaptive<T extends { id: string; topicId: string }>(
  questions: T[],
  mastery: Record<string, MasteryRecord>,
  category: string,
  count: number,
  random: () => number = Math.random,
): T[] {
  const pool = [...questions]
  const weights = pool.map((question) =>
    adaptiveWeight(mastery[masteryKey(category, question.topicId)]),
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
