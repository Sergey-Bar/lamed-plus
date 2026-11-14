import type { Snapshot } from './snapshot'
import type { MasteryRecord, SrsRecord } from '../progress/types'

/**
 * Two devices are allowed to study offline at the same time, so sync cannot be
 * last-write-wins over the whole file: that would throw away real answers.
 * Counters take the larger value (they only grow), records take the newer one,
 * and preferences follow the snapshot that was edited last.
 */
export function mergeSnapshots(local: Snapshot, remote: Snapshot): Snapshot {
  const newer = remote.updatedAt > local.updatedAt ? remote : local

  const mastery = new Map<string, MasteryRecord>()
  for (const record of [...local.mastery, ...remote.mastery]) {
    const existing = mastery.get(record.id)
    if (!existing) {
      mastery.set(record.id, { ...record })
      continue
    }
    mastery.set(record.id, {
      ...record,
      answered: Math.max(existing.answered, record.answered),
      correct: Math.max(existing.correct, record.correct),
    })
  }

  const srs = new Map<string, SrsRecord>()
  for (const record of [...local.srs, ...remote.srs]) {
    const existing = srs.get(record.id)
    if (!existing) {
      srs.set(record.id, { ...record })
      continue
    }
    // The record seen most recently carries the current interval.
    srs.set(record.id, {
      ...(record.lastSeenTs >= existing.lastSeenTs ? record : existing),
      lapses: Math.max(existing.lapses, record.lapses),
    })
  }

  const exams = new Map<string, Snapshot['exams'][number]>()
  for (const exam of [...local.exams, ...remote.exams]) exams.set(exam.id, exam)

  const inventory = {
    ...(local.inventory.lastLivesTs >= remote.inventory.lastLivesTs
      ? local.inventory
      : remote.inventory),
    energy: Math.max(local.inventory.energy, remote.inventory.energy),
    shield: Math.max(local.inventory.shield, remote.inventory.shield),
    used: { ...remote.inventory.used, ...local.inventory.used },
  }
  for (const key of Object.keys(inventory.used)) {
    inventory.used[key] = Math.max(
      local.inventory.used[key] ?? 0,
      remote.inventory.used[key] ?? 0,
    )
  }

  const daily =
    !local.daily ? remote.daily : !remote.daily ? local.daily
      : local.daily.id >= remote.daily.id ? local.daily : remote.daily

  return {
    version: 1,
    updatedAt: Math.max(local.updatedAt, remote.updatedAt),
    onboarded: local.onboarded || remote.onboarded,
    displayName: newer.displayName || local.displayName || remote.displayName,
    studyStage: newer.studyStage,
    lessons: [...new Set([...local.lessons, ...remote.lessons])],
    dailyGoal: newer.dailyGoal,
    defaultCategory: newer.defaultCategory,
    testDate: newer.testDate,
    xp: Math.max(local.xp, remote.xp),
    streak: {
      count: Math.max(local.streak.count, remote.streak.count),
      best: Math.max(local.streak.best, remote.streak.best),
      lastDay: local.streak.lastDay > remote.streak.lastDay ? local.streak.lastDay : remote.streak.lastDay,
    },
    inventory,
    mastery: [...mastery.values()],
    srs: [...srs.values()],
    achievements: [...new Set([...local.achievements, ...remote.achievements])],
    daily,
    stats: {
      id: 'stats',
      examsCompleted: Math.max(local.stats.examsCompleted, remote.stats.examsCompleted),
      examsPassed: Math.max(local.stats.examsPassed, remote.stats.examsPassed),
    },
    exams: [...exams.values()].sort((a, b) => b.ts - a.ts).slice(0, 200),
    answeredCount: Math.max(local.answeredCount, remote.answeredCount),
  }
}
