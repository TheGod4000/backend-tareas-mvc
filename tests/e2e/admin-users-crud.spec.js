'use strict';

const { test, expect, request: pwRequest } = require('@playwright/test');
const { API, apiLogin, mutate, cleanupTestData } = require('./_helpers/api');

test.describe.serial('Admin Users CRUD (API)', () => {
  let ctx;
  const ts = Date.now();
  const username = `e2e_user_${ts}`;
  const password = 'TempPass123!';
  const initialEmail = `${username}@example.com`;
  const updatedEmail = `${username}_updated@example.com`;
  let createdId;

  test.beforeAll(async () => {
    ctx = await pwRequest.newContext();
    await apiLogin(ctx, 'admin', 'Admin123!');
  });

  test.afterAll(async () => {
    if (ctx) {
      await cleanupTestData(ctx).catch(() => {});
      await ctx.dispose();
    }
  });

  test('create a new user', async () => {
    const res = await mutate(ctx, 'POST', `${API}/users`, {
      username,
      email: initialEmail,
      password,
      role: 'user',
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    const user = body.user || body;
    expect(user).toBeTruthy();
    expect(user.username).toBe(username);
    expect(user.email).toBe(initialEmail);
    expect(user.role).toBe('user');
    expect(user.id).toBeTruthy();
    createdId = user.id;
  });

  test('GET the new user by id', async () => {
    expect(createdId).toBeTruthy();
    const res = await ctx.get(`${API}/users/${createdId}`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    const user = body.user || body;
    expect(user.username).toBe(username);
    expect(user.email).toBe(initialEmail);
  });

  test('PUT updates the email', async () => {
    expect(createdId).toBeTruthy();
    const res = await mutate(ctx, 'PUT', `${API}/users/${createdId}`, {
      email: updatedEmail,
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const user = body.user || body;
    expect(user.email).toBe(updatedEmail);
  });

  test('creating a duplicate username returns 4xx', async () => {
    const res = await mutate(ctx, 'POST', `${API}/users`, {
      username, // same as the one we just created
      email: `${username}_dup@example.com`,
      password,
      role: 'user',
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
    expect(res.status()).toBeLessThan(500);
  });

  test('DELETE the user', async () => {
    expect(createdId).toBeTruthy();
    const del = await mutate(ctx, 'DELETE', `${API}/users/${createdId}`);
    expect([200, 204]).toContain(del.status());

    const after = await ctx.get(`${API}/users/${createdId}`);
    expect(after.status()).toBe(404);
  });
});
