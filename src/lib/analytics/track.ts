import { getCloud } from '../cloud/client'

/**
 * Product analytics are opt-in, first-party (the same Supabase project that
 * holds the account) and carry no personal data: no email, no name, no IP is
 * stored by the app, only an anonymous id kept in this browser.
 */
const CONSENT_KEY = 'lamed-analytics-consent'
const ANON_KEY = 'lamed-anon-id'

/** Only events the app actually sends; keep this list honest. */
export type AnalyticsEvent =
  | 'app_open'
  | 'exam_start'
  | 'exam_finish'
  | 'sign_in'
  | 'ad_impression'

export function analyticsConsent(): boolean | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY)
    if (raw === 'on') return true
    if (raw === 'off') return false
    return null
  } catch {
    return null
  }
}

export function setAnalyticsConsent(value: boolean): void {
  try {
    localStorage.setItem(CONSENT_KEY, value ? 'on' : 'off')
  } catch {
    /* private mode: consent simply does not persist */
  }
}

function anonId(): string {
  try {
    const existing = localStorage.getItem(ANON_KEY)
    if (existing) return existing
    const id = crypto.randomUUID()
    localStorage.setItem(ANON_KEY, id)
    return id
  } catch {
    return 'anonymous'
  }
}

export function track(
  name: AnalyticsEvent,
  props: Record<string, string | number | boolean> = {},
): void {
  if (analyticsConsent() !== true) return
  const cloud = getCloud()
  if (!cloud) return
  // Fire and forget: measurement must never slow down studying or throw.
  void (async () => {
    try {
      await cloud.from('events').insert({
        name,
        props,
        anon_id: anonId(),
        locale: document.documentElement.lang || 'he',
      })
    } catch {
      /* offline or blocked: drop the event */
    }
  })()
}
