import { expect, test } from '@playwright/test';

const UI_BASE = '/admin/eval-harness';

test.describe('online monitoring screen', () => {
  test('renders pass-rate trend and drift alert below threshold', async ({ page }) => {
    await page.goto(`${UI_BASE}/online-monitoring`);

    await expect(page.getByRole('heading', { name: 'Online monitoring', exact: true })).toBeVisible();

    await page.getByRole('combobox', { name: 'Dataset' }).selectOption('rag.faq');

    // Accessible chart contract: role=img + visually-hidden data table.
    await expect(page.getByRole('img', { name: /pass rate/i })).toBeVisible();
    await expect(page.getByRole('cell', { name: '2026-06-14' })).toBeVisible();

    // Latest point 0.72 < 0.8 threshold -> drift alert visible.
    await expect(page.getByText(/pass rate dropped below/i)).toBeVisible();
  });
});
