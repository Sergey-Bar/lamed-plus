import { readFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'
import { seedPrefs } from './helpers'

test('a learner can report a question from practice', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await seedPrefs(page)
  await page.goto('/#/practice?topic=laws')

  await page.getByRole('button', { name: 'Start round' }).click()
  await expect(page.getByText('1 of 10')).toBeVisible()
  await page.locator('[role="radio"], [role="checkbox"]').first().click()
  await expect(page.getByText(/Correct! Keep going\.|Not this time\. The correct answer is marked\./)).toBeVisible()

  const report = page.getByRole('button', { name: 'Report a question' })
  await expect(report).toBeVisible()
  await report.click()

  await expect(page.getByText(/Report copied|A report message was opened/)).toBeVisible()

  const reportText = await page.evaluate(() => navigator.clipboard.readText())
  expect(reportText).toContain('question report')
  expect(reportText).toContain('Question:')
  expect(reportText).toContain('Category: B')
  expect(reportText).toContain('Selected:')
  expect(reportText).toContain('What is wrong or unclear?')
})

test('settings shows data provenance, exports the test date and asks for persistence', async ({
  page,
}) => {
  await seedPrefs(page, { testDate: '2027-03-04' })
  await page.goto('/#/settings')

  await expect(page.getByRole('heading', { name: 'Data and storage' })).toBeVisible()

  // Bank provenance: a real count and a real import date, not placeholders.
  await expect(page.getByText('Questions in the bank')).toBeVisible()
  await expect(page.getByText('Bank updated').locator('..')).toContainText(/\d{4}/)
  await expect(page.getByText('Authored explanations').locator('..')).toContainText(/\d+/)

  // Calendar export: a real .ics download for the saved test date.
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Add to calendar' }).click()
  const file = await download
  expect(file.suggestedFilename()).toBe('lamed-test-2027-03-04.ics')
  const ics = await readFile((await file.path())!, 'utf8')
  expect(ics).toContain('BEGIN:VCALENDAR')
  expect(ics).toContain('DTSTART;VALUE=DATE:20270304')
  expect(ics).toContain('TRIGGER:-P1D')

  // Storage: a real status line. The request button only exists when the
  // browser has not granted persistence yet, and some profiles already have it.
  const request = page.getByRole('button', { name: 'Request persistent storage' })
  if (await request.count()) {
    await request.click()
    await expect(
      page.getByText(/Persistent storage granted\.|did not grant persistent storage/),
    ).toBeVisible()
  } else {
    await expect(
      page.getByText('Persistent — the browser should not evict your data.'),
    ).toBeVisible()
  }
})
