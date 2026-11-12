import { describe, expect, it } from 'vitest'
import { formatClock, shuffle } from './utils'

describe('utils', () => {
  it('shuffles while preserving the element set', () => {
    const input = [1, 2, 3, 4, 5]
    const out = shuffle(input)
    expect(out).toHaveLength(input.length)
    expect([...out].sort()).toEqual([...input].sort())
  })

  it('formats clock as mm:ss', () => {
    expect(formatClock(45)).toBe('0:45')
    expect(formatClock(125)).toBe('2:05')
    expect(formatClock(3600)).toBe('60:00')
  })
})
