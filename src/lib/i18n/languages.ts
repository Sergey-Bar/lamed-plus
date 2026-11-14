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
  ro: { id: 'ro', label: 'Română', dir: 'ltr' },
  yi: { id: 'yi', label: 'ייִדיש', dir: 'rtl' },
  am: { id: 'am', label: 'አማርኛ', dir: 'ltr' },
  pl: { id: 'pl', label: 'Polski', dir: 'ltr' },
  lad: { id: 'lad', label: 'Ladino', dir: 'ltr' },
  // Adyghe has no translated interface yet (its catalog still mirrors Hebrew),
  // so it is kept only so stored preferences resolve instead of crashing. It is
  // deliberately absent from the picker and must not be marketed.
  ady: { id: 'ady', label: 'Адыгабзэ', dir: 'ltr' },
}

export const LANGUAGE_ORDER: LanguageId[] = [
  'he',
  'en',
  'ru',
  'ar',
  'fr',
  'es',
  'ro',
  'yi',
  'am',
  'pl',
  'lad',
]

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
  if (lang.startsWith('ro')) return 'ro'
  if (lang.startsWith('yi') || lang.startsWith('ji')) return 'yi'
  if (lang.startsWith('am')) return 'am'
  if (lang.startsWith('pl')) return 'pl'
  if (lang.startsWith('lad')) return 'lad'
  if (lang.startsWith('en')) return 'en'
  return 'he'
}
