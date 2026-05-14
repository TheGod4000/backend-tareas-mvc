'use strict';

const { test, expect, request: pwRequest } = require('@playwright/test');
const { API, apiLogin, mutate, cleanupTestData } = require('./_helpers/api');
const { loginUI } = require('./_helpers/ui');

test.describe.serial('Admin advanced search', () => {
  let adminCtx;
  let userCtx;
  const ts = Date.now();
  const titleA = `e2e_task_adv_a_${ts}`;
  const titleB = `e2e_task_adv_b_${ts}`;

  test.beforeAll(async () => {
    adminCtx = await pwRequest.newContext();
    userCtx = await pwRequest.newContext();
    await apiLogin(adminCtx, 'admin', 'Admin123!');
    await apiLogin(userCtx, 'user', 'User123!');

    const tagsRes = await userCtx.get(`${API}/tags`);
    const tagBody = await tagsRes.json();
    const tags = tagBody.tags || tagBody || [];
    const work = tags.find((t) => t.name === 'work')?.id;
    const urgent = tags.find((t) => t.name === 'urgent')?.id;
    const home = tags.find((t) => t.name === 'home')?.id;

    // Two test tasks owned by `user`.
    const a = await mutate(userCtx, 'POST', `${API}/tasks`, {
      title: titleA,
      tagIds: [work, urgent],
    });
    expect(a.status()).toBe(201);
    const b = await mutate(userCtx, 'POST', `${API}/tasks`, {
      title: titleB,
      tagIds: [home],
    });
    expect(b.status()).toBe(201);
  });

  test.afterAll(async () => {
    await cleanupTestData(adminCtx).catch(() => {});
    if (adminCtx) await adminCtx.dispose();
    if (userCtx) await userCtx.dispose();
  });

  test('users-by-tags AND finds users owning tasks with all listed tags', async () => {
    const res = await adminCtx.get(
      `${API}/admin/search/users-by-tags?tags=work,urgent&mode=and`
    );
    expect(res.status()).toBe(200);
    const body = await res.json();
    const list = body.users || body || [];
    const usernames = list.map((u) => u.username);
    expect(usernames).toContain('user');
  });

  test('tasks-by-tags OR returns matching tasks across users', async () => {
    const res = await adminCtx.get(
      `${API}/admin/search/tasks-by-tags?tags=work&mode=or`
    );
    expect(res.status()).toBe(200);
    const body = await res.json();
    const list = body.tasks || body || [];
    const titles = list.map((t) => t.title);
    expect(titles).toContain(titleA);
  });

  test('tags-by-users OR returns the union of tags across listed users', async () => {
    const res = await adminCtx.get(
      `${API}/admin/search/tags-by-users?users=user&mode=or`
    );
    expect(res.status()).toBe(200);
    const body = await res.json();
    const list = body.tags || body || [];
    const names = list.map((t) => t.name);
    // user owns tasks tagged with at least work + urgent + home (titleA + titleB + seeded sample)
    expect(names).toEqual(expect.arrayContaining(['work', 'urgent', 'home']));
  });

  test('UI: users-by-tags AND surfaces "user" in results panel', async ({ page }) => {
    await loginUI(page, 'admin', 'Admin123!');
    await page.goto('/admin/search');

    const combo = page.locator('[data-testid=users-by-tags-input] input');
    await combo.fill('work');
    await combo.press('Enter');
    await combo.fill('urgent');
    await combo.press('Enter');

    await page.locator('[data-testid=ubt-mode-and]').click();
    await page.locator('[data-testid=users-by-tags-go]').click();

    await expect(
      page.locator('[data-testid=users-by-tags-results]')
    ).toContainText('user', { timeout: 10_000 });
  });
});
