/**
 * The test date is already saved for the countdown. Without a server we cannot
 * send reminders, so the honest alternative is a calendar file the learner owns.
 */

function icsDate(dateISO: string): string {
  return dateISO.replaceAll('-', '')
}

function icsStamp(now = new Date()): string {
  return `${now.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`
}

function escapeText(value: string): string {
  return value
    .replaceAll('\\', '\\\\')
    .replaceAll(';', '\\;')
    .replaceAll(',', '\\,')
    .replaceAll('\n', '\\n')
}

export function buildTestDateIcs(options: {
  dateISO: string
  title: string
  description?: string
  now?: Date
}): string {
  const { dateISO, title, description = '', now = new Date() } = options
  const day = icsDate(dateISO)
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//LAMED+//Theory test//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:lamed-test-${day}@lamed`,
    `DTSTAMP:${icsStamp(now)}`,
    `DTSTART;VALUE=DATE:${day}`,
    `DTEND;VALUE=DATE:${icsDate(addDays(dateISO, 1))}`,
    `SUMMARY:${escapeText(title)}`,
    `DESCRIPTION:${escapeText(description)}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'TRIGGER:-P1D',
    `DESCRIPTION:${escapeText(title)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

function addDays(dateISO: string, days: number): string {
  // UTC keeps the result independent of the device time zone.
  const date = new Date(`${dateISO}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function downloadTestDateIcs(options: {
  dateISO: string
  title: string
  description?: string
}): void {
  const blob = new Blob([buildTestDateIcs(options)], {
    type: 'text/calendar;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `lamed-test-${options.dateISO}.ics`
  anchor.click()
  URL.revokeObjectURL(url)
}
