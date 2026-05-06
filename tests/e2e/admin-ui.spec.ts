import { expect, test } from '@playwright/test';

const UI_BASE = '/admin/eval-harness';

import type { Page } from '@playwright/test';

const getNav = (page: Page) => page.getByRole('navigation');

test.describe('eval harness admin screens', () => {
  test('1) dashboard renders route-aware with 7-day summary', async ({ page }) => {
    await page.goto(UI_BASE);

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByText('Eval Harness UI')).toBeVisible();
    await expect(page.getByText('Reports total')).toBeVisible();
    await expect(page.getByText('Reports total').locator('..').locator('p').filter({ hasText: /^3$/ })).toBeVisible();
    await expect(page.getByText('Latest Macro F1')).toBeVisible();
    await expect(page.getByText('Latest Macro F1').locator('..').locator('p').filter({ hasText: '94.2%' })).toBeVisible();
    await expect(getNav(page).getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', `${UI_BASE}`);
    await expect(page.getByText('rag.faq · 94.2%')).toBeVisible();
  });

  test('2) reports list filters and opens report detail', async ({ page }) => {
    await page.goto(`${UI_BASE}/reports`);

    await expect(page.getByRole('heading', { name: 'Reports list' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Dataset' }).fill('rag.faq');
    await expect(page.getByRole('cell', { name: 'rep-2026-05-06' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'rep-2026-05-05' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'rep-2026-05-04' })).not.toBeVisible();

    await page.locator('tbody tr').filter({ hasText: 'rep-2026-05-06' }).getByRole('link', { name: 'Open', exact: true }).click();
    await expect(page.getByRole('heading', { name: /Reports\s+list.*rag\.faq/i })).toBeVisible();
    await expect(page.getByText('macro_f1')).toBeVisible();

    await page.getByRole('button', { name: 'Summary' }).click();
    await expect(page.getByRole('heading', { name: 'Summary' })).toBeVisible();

    await page.getByRole('button', { name: 'Cohorts' }).click();
    await expect(page.getByRole('heading', { name: 'Cohorts' })).toBeVisible();

    await page.getByRole('button', { name: 'Histograms' }).click();
    await expect(page.getByRole('heading', { name: 'Histograms' })).toBeVisible();

    await page.getByRole('button', { name: 'Failures' }).click();
    await expect(page.getByRole('heading', { name: 'Failures' })).toBeVisible();
    await expect(page.getByText('formatting')).toBeVisible();

    await page.getByRole('button', { name: 'Raw JSON' }).click();
    await expect(page.getByRole('heading', { name: 'Raw JSON' })).toBeVisible();
    await expect(page.getByText('\"outcome\": \"ok\"')).toBeVisible();

    await page.getByRole('link', { name: '← back' }).click();
    await expect(page).toHaveURL(`${UI_BASE}/reports`);
  });

  test('3) compare page pairs reports and applies latest-vs-previous shortcut', async ({ page }) => {
    await page.goto(`${UI_BASE}/compare`);

    await expect(page.getByRole('heading', { name: 'Compare reports' })).toBeVisible();
    await page.getByRole('combobox', { name: 'Dataset' }).selectOption('rag.faq');
    await page.getByRole('button', { name: 'Compare latest vs previous' }).click();
    await expect(page.getByRole('heading', { name: /^Diff / })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'macro_f1' })).toBeVisible();
    await page.getByRole('combobox', { name: /left/i }).selectOption('rep-2026-05-06');
    await page.getByRole('combobox', { name: /right/i }).selectOption('rep-2026-05-05');
    await page.getByRole('button', { name: 'Compare', exact: true }).click();
    await expect(page.getByRole('heading', { name: /Diff rep-2026-05-06 vs rep-2026-05-05/i })).toBeVisible();
  });

  test('4) dataset trend shows series + overlays', async ({ page }) => {
    await page.goto(`${UI_BASE}/trend`);
    await expect(page.getByRole('heading', { name: 'Dataset trend' })).toBeVisible();

    await page.getByRole('combobox', { name: 'Dataset' }).selectOption('rag.faq');
    await page.getByRole('combobox', { name: 'Metric' }).selectOption('exact-match.mean');
    await page.getByRole('combobox', { name: 'Limit' }).selectOption('50');
    await page.getByRole('combobox', { name: 'Cohort' }).selectOption('all');
    await page.getByLabel('Token usage overlay').check();
    await page.getByLabel('Latency overlay').check();

    await expect(page.getByRole('heading', { name: 'Dataset trend: rag.faq' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Dataset trend: rag.faq' }).locator('..').locator('span', { hasText: /^2026-05-06$/ }).first()).toBeVisible();
    await expect(page.getByText('Metric: exact-match.mean')).toBeVisible();
  });

  test('5) adversarial list opens detail with cohorts and failures', async ({ page }) => {
    await page.goto(`${UI_BASE}/adversarial`);
    await expect(page.getByRole('heading', { name: 'Adversarial manifests' })).toBeVisible();
    await page.getByRole('row', { name: /nightly-red-team/ }).getByRole('link', { name: 'Open', exact: true }).click();

    await expect(page.getByRole('heading', { name: /Manifest nightly-red-team/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Cohorts' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Top failures' })).toBeVisible();
    await expect(page.getByRole('link', { name: '← back' })).toBeVisible();
  });

  test('6) live batches stream progress and allow manual refresh', async ({ page }) => {
    await page.goto(`${UI_BASE}/live-batches`);
    await expect(page.getByRole('heading', { name: 'Live batches' })).toBeVisible();

    await expect(page.getByRole('cell', { name: 'batch-01' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'batch-02' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Refresh|Loading.../ })).toBeVisible();

    await page.getByRole('button', { name: /Refresh|Loading.../ }).click();
    await expect(page.getByText('820s')).toBeVisible();
  });

  test('7) app shell navigation stays inside ui base and supports route reload', async ({ page }) => {
    await page.goto(UI_BASE);
    await getNav(page).getByRole('link', { name: /reports list|reports/i }).click();
    await expect(page).toHaveURL(`${UI_BASE}/reports`);

    await page.goto(`${UI_BASE}/trend`);
    await expect(page.getByRole('heading', { name: 'Dataset trend' })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Dataset trend' })).toBeVisible();

    await page.goto(`${UI_BASE}/adversarial`);
    await expect(page.getByRole('heading', { name: 'Adversarial manifests' })).toBeVisible();
    await getNav(page).getByRole('link', { name: 'Dashboard' }).click();
    await expect(page).toHaveURL(`${UI_BASE}`);
  });
});
