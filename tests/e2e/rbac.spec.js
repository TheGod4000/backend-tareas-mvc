'use strict';

const { test, expect, request: pwRequest } = require('@playwright/test');
const { API, apiLogin, mutate, cleanupTestData } = require('./_helpers/api');

test.describe.serial('RBAC enforcement', () => {
  let userCtx;
  let adminCtx;
  let anyTagId;

  test.beforeAll(async () => {
    userCtx = await pwRequest.newContext();
    adminCtx = await pwRequest.newContext();
    await apiLogin(userCtx, 'user', 'User123!');
    await apiLogin(adminCtx, 'admin', 'Admin123!');

    const tagsRes = await adminCtx.get(`${API}/tags`);
    const body = await tagsRes.json();
    const tags = body.tags || body || [];
    anyTagId = tags[0]?.id;
    expect(anyTagId).toBeTruthy();
  });

  test.afterAll(async () => {
    await cleanupTestData(adminCtx).catch(() => {});
    if (userCtx) await userCtx.dispose();
    if (adminCtx) await adminCtx.dispose();
  });

  test('regular user → GET /users → 403', async () => {
    const res = await userCtx.get(`${API}/users`);
    expect(res.status()).toBe(403);
  });

  test('regular user → POST /users (with valid CSRF) → 403', async () => {
    const res = await mutate(userCtx, 'POST', `${API}/users`, {
      username: `e2e_rbac_${Date.now()}`,
      email: 'x@x.local',
      password: 'Pass123!',
      role: 'user',
    });
    expect(res.status()).toBe(403);
  });

  test('regular user → GET /admin/search/users-by-tags → 403', async () => {
    const res = await userCtx.get(
      `${API}/admin/search/users-by-tags?tags=work`
    );
    expect(res.status()).toBe(403);
  });

  test('regular user → PUT /tags/:id → 403', async () => {
    const res = await mutate(userCtx, 'PUT', `${API}/tags/${anyTagId}`, {
      name: `should_not_${Date.now()}`,
    });
    expect(res.status()).toBe(403);
  });

  test('admin → GET /users → 200', async () => {
    const res = await adminCtx.get(`${API}/users`);
    expect(res.status()).toBe(200);
  });

  test('admin → GET /admin/search/users-by-tags → 200', async () => {
    const res = await adminCtx.get(
      `${API}/admin/search/users-by-tags?tags=work`
    );
    expect(res.status()).toBe(200);
  });
});
