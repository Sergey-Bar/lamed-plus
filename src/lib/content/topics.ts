import type { Topic } from './schema'

const topicsModule = import.meta.glob<{ default: Topic[] }>(
  '/data/topics.json',
  { eager: true },
)

export const TOPICS: Topic[] = topicsModule['/data/topics.json']?.default ?? []

export const TOPIC_MAP: Record<string, Topic> = Object.fromEntries(
  TOPICS.map((t) => [t.id, t]),
)

export function getTopic(id: string): Topic | undefined {
  return TOPIC_MAP[id]
}
