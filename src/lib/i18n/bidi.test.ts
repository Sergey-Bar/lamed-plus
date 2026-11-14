import { describe, expect, it } from 'vitest'
import { isolateBrand, stripBidiIsolates } from './bidi'

describe('brand bidi handling', () => {
  it('isolates the wordmark so a trailing plus stays put in RTL', () => {
    expect(isolateBrand('LAMED+ — יום')).toBe('\u2066LAMED+\u2069 — יום')
  })

  it('leaves text without the wordmark untouched', () => {
    expect(isolateBrand('הגדרות')).toBe('הגדרות')
  })

  it('round-trips back to plain text for tab titles', () => {
    const text = 'הגדרות · LAMED+'
    expect(stripBidiIsolates(isolateBrand(text))).toBe(text)
  })

  it('strips isolation characters that arrive from any source', () => {
    expect(stripBidiIsolates('\u2066LAMED+\u2069')).toBe('LAMED+')
  })
})
