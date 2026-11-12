import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import '../a11y/a11y.css'
import { A11yContext } from './context'
import type { A11yState } from './context'
import { DEFAULT_A11Y_PREFS, TEXT_SCALES } from './types'
import type { A11yPrefs, TextScale } from './types'

const STORAGE_KEY = 'lamed-a11y'

function loadPrefs(): A11yPrefs {
  if (typeof window === 'undefined') return DEFAULT_A11Y_PREFS
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_A11Y_PREFS
    const parsed = JSON.parse(raw) as Partial<A11yPrefs>
    const textScale = TEXT_SCALES.includes(parsed.textScale as TextScale)
      ? (parsed.textScale as TextScale)
      : DEFAULT_A11Y_PREFS.textScale
    return {
      textScale,
      highContrast: parsed.highContrast === true,
      reduceMotion: parsed.reduceMotion === true,
      underlineLinks: parsed.underlineLinks === true,
      comfortableReading: parsed.comfortableReading === true,
      readAloud: parsed.readAloud !== false,
    }
  } catch {
    return DEFAULT_A11Y_PREFS
  }
}

export function A11yProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<A11yPrefs>(loadPrefs)

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--a11y-text-scale', String(prefs.textScale))
    root.dataset['contrast'] = prefs.highContrast ? 'high' : 'normal'
    root.dataset['a11yMotion'] = prefs.reduceMotion ? 'reduce' : 'auto'
    root.dataset['a11yLinks'] = prefs.underlineLinks ? 'underline' : 'normal'
    root.dataset['a11yReading'] = prefs.comfortableReading ? 'comfortable' : 'normal'
    root.dataset['a11yReadAloud'] = prefs.readAloud ? 'on' : 'off'
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
    } catch {
      // Preferences are optional; a full storage quota must not break the app.
    }
  }, [prefs])

  const setTextScale = useCallback((value: TextScale) => {
    setPrefs((current) => ({ ...current, textScale: value }))
  }, [])

  const toggle = useCallback(
    (key: Exclude<keyof A11yPrefs, 'textScale'>) => {
      setPrefs((current) => ({ ...current, [key]: !current[key] }))
    },
    [],
  )

  const reset = useCallback(() => setPrefs(DEFAULT_A11Y_PREFS), [])

  const value = useMemo<A11yState>(
    () => ({ prefs, setTextScale, toggle, reset }),
    [prefs, setTextScale, toggle, reset],
  )

  return <A11yContext.Provider value={value}>{children}</A11yContext.Provider>
}
