import type { LanguageId } from './schema'
import type { LocalizedLesson } from './curriculum'
import { AR_LESSONS, AR_SUBJECTS } from './curriculum.ar'
import { EN_LESSONS, EN_SUBJECTS } from './curriculum.en'
import { ES_LESSONS, ES_SUBJECTS } from './curriculum.es'
import { FR_LESSONS, FR_SUBJECTS } from './curriculum.fr'
import { RU_LESSONS, RU_SUBJECTS } from './curriculum.ru'
import roCurriculum from '../../../data/i18n/curriculum.ro.json'
import plCurriculum from '../../../data/i18n/curriculum.pl.json'
import yiCurriculum from '../../../data/i18n/curriculum.yi.json'
import amCurriculum from '../../../data/i18n/curriculum.am.json'
import ladCurriculum from '../../../data/i18n/curriculum.lad.json'

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
  ro: roCurriculum.lessons as Record<string, LocalizedLesson>,
  pl: plCurriculum.lessons as Record<string, LocalizedLesson>,
  yi: yiCurriculum.lessons as Record<string, LocalizedLesson>,
  am: amCurriculum.lessons as Record<string, LocalizedLesson>,
  lad: ladCurriculum.lessons as Record<string, LocalizedLesson>,
}

export const SUBJECT_INSIGHTS: Partial<Record<LanguageId, Record<string, string>>> = {
  en: EN_SUBJECTS,
  ru: RU_SUBJECTS,
  ar: AR_SUBJECTS,
  fr: FR_SUBJECTS,
  es: ES_SUBJECTS,
  ro: roCurriculum.subjects,
  pl: plCurriculum.subjects,
  yi: yiCurriculum.subjects,
  am: amCurriculum.subjects,
  lad: ladCurriculum.subjects,
}
