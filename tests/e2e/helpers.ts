import { expect, type Page } from '@playwright/test'

export interface SeedOptions {
  language?: 'he' | 'en' | 'ru' | 'ar' | 'fr' | 'es'
  defaultCategory?: string
  dailyGoal?: number
  testDate?: string | null
  displayName?: string
  studyStage?: string
  theme?: 'light' | 'dark'
}

/**
 * Writes onboarding preferences straight into IndexedDB. Playwright gives
 * every test a fresh context, so this is also the only state in the database.
 */
export async function seedPrefs(page: Page, options: SeedOptions = {}): Promise<void> {
  const {
    language = 'en',
    defaultCategory = 'B',
    dailyGoal = 20,
    testDate = null,
    displayName = 'Dana',
    studyStage = 'studying',
    theme = 'light',
  } = options

  const entries: Array<[string, unknown]> = [
    ['onboarded', true],
    ['language', language],
    ['defaultCategory', defaultCategory],
    ['dailyGoal', dailyGoal],
    ['testDate', testDate],
    ['displayName', displayName],
    ['studyStage', studyStage],
    ['firstSeen', Date.now()],
  ]

  await page.goto('/')
  await page.evaluate(async (payload) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('theoria', 1)
      request.onupgradeneeded = () => {
        const stores: Array<[string, boolean]> = [
          ['prefs', false],
          ['mastery', false],
          ['srs', false],
          ['xpLevel', false],
          ['streaks', false],
          ['achievements', false],
          ['inventory', false],
          ['history', true],
        ]
        for (const [name, autoIncrement] of stores) {
          if (request.result.objectStoreNames.contains(name)) continue
          request.result.createObjectStore(
            name,
            autoIncrement ? { keyPath: 'id', autoIncrement: true } : { keyPath: 'id' },
          )
        }
      }
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })

    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction('prefs', 'readwrite')
      for (const [id, value] of payload.entries) {
        transaction.objectStore('prefs').put({ id, value })
      }
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
    db.close()
  }, { entries })

  await page.evaluate((value) => window.localStorage.setItem('lamed-theme', value), theme)
  await page.goto('/#/app')
  // Hash navigation does not remount the providers, so force a fresh read of IndexedDB.
  await page.reload()
}

export async function readPref(page: Page, id: string): Promise<unknown> {
  return page.evaluate(async (key) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('theoria')
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    const record = await new Promise<{ id: string; value: unknown } | undefined>(
      (resolve, reject) => {
        const request = db.transaction('prefs').objectStore('prefs').get(key)
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      },
    )
    db.close()
    return record?.value
  }, id)
}

export async function waitForDashboard(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/app$/)
  await expect(page.getByText('Exam readiness').first()).toBeVisible({ timeout: 20000 })
}

/** Completes the five-step LAMED+ onboarding in English. */
export async function completeOnboarding(page: Page): Promise<void> {
  await page.goto('/#/welcome')

  await expect(
    page.getByRole('heading', { name: 'Which language do you want to study in?' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()

  await expect(
    page.getByRole('heading', { name: 'What should we call you?' }),
  ).toBeVisible()
  await page.locator('#ob-name').fill('Dana')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()

  await expect(
    page.getByRole('heading', { name: 'What are you preparing for?' }),
  ).toBeVisible()
  await page.getByRole('radio', { name: /Private car \(B\)/ }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()

  await expect(page.getByRole('heading', { name: 'Where are you today?' })).toBeVisible()
  await page.getByRole('radio', { name: /Already studying/ }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()

  await expect(page.getByRole('heading', { name: 'Set a daily goal' })).toBeVisible()
  await page.getByRole('radio', { name: /^30/ }).click()
  await page.getByRole('button', { name: 'Start learning' }).click()

  await waitForDashboard(page)
}
