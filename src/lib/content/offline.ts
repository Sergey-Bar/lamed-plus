import { assetUrl } from './assets'
import { loadCategoryQuestions } from './questions'

/**
 * Offline packs are per licence category. Downloading one warms the dynamic
 * bank chunks and the official images so the service worker's runtime caches
 * can serve a full practice round without a connection.
 *
 * The pack itself is just questions plus images: progress, streak and review
 * data already live in local storage.
 */
export interface OfflinePack {
  category: string
  questions: number
  images: number
  downloadedAt: number
}

export interface OfflineStatus {
  ready: boolean
  questions: number
  downloadedAt: number | null
}

const STORAGE_PREFIX = 'lamed:offline:'

function keyFor(category: string): string {
  return `${STORAGE_PREFIX}${category}`
}

function storage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage
  } catch {
    return null
  }
}

export function readOfflineStatus(category: string): OfflineStatus {
  const store = storage()
  const raw = store?.getItem(keyFor(category))
  if (!raw) return { ready: false, questions: 0, downloadedAt: null }
  try {
    const parsed = JSON.parse(raw) as Partial<OfflinePack>
    if (typeof parsed.downloadedAt !== 'number' || typeof parsed.questions !== 'number') {
      return { ready: false, questions: 0, downloadedAt: null }
    }
    return {
      ready: true,
      questions: parsed.questions,
      downloadedAt: parsed.downloadedAt,
    }
  } catch {
    return { ready: false, questions: 0, downloadedAt: null }
  }
}

export function clearOfflinePack(category: string): void {
  storage()?.removeItem(keyFor(category))
}

/** Whether this browser can keep a pack between visits. */
export function offlineSupported(): boolean {
  return storage() !== null
}

/**
 * How many of these URLs are actually sitting in a Cache Storage bucket. The
 * service worker owns the offline copy, so a successful fetch alone is not
 * proof that the pack will work later.
 */
async function countCached(urls: string[]): Promise<number> {
  if (typeof caches === 'undefined' || urls.length === 0) return 0
  let hits = 0
  for (let index = 0; index < urls.length; index += 12) {
    const batch = urls.slice(index, index + 12)
    const results = await Promise.all(batch.map((url) => caches.match(url)))
    hits += results.filter(Boolean).length
  }
  return hits
}

async function warmImages(urls: string[], onProgress?: (done: number, total: number) => void): Promise<number> {
  if (urls.length === 0 || typeof fetch !== 'function') return 0
  const total = urls.length
  let done = 0
  let cached = 0

  // Six parallel requests keeps mobile radios busy without starving the UI.
  const queue = [...urls]
  async function worker(): Promise<void> {
    for (;;) {
      const url = queue.shift()
      if (!url) return
      try {
        const response = await fetch(url, { cache: 'force-cache' })
        if (response.ok) cached += 1
      } catch {
        // A single missing image must not fail the whole pack.
      }
      done += 1
      onProgress?.(done, total)
    }
  }

  await Promise.all(Array.from({ length: Math.min(6, total) }, () => worker()))
  return cached
}

export interface DownloadOptions {
  onProgress?: (done: number, total: number) => void
  signal?: AbortSignal
}

export async function downloadOfflinePack(
  category: string,
  options: DownloadOptions = {},
): Promise<OfflinePack> {
  const questions = await loadCategoryQuestions(category)
  const imageUrls = Array.from(
    new Set(
      questions
        .map((question) => (question.image ? assetUrl(question.image) : undefined))
        .filter((url): url is string => Boolean(url)),
    ),
  )

  // The runtime cache is populated by the service worker. Without a controller
  // the download can look successful while nothing is stored for offline use.
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator && !navigator.serviceWorker.controller) {
    throw new Error('offline-pack-no-service-worker')
  }

  await warmImages(imageUrls, options.onProgress)
  if (options.signal?.aborted) {
    throw new DOMException('Download aborted', 'AbortError')
  }

  const images = await countCached(imageUrls)
  if (imageUrls.length > 0 && images === 0) {
    throw new Error('offline-pack-not-cached')
  }

  const pack: OfflinePack = {
    category,
    questions: questions.length,
    images,
    downloadedAt: Date.now(),
  }
  storage()?.setItem(keyFor(category), JSON.stringify(pack))
  return pack
}
