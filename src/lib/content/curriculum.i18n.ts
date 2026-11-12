import type { LanguageId } from './schema'
import type { LocalizedLesson } from './curriculum'
import { AR_LESSONS, AR_SUBJECTS } from './curriculum.ar'
import { EN_LESSONS, EN_SUBJECTS } from './curriculum.en'
import { ES_LESSONS, ES_SUBJECTS } from './curriculum.es'
import { FR_LESSONS, FR_SUBJECTS } from './curriculum.fr'
import { RU_LESSONS, RU_SUBJECTS } from './curriculum.ru'

/**
 * Lesson content in every UI language except Hebrew, which is the authored
 * source in `curriculum.ts`. Missing entries fall back to Hebrew.
 */
export const LESSON_TRANSLATIONS: Partial<
  Record<LanguageId, Record<string, LocalizedLesson>>
> = {
  en: EN_LESSONS,
  ru: RU_LESSONS,
  ar: AR_LESSONS,
  fr: FR_LESSONS,
  es: ES_LESSONS,
}

export const SUBJECT_INSIGHTS: Partial<Record<LanguageId, Record<string, string>>> = {
  en: EN_SUBJECTS,
  ru: RU_SUBJECTS,
  ar: AR_SUBJECTS,
  fr: FR_SUBJECTS,
  es: ES_SUBJECTS,
}
