'use strict';

const { test, expect, request: pwRequest } = require('@playwright/test');
const { API, apiLogin, readCookie, cleanupTestData } = require('./_helpers/api');

test.describe.serial('CSRF protection', () => {
  let ctx;
  const ts = Date.now();

  test.beforeAll(async () => {
    ctx = await pwRequest.newContext();
    await apiLogin(ctx, 'user', 'User123!');
  });

  test.afterAll(async () => {
    const adminCtx = await pwRequest.newContext();
    await apiLogin(adminCtx, 'admin', 'Admin123!').catch(() => {});
    await cleanupTestData(adminCtx).catch(() => {});
    await adminCtx.dispose();
    if (ctx) await ctx.dispose();
  });

  test('GET /tasks succeeds without csrf header (safe method)', async () => {
    const res = await ctx.get(`${API}/tasks`);
    expect(res.status()).toBe(200);
  });

  test('POST /tasks WITHOUT x-csrf-token header → 403', async () => {
    const res = await ctx.post(`${API}/tasks`, {
      data: { title: `e2e_csrf_missing_${ts}` },
      // intentionally NO x-csrf-token header
    });
    expect(res.status()).toBe(403);
    const body = await res.json().catch(() => ({}));
    const msg = (body.error || body.message || '').toString().toLowerCase();
    expect(msg).toContain('csrf');
  });

  test('POST /tasks with WRONG x-csrf-token header → 403', async () => {
    const res = await ctx.post(`${API}/tasks`, {
      data: { title: `e2e_csrf_wrong_${ts}` },
      headers: { 'x-csrf-token': 'definitely-not-the-real-token' },
    });
    expect(res.status()).toBe(403);
  });

  test('POST /tasks WITH valid cookie + matching header → 201', async () => {
    const csrf = await readCookie(ctx, 'csrf_token');
    expect(csrf).toBeTruthy();
    const res = await ctx.post(`${API}/tasks`, {
      data: { title: `e2e_csrf_ok_${ts}` },
      headers: { 'x-csrf-token': csrf },
    });
    expect(res.status()).toBe(201);
  });
});
