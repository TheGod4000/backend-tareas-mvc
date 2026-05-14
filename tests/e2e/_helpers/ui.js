'use strict';

// Tiny UI helpers — keep specs short and readable.
//
// The Vue SPA uses Vuetify components. We rely on the data-testid attributes
// the views already expose so that selector behaviour is stable even if
// styling changes.

const { expect } = require('@playwright/test');

async function loginUI(page, username, password) {
  await page.goto('/login');
  await page.locator('[data-testid=login-username] input').fill(username);
  await page.locator('[data-testid=login-password] input').fill(password);
  await Promise.all([
    page.waitForURL((url) => !url.pathname.startsWith('/login'), {
      timeout: 10_000,
    }),
    page.locator('[data-testid=login-submit]').click(),
  ]);
}

async function logoutUI(page) {
  const btn = page.locator('[data-testid=logout-btn]');
  if (await btn.isVisible().catch(() => false)) {
    await Promise.all([
      page.waitForURL('**/login', { timeout: 10_000 }).catch(() => {}),
      btn.click(),
    ]);
  }
}

module.exports = { loginUI, logoutUI, expect };
