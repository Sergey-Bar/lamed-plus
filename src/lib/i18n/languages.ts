import type { LanguageId } from '../content/schema'

export type { LanguageId }

export interface LanguageMeta {
  id: LanguageId
  label: string
  dir: 'ltr' | 'rtl'
}

export const LANGUAGES: Record<LanguageId, LanguageMeta> = {
  he: { id: 'he', label: 'עברית', dir: 'rtl' },
  en: { id: 'en', label: 'English', dir: 'ltr' },
  ru: { id: 'ru', label: 'Русский', dir: 'ltr' },
  ar: { id: 'ar', label: 'العربية', dir: 'rtl' },
  fr: { id: 'fr', label: 'Français', dir: 'ltr' },
  es: { id: 'es', label: 'Español', dir: 'ltr' },
}

export const LANGUAGE_ORDER: LanguageId[] = ['he', 'en', 'ru', 'ar', 'fr', 'es']

export function isLanguageId(value: string): value is LanguageId {
  return value in LANGUAGES
}

export function detectLanguage(): LanguageId {
  if (typeof navigator === 'undefined') return 'he'
  const lang = navigator.language.toLowerCase()
  if (lang.startsWith('he')) return 'he'
  if (lang.startsWith('ru')) return 'ru'
  if (lang.startsWith('ar')) return 'ar'
  if (lang.startsWith('fr')) return 'fr'
  if (lang.startsWith('es')) return 'es'
  if (lang.startsWith('en')) return 'en'
  return 'he'
}
