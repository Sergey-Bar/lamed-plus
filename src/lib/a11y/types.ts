export const TEXT_SCALES = [1, 1.125, 1.25, 1.4] as const

export type TextScale = (typeof TEXT_SCALES)[number]

export interface A11yPrefs {
  textScale: TextScale
  highContrast: boolean
  reduceMotion: boolean
  underlineLinks: boolean
  comfortableReading: boolean
  readAloud: boolean
}

export const DEFAULT_A11Y_PREFS: A11yPrefs = {
  textScale: 1,
  highContrast: false,
  reduceMotion: false,
  underlineLinks: false,
  comfortableReading: false,
  readAloud: true,
}
