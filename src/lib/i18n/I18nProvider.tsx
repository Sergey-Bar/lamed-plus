import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { I18nCatalog, LanguageId } from '../content/schema'
import { get, put } from '../store/store'
import { loadCatalog } from './catalog'
import { isolateBrand } from './bidi'
import { I18nContext } from './context'
import type { I18nState } from './context'
import { detectLanguage, LANGUAGES } from './languages'
import { EXTRA_CATALOG, EXTRA_FALLBACK } from './extra'
import { ADDITIONS } from './additions'
import { EXPLANATION_COPY } from './explanations'
import { PRODUCT_COPY } from './product'

const PREF_KEY = 'language'

function withExtras(lang: LanguageId, catalog: I18nCatalog): I18nCatalog {
  return {
    ...catalog,
    ...EXTRA_FALLBACK,
    ...EXTRA_CATALOG[lang],
    ...ADDITIONS.he,
    ...ADDITIONS[lang],
    ...EXPLANATION_COPY.he,
    ...EXPLANATION_COPY[lang],
    ...PRODUCT_COPY.he,
    ...PRODUCT_COPY[lang],
  }
}

async function loadLanguageCatalog(lang: LanguageId): Promise<I18nCatalog> {
  const [catalog, hebrew] = await Promise.all([
    loadCatalog(lang),
    lang === 'he' ? Promise.resolve(null) : loadCatalog('he'),
  ])

  // Hebrew is the product fallback: every UI language sits on top of the
  // Hebrew base, so a partially translated locale never exposes raw keys.
  return withExtras(lang, { ...hebrew, ...catalog })
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
      const cat = await loadLanguageCatalog(lang)
      if (cancelled) return
      setLanguageState(lang)
      setCatalog(cat)
      setReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const setLanguage = useCallback(async (lang: LanguageId) => {
    setLanguageState(lang)
    const cat = await loadLanguageCatalog(lang)
    setCatalog(cat)
    void put('prefs', { id: PREF_KEY, value: lang })
  }, [])

  const dir = LANGUAGES[language].dir

  useEffect(() => {
    if (!ready) return
    // No bidi isolation here: the control characters show up in the tab title.
    document.title = `${catalog['app.name'] ?? 'LAMED+'} — ${catalog['app.tagline'] ?? ''}`.trim()
  }, [ready, catalog])

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      let text = catalog[key] ?? key
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          text = text.replaceAll(`{${k}}`, String(v))
        }
      }
      return dir === 'rtl' ? isolateBrand(text) : text
    },
    [catalog, dir],
  )

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
