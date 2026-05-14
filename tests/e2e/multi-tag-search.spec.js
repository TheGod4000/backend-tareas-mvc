'use strict';

const { test, expect, request: pwRequest } = require('@playwright/test');
const { API, apiLogin, mutate, cleanupTestData } = require('./_helpers/api');
const { loginUI } = require('./_helpers/ui');

// Shared setup data — same task names are reused by both the API test and the
// UI test. We create them once in beforeAll and clean them up in afterAll.
const ts = Date.now();
const TITLE_A = `e2e_task_search_a_${ts}`;
const TITLE_B = `e2e_task_search_b_${ts}`;
const TITLE_C = `e2e_task_search_c_${ts}`;

let createdIds = [];
let tagIdByName = {};

async function ensureTaskAsUser(ctx, title, tagIds) {
  const res = await mutate(ctx, 'POST', `${API}/tasks`, {
    title,
    description: `seed for ${title}`,
    status: 'todo',
    tagIds,
  });
  expect(res.status(), `creating ${title}`).toBe(201);
  const body = await res.json();
  const task = body.task || body;
  return task;
}

test.describe.serial('Multi-tag search', () => {
  let userCtx;

  test.beforeAll(async () => {
    // Pre-clean any leftovers from a previous run.
    const cleanup = await pwRequest.newContext();
    await cleanupTestData(cleanup).catch(() => {});
    await cleanup.dispose();

    userCtx = await pwRequest.newContext();
    await apiLogin(userCtx, 'user', 'User123!');

    // Resolve seeded tag ids by name.
    const res = await userCtx.get(`${API}/tags`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    const tags = body.tags || body || [];
    for (const t of tags) tagIdByName[(t.name || '').toLowerCase()] = t.id;
    expect(tagIdByName.work).toBeTruthy();
    expect(tagIdByName.urgent).toBeTruthy();
    expect(tagIdByName.home).toBeTruthy();

    // Seed three tasks owned by `user`.
    const a = await ensureTaskAsUser(userCtx, TITLE_A, [
      tagIdByName.work,
      tagIdByName.urgent,
    ]);
    const b = await ensureTaskAsUser(userCtx, TITLE_B, [
      tagIdByName.home,
      tagIdByName.urgent,
    ]);
    const c = await ensureTaskAsUser(userCtx, TITLE_C, [tagIdByName.work]);
    createdIds = [a.id, b.id, c.id];
  });

  test.afterAll(async () => {
    if (userCtx) await userCtx.dispose();
    const cleanup = await pwRequest.newContext();
    await cleanupTestData(cleanup).catch(() => {});
    await cleanup.dispose();
  });

  test('API: AND mode returns only tasks with BOTH tags', async () => {
    const res = await userCtx.get(
      `${API}/tasks/search?tags=work,urgent&mode=and`
    );
    expect(res.status()).toBe(200);
    const body = await res.json();
    const titles = (body.tasks || []).map((t) => t.title);
    expect(titles).toContain(TITLE_A);
    expect(titles).not.toContain(TITLE_B);
    expect(titles).not.toContain(TITLE_C);
  });

  test('API: OR mode returns tasks with ANY of the tags', async () => {
    const res = await userCtx.get(
      `${API}/tasks/search?tags=work,urgent&mode=or`
    );
    expect(res.status()).toBe(200);
    const body = await res.json();
    const titles = (body.tasks || []).map((t) => t.title);
    expect(titles).toContain(TITLE_A);
    expect(titles).toContain(TITLE_B);
    expect(titles).toContain(TITLE_C);
  });

  test('UI: combobox + AND/OR toggles filter the table', async ({ page }) => {
    await loginUI(page, 'user', 'User123!');
    await expect(page).toHaveURL(/\/tasks$/);

    // The Vuetify combobox renders an <input> inside the wrapper. Type each
    // tag name + Enter to commit it as a chip.
    const comboInput = page.locator(
      '[data-testid=task-search-tags] input'
    );
    await comboInput.click();
    await comboInput.fill('work');
    await comboInput.press('Enter');
    await comboInput.fill('urgent');
    await comboInput.press('Enter');

    // AND mode.
    await page.locator('[data-testid=search-mode-and]').click();
    await page.locator('[data-testid=task-search-go]').click();

    // Wait for table to reflect filtered results.
    const rows = page.locator('[data-testid=task-row]');
    await expect
      .poll(async () => {
        const texts = await rows.allTextContents();
        return texts.join('\n');
      }, { timeout: 8_000 })
      .toContain(TITLE_A);

    let allText = (await rows.allTextContents()).join('\n');
    expect(allText).toContain(TITLE_A);
    expect(allText).not.toContain(TITLE_B);

    // OR mode.
    await page.locator('[data-testid=search-mode-or]').click();
    await page.locator('[data-testid=task-search-go]').click();

    await expect
      .poll(async () => (await rows.allTextContents()).join('\n'), {
        timeout: 8_000,
      })
      .toContain(TITLE_B);

    allText = (await rows.allTextContents()).join('\n');
    expect(allText).toContain(TITLE_A);
    expect(allText).toContain(TITLE_B);
    expect(allText).toContain(TITLE_C);
  });
});
