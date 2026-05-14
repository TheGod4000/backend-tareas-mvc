'use strict';

const { test, expect, request: pwRequest } = require('@playwright/test');
const { API, apiLogin, mutate, cleanupTestData } = require('./_helpers/api');

test.describe.serial('Tags CRUD (API)', () => {
  let adminCtx;
  let userCtx;
  const ts = Date.now();
  const tagName = `e2e_tag_${ts}`;
  const renamedName = `${tagName}_renamed`;
  let createdId;
  let userTagId; // tag created by the regular user, used for RBAC checks

  test.beforeAll(async () => {
    adminCtx = await pwRequest.newContext();
    await apiLogin(adminCtx, 'admin', 'Admin123!');

    userCtx = await pwRequest.newContext();
    await apiLogin(userCtx, 'user', 'User123!');
  });

  test.afterAll(async () => {
    // Final sweep just in case.
    const cleanup = await pwRequest.newContext();
    try {
      await cleanupTestData(cleanup).catch(() => {});
    } finally {
      await cleanup.dispose();
    }
    if (adminCtx) await adminCtx.dispose();
    if (userCtx) await userCtx.dispose();
  });

  test('admin creates a tag', async () => {
    const res = await mutate(adminCtx, 'POST', `${API}/tags`, {
      name: tagName,
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    const tag = body.tag || body;
    expect(tag.name).toBe(tagName);
    createdId = tag.id;
    expect(createdId).toBeTruthy();
  });

  test('list contains the newly created tag', async () => {
    const res = await adminCtx.get(`${API}/tags`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    const tags = body.tags || body || [];
    const found = tags.find((t) => t.id === createdId);
    expect(found).toBeTruthy();
    expect(found.name).toBe(tagName);
  });

  test('admin renames the tag (PUT)', async () => {
    const res = await mutate(adminCtx, 'PUT', `${API}/tags/${createdId}`, {
      name: renamedName,
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const tag = body.tag || body;
    expect(tag.name).toBe(renamedName);
  });

  test('admin deletes the tag', async () => {
    const res = await mutate(adminCtx, 'DELETE', `${API}/tags/${createdId}`);
    expect([200, 204]).toContain(res.status());
  });

  test('regular user CAN create a tag', async () => {
    const userTagName = `e2e_tag_user_${ts}`;
    const res = await mutate(userCtx, 'POST', `${API}/tags`, {
      name: userTagName,
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    const tag = body.tag || body;
    expect(tag.name).toBe(userTagName);
    userTagId = tag.id;
  });

  test('regular user CANNOT PUT a tag (403)', async () => {
    expect(userTagId).toBeTruthy();
    const res = await mutate(userCtx, 'PUT', `${API}/tags/${userTagId}`, {
      name: `${tagName}_hax`,
    });
    expect(res.status()).toBe(403);
  });

  test('regular user CANNOT DELETE a tag (403)', async () => {
    expect(userTagId).toBeTruthy();
    const res = await mutate(userCtx, 'DELETE', `${API}/tags/${userTagId}`);
    expect(res.status()).toBe(403);
  });
});
