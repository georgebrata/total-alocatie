import { test, expect } from '@playwright/test'

test('guest calculator starts with transparent legal coverage', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /înțelege ce poate fi calculat/i })).toBeVisible()
  await expect(page.getByText(/datasetul de producție nu are încă reguli istorice activate/i)).toBeVisible()
})
