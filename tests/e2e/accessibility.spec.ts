import { AxeBuilder } from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import type { Result } from 'axe-core';
import type { Page } from '@playwright/test';

const UI_BASE = '/admin/eval-harness';

const assertNoSeriousA11yIssues = async (page: Page, contextLabel: string) => {
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'section508'])
    .analyze();

  const hardViolations = result.violations.filter(
    (violation: Result) => violation.impact === 'serious' || violation.impact === 'critical',
  );

  const details = hardViolations.map((violation: Result) => `${violation.id}: ${violation.help}`).join('\n');
  expect(hardViolations, `${contextLabel} serious/critical violations:\n${details}`).toEqual([]);
};

test.describe('accessibility smoke', () => {
  test('dashboard meets WCAG 2.0 AA + Section 508 critical checks', async ({ page }) => {
    await page.goto(UI_BASE);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await assertNoSeriousA11yIssues(page, 'Dashboard');
  });

  test('report detail meets WCAG 2.0 AA + Section 508 critical checks', async ({ page }) => {
    await page.goto(`${UI_BASE}/reports`);
    await expect(page.getByRole('heading', { name: 'Reports list' })).toBeVisible();

    await page.getByRole('textbox', { name: 'Dataset' }).fill('rag.faq');
    await page.locator('tbody tr').filter({ hasText: 'rep-2026-05-06' }).getByRole('link', { name: 'Open', exact: true }).click();

    await expect(page.getByRole('heading', { name: /Reports list/ })).toBeVisible();
    await expect(page.getByText('macro_f1')).toBeVisible();
    await assertNoSeriousA11yIssues(page, 'Report detail');
  });

  test('trend screen meets WCAG 2.0 AA + Section 508 critical checks', async ({ page }) => {
    await page.goto(`${UI_BASE}/trend`);
    await expect(page.getByRole('heading', { name: 'Dataset trend' })).toBeVisible();

    await page.getByRole('combobox', { name: 'Dataset' }).selectOption('rag.faq');
    await expect(page.getByRole('heading', { name: 'Dataset trend: rag.faq' })).toBeVisible();
    await assertNoSeriousA11yIssues(page, 'Trend');
  });
});
