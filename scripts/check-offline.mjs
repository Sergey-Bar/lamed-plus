// Regression check for the offline promise: every app chunk must be precached
// and a downloaded pack must serve practice and the sign library with no
// network. Run `npm run build`, serve it with `vite preview --port 4176`, then
// `npm run audit:offline`. The dev server has no service worker, so it cannot
// prove any of this.
import { readdirSync } from 'node:fs'
import { chromium } from '@playwright/test'

const BASE = process.env.AUDIT_BASE ?? 'http://127.0.0.1:4176'
const appChunks = readdirSync('dist/assets')
  .filter((name) => name.endsWith('.js'))
  .filter((name) => !/^(laws|signs|safety|vehicle|a3)-/.test(name))
  .map((name) => `${BASE}/assets/${name}`)

const browser = await chromium.launch()
const context = await browser.newContext({ baseURL: BASE })
const page = await context.newPage()
const problems = []
page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`))
page.on('console', (message) => {
  if (message.type() === 'error') problems.push(`console: ${message.text()}`)
})

await page.goto('/')
await page.waitForFunction(() => navigator.serviceWorker?.ready)
await page.evaluate(async () => {
  const db = await new Promise((resolve, reject) => {
    const request = indexedDB.open('theoria', 1)
    request.onupgradeneeded = () => {
      for (const [name, autoIncrement] of [
        ['prefs', false],
        ['mastery', false],
        ['srs', false],
        ['xpLevel', false],
        ['streaks', false],
        ['achievements', false],
        ['inventory', false],
        ['history', true],
      ]) {
        if (!request.result.objectStoreNames.contains(name)) {
          request.result.createObjectStore(name, autoIncrement ? { keyPath: 'id', autoIncrement: true } : { keyPath: 'id' })
        }
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
  await new Promise((resolve, reject) => {
    const tx = db.transaction('prefs', 'readwrite')
    for (const [id, value] of [
      ['onboarded', true],
      ['language', 'en'],
      ['defaultCategory', 'B'],
      ['dailyGoal', 20],
      ['displayName', 'Dana'],
      ['studyStage', 'studying'],
      ['firstSeen', Date.now()],
    ]) {
      tx.objectStore('prefs').put({ id, value })
    }
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  db.close()
})

await page.goto('/#/settings')
await page.reload()
await page.getByRole('button', { name: 'Download for offline' }).click()
await page.waitForFunction(() => Boolean(localStorage.getItem('lamed:offline:B')), undefined, {
  timeout: 120000,
})
console.log('pack:', await page.evaluate(() => JSON.parse(localStorage.getItem('lamed:offline:B'))))

const cachedUrls = await page.evaluate(async () => {
  const urls = []
  for (const name of await caches.keys()) {
    const cache = await caches.open(name)
    for (const request of await cache.keys()) urls.push(request.url)
  }
  return urls
})
const missingChunks = appChunks.filter(
  (url) => !cachedUrls.some((cached) => cached.split('?')[0] === url),
)
console.log('app chunks precached:', appChunks.length - missingChunks.length, '/', appChunks.length)
console.log('missing chunks:', missingChunks)

await context.setOffline(true)
const failed = []
page.on('requestfailed', (request) => failed.push(`${request.url()} ${request.failure()?.errorText}`))
await page.getByRole('link', { name: 'Practice' }).first().click()
await page.waitForTimeout(1500)
const offlineText = await page.locator('body').innerText()
const offlineOk = /Practice|תרגול/i.test(offlineText) && offlineText.trim().length > 150
console.log('offline practice rendered:', offlineOk, JSON.stringify(offlineText.slice(0, 200)))
await page.getByRole('link', { name: 'Signs' }).first().click()
await page.waitForTimeout(1500)
const signs = await page.evaluate(() => {
  const images = [...document.querySelectorAll('img')]
  return {
    images: images.length,
    broken: images.filter((image) => image.complete && image.naturalWidth === 0).length,
    text: document.body.innerText.length,
  }
})
console.log('offline signs:', signs)
console.log('failed requests:', failed.slice(0, 5))
console.log('problems:', problems)
await browser.close()
if (
  !offlineOk ||
  signs.broken > 0 ||
  missingChunks.length > 0 ||
  failed.length > 0 ||
  problems.length > 0
) {
  process.exit(1)
}
