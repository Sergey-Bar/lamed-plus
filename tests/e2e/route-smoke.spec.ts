import { expect, test } from '@playwright/test'
import { seedPrefs } from './helpers'

/**
 * Every route must render real content without console errors, page crashes or
 * failed asset requests. This is the cheapest net for regressions that the
 * journey tests do not touch.
 */
const ROUTES = [
  '/app',
  '/learn',
  '/learn/laws/laws-speed',
  '/practice',
  '/review',
  '/exams',
  '/exam/B',
  '/exam/A3',
  '/games',
  '/signs',
  '/stats',
  '/achievements',
  '/profile',
  '/settings',
  '/privacy',
  '/terms',
  '/accessibility',
]

test('every route renders without console errors or broken requests', async ({ page }) => {
  const problems: string[] = []
  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`))
  page.on('console', (message) => {
    if (message.type() === 'error') problems.push(`console: ${message.text()}`)
  })
  page.on('response', (response) => {
    if (response.status() >= 400) problems.push(`${response.status()} ${response.url()}`)
  })

  await seedPrefs(page)

  for (const route of ROUTES) {
    await page.goto(`/#${route}`)
    await expect(page.locator('body')).toBeVisible()
    await expect
      .poll(async () => (await page.locator('body').innerText()).trim().length, {
        message: `page ${route} rendered almost nothing`,
      })
      .toBeGreaterThan(80)
  }

  expect(problems, problems.join('\n')).toEqual([])
})

test('app screens fit a phone without horizontal scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 })
  await seedPrefs(page)

  const screens = ['/app', '/learn', '/practice', '/exams', '/stats', '/settings', '/profile']
  for (const route of screens) {
    await page.goto(`/#${route}`)
    await expect
      .poll(async () => (await page.locator('body').innerText()).trim().length)
      .toBeGreaterThan(80)
    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }))
    expect(overflow.scrollWidth, `${route} scrolls horizontally`).toBeLessThanOrEqual(
      overflow.clientWidth + 1,
    )
  }
})
