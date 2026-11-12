/**
 * Advertising architecture.
 *
 * Ads are deliberately separated from learning controls. The current build
 * ships a labelled house placement; replacing it with a real network only
 * requires filling the slot in AdSlot. Exam screens never render the slot.
 */
export const ADS_ENABLED = true
export const MAX_ADS_PER_SESSION = 3
export const MIN_AD_GAP_MS = 3 * 60 * 1000

let shownThisSession = 0
let lastShownAt = 0

export function canShowAd(now = Date.now()): boolean {
  if (!ADS_ENABLED) return false
  if (shownThisSession >= MAX_ADS_PER_SESSION) return false
  if (lastShownAt > 0 && now - lastShownAt < MIN_AD_GAP_MS) return false
  return true
}

export function registerAdShown(now = Date.now()): void {
  shownThisSession += 1
  lastShownAt = now
}

export function resetAdFrequencyForTests(): void {
  shownThisSession = 0
  lastShownAt = 0
}
