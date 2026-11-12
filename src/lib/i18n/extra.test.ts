import { describe, expect, it } from 'vitest'
import { EXTRA_CATALOG } from './extra'

describe('supplemental LAMED+ catalog', () => {
  const reference = Object.keys(EXTRA_CATALOG.en ?? {}).sort()

  it.each(['he', 'ru', 'ar', 'fr', 'es'] as const)('%s covers every supplemental key', (language) => {
    const keys = Object.keys(EXTRA_CATALOG[language] ?? {}).sort()
    expect(keys).toEqual(reference)
  })

  it.each(['he', 'ru', 'ar', 'fr', 'es'] as const)('%s has no empty supplemental values', (language) => {
    for (const [key, value] of Object.entries(EXTRA_CATALOG[language] ?? {})) {
      expect(value.trim(), `${language}:${key}`).not.toHaveLength(0)
    }
  })
})
