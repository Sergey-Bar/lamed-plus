import { describe, expect, it } from 'vitest'
import { buildTestDateIcs } from './calendar'

describe('test-date calendar export', () => {
  const ics = buildTestDateIcs({
    dateISO: '2027-03-04',
    title: 'מבחן תיאוריה',
    description: 'LAMED+',
    now: new Date('2026-11-13T08:00:00Z'),
  })

  it('is a valid single-event calendar', () => {
    expect(ics.startsWith('BEGIN:VCALENDAR')).toBe(true)
    expect(ics.trimEnd().endsWith('END:VCALENDAR')).toBe(true)
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(1)
    expect(ics.match(/END:VEVENT/g)).toHaveLength(1)
  })

  it('covers the whole test day', () => {
    expect(ics).toContain('DTSTART;VALUE=DATE:20270304')
    expect(ics).toContain('DTEND;VALUE=DATE:20270305')
  })

  it('adds a reminder the day before', () => {
    expect(ics).toContain('BEGIN:VALARM')
    expect(ics).toContain('TRIGGER:-P1D')
  })

  it('uses CRLF line endings as the format requires', () => {
    expect(ics.split('\r\n').length).toBeGreaterThan(10)
  })

  it('escapes separators that would break the format', () => {
    const escaped = buildTestDateIcs({
      dateISO: '2027-03-04',
      title: 'Test, part; one',
      description: 'a\\b',
      now: new Date('2026-11-13T08:00:00Z'),
    })
    expect(escaped).toContain('SUMMARY:Test\\, part\\; one')
    expect(escaped).toContain('DESCRIPTION:a\\\\b')
  })
})
