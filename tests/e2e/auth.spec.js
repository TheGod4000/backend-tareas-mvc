'use strict';

const { test, expect, request: pwRequest } = require('@playwright/test');
const { API } = require('./_helpers/api');
const { loginUI } = require('./_helpers/ui');

test.describe('Auth', () => {
  test('invalid login shows an error in the UI', async ({ page }) => {
    await page.goto('/login');
    await page
      .locator('[data-testid=login-username] input')
      .fill('admin');
    await page
      .locator('[data-testid=login-password] input')
      .fill('totally-wrong-password');

    // Capture any browser dialog (some apps fall back to alert()).
    let alertText = '';
    page.once('dialog', async (d) => {
      alertText = d.message();
      await d.dismiss().catch(() => {});
    });

    await page.locator('[data-testid=login-submit]').click();

    // Either the inline error appears OR an alert was shown.
    const errorLocator = page.locator('[data-testid=login-error]');
    const visible = await errorLocator
      .waitFor({ state: 'visible', timeout: 5_000 })
      .then(() => true)
      .catch(() => false);

    if (visible) {
      const text = (await errorLocator.textContent()) || '';
      expect(text.length).toBeGreaterThan(0);
    } else {
      expect(alertText.toLowerCase()).toContain('invalid');
    }

    // We must still be on the login route.
    expect(page.url()).toContain('/login');
  });

  test('admin login + me shows admin nav', async ({ page }) => {
    await loginUI(page, 'admin', 'Admin123!');
    await expect(page).toHaveURL(/\/tasks$/);
    await expect(page.locator('[data-testid=admin-users-link]')).toBeVisible();
    await expect(
      page.locator('[data-testid=advanced-search-link]')
    ).toBeVisible();
    await expect(page.locator('[data-testid=current-user]')).toContainText(
      'admin'
    );
  });

  test('regular user login hides admin nav', async ({ page }) => {
    await loginUI(page, 'user', 'User123!');
    await expect(page).toHaveURL(/\/tasks$/);
    await expect(page.locator('[data-testid=admin-users-link]')).toHaveCount(
      0
    );
    await expect(
      page.locator('[data-testid=advanced-search-link]')
    ).toHaveCount(0);
    await expect(page.locator('[data-testid=current-user]')).toContainText(
      'user'
    );
  });

  test('GET /auth/me without cookie returns 401', async () => {
    const ctx = await pwRequest.newContext();
    try {
      const res = await ctx.get(`${API}/auth/me`);
      expect(res.status()).toBe(401);
    } finally {
      await ctx.dispose();
    }
  });
});
