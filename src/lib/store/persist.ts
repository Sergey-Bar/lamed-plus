export interface StorageStatus {
  supported: boolean
  persisted: boolean
  usage: number | null
  quota: number | null
}

function storageManager(): StorageManager | undefined {
  if (typeof navigator === 'undefined') return undefined
  return navigator.storage
}

/**
 * Browsers may evict IndexedDB for sites that are not used. Asking for
 * persistent storage makes that much less likely; the app also tells the
 * learner when only best-effort storage is available.
 */
export async function readStorageStatus(): Promise<StorageStatus> {
  const manager = storageManager()
  if (!manager || typeof manager.persisted !== 'function') {
    return { supported: false, persisted: false, usage: null, quota: null }
  }
  const persisted = await manager.persisted().catch(() => false)
  let usage: number | null = null
  let quota: number | null = null
  if (typeof manager.estimate === 'function') {
    const estimate = await manager.estimate().catch(() => null)
    usage = estimate?.usage ?? null
    quota = estimate?.quota ?? null
  }
  return { supported: true, persisted, usage, quota }
}

export async function requestPersistence(): Promise<boolean> {
  const manager = storageManager()
  if (!manager || typeof manager.persist !== 'function') return false
  return manager.persist().catch(() => false)
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB']
  let value = bytes / 1024
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[unit]}`
}
