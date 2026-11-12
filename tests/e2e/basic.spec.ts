import { expect, test } from '@playwright/test'
import { seedPrefs } from './helpers'

test.describe('LAMED+ landing and shell', () => {
  test('landing communicates the product and exposes a clear CTA', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Theory is not a memory test.',
    )
    await expect(page.getByRole('link', { name: 'Start learning' }).first()).toBeVisible()
    await expect(page.getByText('1,841 official questions')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Works offline' })).toBeVisible()
  })

  test('language switch changes locale and direction', async ({ page }) => {
    await page.goto('/')

    const picker = page.locator('button[aria-haspopup="listbox"]')
    await picker.click()
    await page.getByRole('option', { name: 'Русский' }).click()

    await expect(page.locator('html')).toHaveAttribute('lang', 'ru')
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr')
    await expect(page.getByText('Учись правильно. Дойди безопасно.')).toBeVisible()

    await picker.click()
    await page.getByRole('option', { name: 'العربية' }).click()

    await expect(page.locator('html')).toHaveAttribute('lang', 'ar')
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    await expect(page.getByText('تعلّم صحيحًا. وصل بأمان.')).toBeVisible()
  })

  test('theme choice survives a reload', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')

    await page.getByRole('button', { name: 'Night mode' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  })

  test('mobile layout has no horizontal overflow and keeps bottom navigation', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await seedPrefs(page)

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(1)

    await expect(page.getByRole('navigation', { name: 'Home' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Learn' }).last()).toBeVisible()
  })

  test('French landing uses the translated catalogue', async ({ page }) => {
    await page.goto('/')

    const picker = page.locator('button[aria-haspopup="listbox"]')
    await picker.click()
    await page.getByRole('option', { name: 'Français' }).click()

    await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      "La théorie n'est pas un test de mémoire.",
    )
    await expect(page.getByText('Fonctionne hors ligne').first()).toBeVisible()
  })
})
