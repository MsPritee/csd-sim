import { test, expect, type Page } from '@playwright/test'

/** Pick a K-map cell whose concrete value is `1` (for deterministic group interaction). */
async function clickOneCell(page: Page): Promise<void> {
  const cells = page.locator('[data-testid^="kmap-cell-"]')
  await expect(cells.first()).toBeVisible()
  const minterm = await cells.evaluateAll((els) => {
    for (const el of els) {
      const group = el.parentElement
      if (!group) continue
      const values = Array.from(group.querySelectorAll('text')).map((t) =>
        t.textContent?.trim(),
      )
      if (values.includes('1')) {
        const raw = el.getAttribute('data-testid')
        return raw ? Number(raw.split('-')[2]) : null
      }
    }
    return null
  })
  expect(minterm, 'expected at least one cell with value 1').not.toBeNull()
  await page.getByTestId(`kmap-cell-${minterm}`).click()
}

test.describe('App shell', () => {
  test('loads the home page', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'DigiWorld' })).toBeVisible()
    expect(await page.getByRole('button').count()).toBeGreaterThan(0)
  })
})

test.describe('K-map simulator', () => {
  test('solving the fixed Majority example reports an equivalent result', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Karnaugh Map Simulator' }).click()

    await page.getByRole('heading', { name: 'Karnaugh Map Simulator' }).first().waitFor()

    // Example Library is open by default; load the fixed Majority example.
    await page.getByRole('button', { name: /Majority Function \(3 variables\)/ }).click()

    const badge = page.getByTestId('verify-badge')
    await expect(badge).toBeVisible()
    await expect(badge).toContainText('Equivalent')
  })
})

test.describe('Practice flow', () => {
  test('starts a Guided session, forms a group, and reveals a hint', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Karnaugh Map Simulator' }).click()
    await page.getByRole('button', { name: 'Practice & Mastery' }).click()

    await expect(
      page.getByRole('heading', { name: 'Guided Learning & Mastery' }),
    ).toBeVisible()

    await page.getByRole('button', { name: /^Guided/ }).click()

    // A solvable problem is rendered with a grid and work surface.
    await expect(page.getByLabel('Simplified expression (SOP)')).toBeVisible()
    await expect(page.locator('[data-testid^="kmap-cell-"]').first()).toBeVisible()

    // Select one 1-minterm, add it as a group.
    await clickOneCell(page)
    await page.getByRole('button', { name: /Add selected \(1\) as group/ }).click()

    // The group is listed in the formed-groups panel (removable as "group 1").
    await expect(page.getByLabel('Remove group 1')).toBeVisible()

    // Guided mode exposes the progressive hint ladder.
    await page.getByRole('button', { name: 'Show hint' }).click()
    await expect(page.locator('text=/need a nudge/')).toBeVisible()
    await expect(page.locator('text=/Hint 1 —/')).toBeVisible()

    // Clear the group and the session returns to a clean slate.
    await page.getByRole('button', { name: 'Clear all groups' }).click()
    await expect(page.getByLabel('Remove group 1')).toHaveCount(0)
  })
})