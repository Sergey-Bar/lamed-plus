/**
 * Bidi helpers for the Latin brand inside right-to-left text.
 *
 * In Hebrew or Arabic, "LAMED+" renders as "+LAMED": the trailing plus is a
 * neutral character and jumps to the left edge of the run. Wrapping the Latin
 * run in isolates keeps the wordmark intact, while plain-text surfaces (tab
 * titles, bookmarks) strip the invisible controls again.
 */
const LRI = '\u2066'
const PDI = '\u2069'

export function isolateBrand(text: string): string {
  return text.includes('LAMED+') ? text.replaceAll('LAMED+', `${LRI}LAMED+${PDI}`) : text
}

export function stripBidiIsolates(text: string): string {
  return text.replaceAll(LRI, '').replaceAll(PDI, '')
}
