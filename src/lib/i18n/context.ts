import { createContext } from 'react'
import type { I18nCatalog, LanguageId } from '../content/schema'

export interface I18nState {
  language: LanguageId
  dir: 'ltr' | 'rtl'
  ready: boolean
  catalog: I18nCatalog
  t: (key: string, vars?: Record<string, string | number>) => string
  setLanguage: (lang: LanguageId) => Promise<void>
}

export const I18nContext = createContext<I18nState | null>(null)
