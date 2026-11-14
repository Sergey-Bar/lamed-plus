import { describe, expect, it } from 'vitest'
import { LEGAL_DOCS, legalDoc } from './content'

describe('legal documents', () => {
  it('covers privacy, terms and accessibility in Hebrew and English', () => {
    for (const id of ['privacy', 'terms', 'accessibility'] as const) {
      const doc = LEGAL_DOCS[id]
      expect(doc.he, id).toBeDefined()
      expect(doc.en, id).toBeDefined()
      expect(doc.he!.title.length).toBeGreaterThan(3)
      expect(doc.en!.title.length).toBeGreaterThan(3)
      expect(doc.he!.sections.length, id).toBeGreaterThanOrEqual(3)
      expect(doc.en!.sections.length, id).toBe(doc.he!.sections.length)
      expect(Number.isNaN(new Date(doc.he!.updated).getTime())).toBe(false)
    }
  })

  it('serves Hebrew to Hebrew readers and English to everyone else', () => {
    expect(legalDoc('privacy', 'he')).toBe(LEGAL_DOCS.privacy.he)
    expect(legalDoc('privacy', 'ru')).toBe(LEGAL_DOCS.privacy.en)
    expect(legalDoc('terms', 'ar')).toBe(LEGAL_DOCS.terms.en)
  })

  it('describes the product honestly: local data, no accounts, no tracking', () => {
    const text = JSON.stringify(LEGAL_DOCS.privacy.he)
    expect(text).toContain('יופעלו בקרוב')
    expect(text).toContain('כבויה כברירת מחדל')
    expect(text).toContain('אין מזהי פרסום')
    expect(text).toContain('בדפדפן או באפליקציה המותקנת')
    expect(text).not.toMatch(/פרימיום|premium|google-analytics|googletagmanager|hotjar/i)
  })
})
