import manifest from '../../../data/bank-manifest.json'

const byCategory = manifest.byCategory as Record<string, number>

/** All playable questions across every licence category. */
export function totalQuestionCount(): number {
  return manifest.totalQuestions
}

/** Playable (published, renderable) question count for a licence category. */
export function availableQuestionCount(category: string): number {
  return byCategory[category] ?? 0
}
