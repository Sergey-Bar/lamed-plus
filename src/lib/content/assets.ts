/**
 * Official Ministry images live in `public/assets/official` and are served as
 * static files. Keeping them out of the module graph avoids hundreds of dev
 * server transform requests and removes the image URL map from the bundle.
 */
const BASE = import.meta.env.BASE_URL

export function assetUrl(relativePath: string): string | undefined {
  if (!relativePath) return undefined
  const normalized = relativePath.replace(/^\/+/, '')
  return `${BASE}${normalized}`
}
