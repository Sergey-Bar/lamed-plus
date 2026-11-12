import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { I18nCatalog, LanguageId } from '../content/schema'
import { get, put } from '../store/store'
import { loadCatalog } from './catalog'
import { I18nContext } from './context'
import type { I18nState } from './context'
import { detectLanguage, LANGUAGES } from './languages'
import { EXTRA_CATALOG, EXTRA_FALLBACK } from './extra'
import { ADDITIONS } from './additions'

const PREF_KEY = 'language'

function withExtras(lang: LanguageId, catalog: I18nCatalog): I18nCatalog {
  return {
    ...catalog,
    ...EXTRA_FALLBACK,
    ...(EXTRA_CATALOG[lang] ?? {}),
    ...ADDITIONS.en,
    ...ADDITIONS[lang],
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageId>('en')
  const [catalog, setCatalog] = useState<I18nCatalog>({})
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const stored = await get<{ key: string; value: LanguageId }>(
        'prefs',
        PREF_KEY,
      )
      const lang = stored?.value ?? detectLanguage()
      const cat = await loadCatalog(lang)
      if (cancelled) return
      setLanguageState(lang)
      setCatalog(withExtras(lang, cat))
      setReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const setLanguage = useCallback(async (lang: LanguageId) => {
    setLanguageState(lang)
    const cat = await loadCatalog(lang)
    setCatalog(withExtras(lang, cat))
    void put('prefs', { id: PREF_KEY, value: lang })
  }, [])

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      let text = catalog[key] ?? key
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          text = text.replaceAll(`{${k}}`, String(v))
        }
      }
      return text
    },
    [catalog],
  )

  const dir = LANGUAGES[language].dir

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = dir
  }, [language, dir])

  const value = useMemo<I18nState>(
    () => ({ language, dir, ready, catalog, t, setLanguage }),
    [language, dir, ready, catalog, t, setLanguage],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
