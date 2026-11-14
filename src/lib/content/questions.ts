import type { LanguageId } from './schema'
import type { Question, QuestionTranslation } from './schema'
import { TOPICS } from './topics'
import { answerIsCorrect } from '../progress/engine'

const bankFiles = import.meta.glob<{ default: Question[] }>('/data/bank/*.json')

const TOPIC_PREFIXES = ['laws', 'signs', 'safety', 'vehicle'] as const

const bankCache = new Map<string, Promise<Question[]>>()

/** Bank files are named `<topic>-NN.json`; a few (A3) are category-specific. */
function fileTopic(path: string): string | undefined {
  const name = path.split('/').pop() ?? ''
  return TOPIC_PREFIXES.find((topic) => name.startsWith(`${topic}-`))
}

function topicsForCategory(category: string): string[] {
  const topics = TOPICS.filter((topic) => topic.categories.includes(category)).map(
    (topic) => topic.id,
  )
  return topics.length > 0 ? topics : [...TOPIC_PREFIXES]
}

/**
 * Load only the files that can contain questions for the requested topics.
 * This keeps a topic round from downloading the whole 1,841-question bank.
 */
function filesForTopics(topics: string[], category: string): string[] {
  return Object.keys(bankFiles).filter((path) => {
    const topic = fileTopic(path)
    if (topic) return topics.includes(topic)
    // Files without a topic prefix (a3-01.json) belong to the A3 bank only.
    return category === 'A3'
  })
}

function loadFiles(paths: string[], key: string): Promise<Question[]> {
  const cached = bankCache.get(key)
  if (cached) return cached
  const loading = Promise.all(
    paths.map((path) => bankFiles[path]().then((mod) => mod.default ?? [])),
  ).then((files) => files.flat())
  bankCache.set(key, loading)
  return loading
}

/** Load playable questions for a specific licence category. */
export async function loadCategoryQuestions(category: string): Promise<Question[]> {
  const cached = bankCache.get(category)
  if (cached) return cached
  const loading = loadFiles(
    filesForTopics(topicsForCategory(category), category),
    category,
  ).then((questions) =>
    questions.filter(
      (question) => isPlayable(question) && question.categories.includes(category),
    ),
  )
  bankCache.set(category, loading)
  return loading
}

export function isPlayable(question: Question): boolean {
  // Product rule: only the official Ministry bank is ever shown to a learner.
  return (
    question.status === 'published' &&
    question.source === 'official' &&
    (question.type !== 'image' || Boolean(question.image))
  )
}

export async function loadTopicQuestions(
  category: string,
  topicId: string,
): Promise<Question[]> {
  const key = `topic:${category}:${topicId}`
  const cached = bankCache.get(key)
  if (cached) return cached
  const loading = loadFiles(filesForTopics([topicId], category), key).then((questions) =>
    questions.filter(
      (question) =>
        isPlayable(question) &&
        question.topicId === topicId &&
        question.categories.includes(category),
    ),
  )
  bankCache.set(key, loading)
  return loading
}

export function translate(
  question: Question,
  lang: LanguageId,
): QuestionTranslation | undefined {
  return (
    question.translations[lang] ??
    question.translations.he ??
    question.translations.en
  )
}

/** The language actually shown, after the English/Hebrew fallback chain. */
export function contentLanguage(
  question: Question,
  lang: LanguageId,
): LanguageId | undefined {
  if (question.translations[lang]) return lang
  if (question.translations.he) return 'he'
  if (question.translations.en) return 'en'
  return undefined
}

export function isPublished(question: Question): boolean {
  return question.status === 'published'
}

/**
 * Grade a selection against the translation the learner is reading.
 *
 * The official bank reorders options per language, so `correctIndexes` is
 * language-specific. Grading against a single language's key silently marks
 * correct answers wrong for everyone else.
 */
export function isSelectionCorrect(
  question: Question,
  language: LanguageId,
  selected: number[],
): boolean {
  const translation = translate(question, language)
  if (!translation) return false
  return answerIsCorrect(translation.correctIndexes, selected)
}

export function publishedCount(questions: Question[]): number {
  return questions.filter(isPublished).length
}
