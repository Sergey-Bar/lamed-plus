export type LanguageId =
  | 'he'
  | 'en'
  | 'ru'
  | 'ar'
  | 'fr'
  | 'es'
  | 'ro'
  | 'yi'
  | 'am'
  | 'pl'
  | 'lad'
  | 'ady'

export type QuestionType = 'single' | 'multi' | 'boolean' | 'image'

export type QuestionStatus = 'draft' | 'reviewed' | 'published'

export type QuestionSource = 'official' | 'authored' | 'community'

export interface QuestionTranslation {
  stem: string
  options: string[]
  correctIndexes: number[]
  /** Optional: the official bank does not ship explanations. */
  explanation?: string
}

export interface Question {
  id: string
  /** Official question number, kept for provenance and stable display. */
  number?: string
  /** Every licence class this question can appear in. */
  categories: string[]
  topicId: string
  signGroup?: string
  type: QuestionType
  image?: string
  difficulty: number
  source: QuestionSource
  status: QuestionStatus
  translations: Partial<Record<LanguageId, QuestionTranslation>>
}

export interface CategoryConfig {
  id: string
  nameKey: string
  questionCount: number
  passThreshold: number
  timeMinutes: number
  languages: LanguageId[]
}

export interface Topic {
  id: string
  nameKey: string
  categories: string[]
}

export type I18nCatalog = Record<string, string>
