import { createContext } from 'react'
import type { A11yPrefs, TextScale } from './types'

export interface A11yState {
  prefs: A11yPrefs
  setTextScale: (value: TextScale) => void
  toggle: (key: Exclude<keyof A11yPrefs, 'textScale'>) => void
  reset: () => void
}

export const A11yContext = createContext<A11yState | null>(null)
