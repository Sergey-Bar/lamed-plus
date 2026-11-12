import { expect, test } from '@playwright/test'
import { completeOnboarding, readPref, seedPrefs, waitForDashboard } from './helpers'

test.describe('Critical LAMED+ journeys', () => {
  test('onboarding builds a route and persists it', async ({ page }) => {
    await completeOnboarding(page)

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Dana')
    await expect(page.getByText('Next step', { exact: true })).toBeVisible()
    await expect(page.getByText('/ 30', { exact: true })).toBeVisible()

    await page.reload()
    await waitForDashboard(page)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Dana')
  })

  test('a lesson can be completed and advances to the next lesson', async ({ page }) => {
    await seedPrefs(page)
    await page.goto('/#/learn/laws/laws-speed')

    await page.getByRole('button', { name: 'Finish lesson' }).click()
    await expect(page.getByText('Lesson complete')).toBeVisible()

    await expect.poll(() => readPref(page, 'lessons')).toContain('laws-speed')
    await page.reload()

    await expect(page.getByText('Completed').first()).toBeVisible()
    await page.getByRole('link', { name: 'Next lesson' }).click()
    await expect(page).toHaveURL(/\/learn\/laws\/laws-right-of-way$/)
  })

  test('practice round gives feedback and reaches a summary', async ({ page }) => {
    await seedPrefs(page)
    await page.goto('/#/practice?topic=laws')

    await expect(page.getByRole('heading', { name: 'Practice' })).toBeVisible()
    await page.getByRole('button', { name: 'Start round' }).click()
    await expect(page.getByText('1 of 10')).toBeVisible()

    for (let index = 0; index < 10; index += 1) {
      await page.locator('[role="radio"], [role="checkbox"]').first().click()
      await expect(
        page.getByText(/Correct! Keep going\.|Not this time\. The correct answer is marked\./),
      ).toBeVisible()
      await page
        .getByRole('button', { name: index === 9 ? 'Finish' : 'Next question', exact: true })
        .click()
    }

    await expect(page.getByRole('heading', { name: 'Round complete' })).toBeVisible()
    await expect(page.getByText(/of 10 correct/)).toBeVisible()
  })

  test('active exam runs in focus mode, hides ads and produces results', async ({ page }) => {
    await seedPrefs(page)
    await page.goto('/#/exam/B')

    const begin = page.getByRole('button', { name: 'Begin exam' })
    await expect(begin).toBeEnabled({ timeout: 20000 })
    await begin.click()

    await expect(page.getByText(/^\d{2}:\d{2}$/).first()).toBeVisible()
    await expect(page.locator('nav a')).toHaveCount(0)
    await expect(page.locator('[aria-label="Sponsored"]')).toHaveCount(0)

    await page.getByRole('button', { name: 'Flag for review' }).click()
    await expect(page.getByRole('button', { name: 'Flagged', exact: true })).toBeVisible()

    await page.getByRole('button', { name: 'Submit exam' }).first().click()
    await expect(page.getByRole('heading', { name: 'Submit the exam?' })).toBeVisible()
    await page.getByRole('button', { name: 'Submit exam' }).last().click()

    await expect(page.getByRole('heading', { name: 'Not this time' })).toBeVisible()
    await expect(page.getByText('0/30')).toBeVisible()
    await expect(page.getByText(/Exam results/)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Review answers' })).toBeVisible()
  })

  test('legacy study links redirect and the sign library renders', async ({ page }) => {
    await seedPrefs(page)

    await page.goto('/#/study')
    await expect(page).toHaveURL(/\/learn$/)
    await expect(page.getByRole('heading', { name: 'Learn' })).toBeVisible()

    await page.goto('/#/signs')
    await expect(page.getByRole('heading', { name: 'Sign library' })).toBeVisible()
    await expect(page.getByPlaceholder('Search a sign or meaning')).toBeVisible()
  })

  test('A3 electric-bicycle exam uses its own 30-question format', async ({ page }) => {
    await seedPrefs(page, { defaultCategory: 'A3' })
    await page.goto('/#/exam/A3')

    await expect(page.getByText('Electric bicycle (A3)').first()).toBeVisible()
    const begin = page.getByRole('button', { name: 'Begin exam' })
    await expect(begin).toBeEnabled({ timeout: 20000 })
    await begin.click()

    await expect(page.getByText(/1 of 30/)).toBeVisible()
    await expect(page.getByText(/^\d{2}:\d{2}$/).first()).toBeVisible()
    await expect(page.locator('[aria-label="Sponsored"]')).toHaveCount(0)
  })

  test('accessibility controls apply immediately and survive a reload', async ({ page }) => {
    await seedPrefs(page)
    await page.goto('/#/settings')

    await page.getByRole('switch', { name: /High contrast/ }).click()
    await expect(page.locator('html')).toHaveAttribute('data-contrast', 'high')

    await page.getByRole('radio', { name: /A\+\+.*125%/ }).click()
    await expect
      .poll(() =>
        page.evaluate(() =>
          getComputedStyle(document.documentElement).getPropertyValue('--a11y-text-scale').trim(),
        ),
      )
      .toBe('1.25')

    await page.getByRole('switch', { name: /Reduce motion/ }).click()
    await expect(page.locator('html')).toHaveAttribute('data-a11y-motion', 'reduce')

    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-contrast', 'high')
    await expect(page.locator('html')).toHaveAttribute('data-a11y-motion', 'reduce')
  })
})
