import { createContext } from 'react'

export type ThemeChoice = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export interface ThemeState {
  theme: ThemeChoice
  resolved: ResolvedTheme
  setTheme: (theme: ThemeChoice) => void
}

export const ThemeContext = createContext<ThemeState | null>(null)

export const THEME_STORAGE_KEY = 'lamed-theme'

export function resolveTheme(theme: ThemeChoice): ResolvedTheme {
  if (theme !== 'system') return theme
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyTheme(theme: ThemeChoice): ResolvedTheme {
  const resolved = resolveTheme(theme)
  if (typeof document !== 'undefined') {
    document.documentElement.dataset['theme'] = resolved
    document.documentElement.style.colorScheme = resolved
    const themeColor = resolved === 'dark' ? '#101820' : '#F7F8FA'
    for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
      meta.content = themeColor
    }
  }
  return resolved
}
