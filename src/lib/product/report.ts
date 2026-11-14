import type { LanguageId, Question } from '../content/schema'
import { translate } from '../content/questions'

/**
 * There is no server, so a question report has to leave through a channel the
 * learner already has. When VITE_SUPPORT_EMAIL is configured the app opens a
 * prefilled mail; otherwise it copies the same report to the clipboard so it
 * can be pasted wherever the app was obtained.
 */
const SUPPORT_EMAIL = String(
  (import.meta.env['VITE_SUPPORT_EMAIL'] as string | undefined) ?? '',
).trim()

const APP_VERSION = '1.0'

interface ReportInput {
  question: Question
  language: LanguageId
  category: string
  selected: number[]
}

export function buildQuestionReport(input: ReportInput): string {
  const { question, language, category, selected } = input
  const translation = translate(question, language)
  const correct = translation?.correctIndexes ?? []
  const options = translation?.options ?? []
  const label = (index: number) => options[index] ?? `#${index}`
  return [
    'LAMED+ — דיווח על שאלה / question report',
    '',
    `Question: ${question.id}${question.number ? ` (#${question.number})` : ''}`,
    `Category: ${category} · Topic: ${question.topicId}`,
    `Language: ${language}`,
    `App version: ${APP_VERSION}`,
    `Time: ${new Date().toISOString()}`,
    '',
    `Question: ${translation?.stem ?? ''}`,
    ...options.map((option, index) => `${index + 1}. ${option}`),
    '',
    `Correct: ${correct.map((index) => index + 1).join(', ') || '—'} (${correct.map(label).join(' | ')})`,
    `Selected: ${selected.length ? selected.map((index) => index + 1).join(', ') : '—'}`,
    '',
    'What is wrong or unclear? / מה שגוי או לא ברור?',
  ].join('\n')
}

export type ReportResult = 'mailed' | 'copied' | 'failed'

export async function sendQuestionReport(report: string): Promise<ReportResult> {
  if (SUPPORT_EMAIL) {
    const subject = 'LAMED+ question report'
    const href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(report)}`
    try {
      window.location.href = href
      return 'mailed'
    } catch {
      return 'failed'
    }
  }
  try {
    await navigator.clipboard.writeText(report)
    return 'copied'
  } catch {
    return 'failed'
  }
}
