import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { get, put } from '../store/store'
import { ThemeContext, THEME_STORAGE_KEY, applyTheme } from './context'
import type { ResolvedTheme, ThemeChoice } from './context'

const PREF_KEY = 'theme'

function readLocalTheme(): ThemeChoice {
  if (typeof window === 'undefined') return 'system'
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  return 'light'
}

function useSystemPrefersDark(): boolean {
  const [prefersDark, setPrefersDark] = useState(() =>
    typeof window === 'undefined'
      ? false
      : window.matchMedia('(prefers-color-scheme: dark)').matches,
  )
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setPrefersDark(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])
  return prefersDark
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeChoice>(readLocalTheme)
  const systemPrefersDark = useSystemPrefersDark()
  const resolved: ResolvedTheme =
    theme === 'system' ? (systemPrefersDark ? 'dark' : 'light') : theme

  useEffect(() => {
    let cancelled = false
    void get<{ id: string; value: ThemeChoice }>('prefs', PREF_KEY).then((stored) => {
      if (cancelled || !stored?.value) return
      if (stored.value !== 'light' && stored.value !== 'dark' && stored.value !== 'system') return
      setThemeState(stored.value)
      window.localStorage.setItem(THEME_STORAGE_KEY, stored.value)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    applyTheme(theme)
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme, resolved])

  const setTheme = useCallback((next: ThemeChoice) => {
    setThemeState(next)
    void put('prefs', { id: PREF_KEY, value: next })
  }, [])

  const value = useMemo(() => ({ theme, resolved, setTheme }), [theme, resolved, setTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
