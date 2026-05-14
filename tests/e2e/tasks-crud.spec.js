'use strict';

const { test, expect, request: pwRequest } = require('@playwright/test');
const { API, apiLogin, mutate, cleanupTestData } = require('./_helpers/api');

test.describe.serial('Tasks CRUD (API, regular user)', () => {
  let ctx;
  let adminCtx;
  const ts = Date.now();
  const title = `e2e_task_${ts}`;
  let createdId;
  let workTagId;
  let homeTagId;

  test.beforeAll(async () => {
    ctx = await pwRequest.newContext();
    await apiLogin(ctx, 'user', 'User123!');

    // Look up the seeded tag ids.
    const res = await ctx.get(`${API}/tags`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    const tags = body.tags || body || [];
    const findId = (name) => {
      const t = tags.find(
        (x) => (x.name || '').toLowerCase() === name.toLowerCase()
      );
      return t ? t.id : null;
    };
    workTagId = findId('work');
    homeTagId = findId('home');
    expect(workTagId).toBeTruthy();
    expect(homeTagId).toBeTruthy();
  });

  test.afterAll(async () => {
    if (ctx) await ctx.dispose();
    // Use a fresh admin context for cleanup so we don't disturb the user ctx.
    adminCtx = await pwRequest.newContext();
    await cleanupTestData(adminCtx).catch(() => {});
    await adminCtx.dispose();
  });

  test('create a task with two tags', async () => {
    const res = await mutate(ctx, 'POST', `${API}/tasks`, {
      title,
      description: 'created by e2e',
      status: 'todo',
      tagIds: [workTagId, homeTagId],
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    const task = body.task || body;
    expect(task.title).toBe(title);
    expect(task.status).toBe('todo');
    expect(Array.isArray(task.tags)).toBe(true);
    const names = task.tags.map((t) => t.name).sort();
    expect(names).toEqual(['home', 'work']);
    createdId = task.id;
    expect(createdId).toBeTruthy();
  });

  test('list contains the new task', async () => {
    const res = await ctx.get(`${API}/tasks`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    const tasks = body.tasks || [];
    const found = tasks.find((t) => t.id === createdId);
    expect(found).toBeTruthy();
    expect(found.title).toBe(title);
  });

  test('PUT updates the status to done', async () => {
    const res = await mutate(ctx, 'PUT', `${API}/tasks/${createdId}`, {
      status: 'done',
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const task = body.task || body;
    expect(task.status).toBe('done');

    // Re-fetch to confirm persistence.
    const after = await ctx.get(`${API}/tasks/${createdId}`);
    expect(after.status()).toBe(200);
    const afterBody = await after.json();
    const afterTask = afterBody.task || afterBody;
    expect(afterTask.status).toBe('done');
  });

  test('DELETE then GET returns 404', async () => {
    const del = await mutate(ctx, 'DELETE', `${API}/tasks/${createdId}`);
    expect([200, 204]).toContain(del.status());

    const after = await ctx.get(`${API}/tasks/${createdId}`);
    expect(after.status()).toBe(404);
  });
});
