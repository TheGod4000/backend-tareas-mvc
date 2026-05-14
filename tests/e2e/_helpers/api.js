'use strict';

// Lightweight API helpers for the Playwright E2E suite.
//
// The backend uses a double-submit CSRF pattern: every mutating request must
// send an `x-csrf-token` HTTP header whose value matches the `csrf_token`
// cookie that the server set previously (via either GET /csrf or successful
// POST /auth/login). Playwright's APIRequestContext shares cookies across
// requests, which is exactly what we need.

const API = 'http://localhost:3000/api';

const CSRF_COOKIE = 'csrf_token';
const ACCESS_COOKIE = 'access_token';

const E2E_PREFIX = 'e2e_';

/**
 * Read the current value of a cookie out of the APIRequestContext storage
 * state. Returns `null` if the cookie isn't set.
 */
async function readCookie(request, name) {
  const state = await request.storageState();
  const cookies = (state && state.cookies) || [];
  for (const c of cookies) {
    if (c.name === name) return c.value;
  }
  return null;
}

/**
 * GET /csrf — seeds the `csrf_token` cookie on the shared request context and
 * also returns the token value (which equals the cookie value).
 */
async function getCsrfToken(request) {
  const res = await request.get(`${API}/csrf`);
  if (!res.ok()) {
    throw new Error(`GET /csrf failed: ${res.status()} ${await res.text()}`);
  }
  // Prefer the cookie value (that's what the server compares against).
  const cookieVal = await readCookie(request, CSRF_COOKIE);
  if (cookieVal) return cookieVal;
  const body = await res.json();
  return body.csrfToken;
}

/**
 * Convenience for any mutating request. Always re-reads the freshest CSRF
 * cookie before firing — that way callers don't have to thread tokens through
 * every helper.
 */
async function mutate(request, method, url, data, csrfToken) {
  const token = csrfToken || (await readCookie(request, CSRF_COOKIE));
  const headers = { 'x-csrf-token': token || '' };
  const opts = { headers };
  if (data !== undefined) opts.data = data;
  const m = method.toUpperCase();
  if (m === 'POST') return request.post(url, opts);
  if (m === 'PUT') return request.put(url, opts);
  if (m === 'PATCH') return request.patch(url, opts);
  if (m === 'DELETE') return request.delete(url, opts);
  throw new Error(`Unsupported method ${method}`);
}

/**
 * Logs in via the API. Seeds CSRF first so the login POST can carry the
 * matching header (login itself is CSRF-exempt server-side, but we send the
 * header anyway to keep things uniform). Returns the `{ user }` body.
 */
async function apiLogin(request, username, password) {
  // Seed cookies (csrf + clear any prior session).
  await getCsrfToken(request);
  const csrfToken = await readCookie(request, CSRF_COOKIE);
  const res = await request.post(`${API}/auth/login`, {
    headers: { 'x-csrf-token': csrfToken || '' },
    data: { username, password },
  });
  if (!res.ok()) {
    throw new Error(
      `Login failed for ${username}: ${res.status()} ${await res.text()}`
    );
  }
  return res.json();
}

/**
 * Logs out via the API (CSRF-exempt server-side, but we still send the token).
 */
async function apiLogout(request) {
  const csrfToken = await readCookie(request, CSRF_COOKIE);
  return request.post(`${API}/auth/logout`, {
    headers: { 'x-csrf-token': csrfToken || '' },
  });
}

/**
 * Best-effort cleanup of any test artefacts whose names start with `e2e_`.
 * Logs in as admin (so it can see all users / all tasks / delete tags) and
 * fires DELETEs in dependency-safe order: tasks → tags → users.
 *
 * Failures are swallowed and printed — cleanup must never fail a test run.
 */
async function cleanupTestData(request) {
  try {
    await apiLogin(request, 'admin', 'Admin123!');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[cleanup] admin login failed:', err.message);
    return;
  }

  // 1) Tasks. Admin's GET /tasks returns every task in the system.
  try {
    const res = await request.get(`${API}/tasks`);
    if (res.ok()) {
      const body = await res.json();
      const tasks = body.tasks || [];
      for (const t of tasks) {
        if (t && typeof t.title === 'string' && t.title.startsWith(E2E_PREFIX)) {
          const del = await mutate(request, 'DELETE', `${API}/tasks/${t.id}`);
          if (!del.ok()) {
            // eslint-disable-next-line no-console
            console.warn(
              `[cleanup] DELETE /tasks/${t.id} -> ${del.status()}`
            );
          }
        }
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[cleanup] tasks sweep failed:', err.message);
  }

  // 2) Tags.
  try {
    const res = await request.get(`${API}/tags`);
    if (res.ok()) {
      const body = await res.json();
      const tags = body.tags || body || [];
      for (const t of tags) {
        if (t && typeof t.name === 'string' && t.name.startsWith(E2E_PREFIX)) {
          const del = await mutate(request, 'DELETE', `${API}/tags/${t.id}`);
          if (!del.ok()) {
            // eslint-disable-next-line no-console
            console.warn(`[cleanup] DELETE /tags/${t.id} -> ${del.status()}`);
          }
        }
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[cleanup] tags sweep failed:', err.message);
  }

  // 3) Users.
  try {
    const res = await request.get(`${API}/users`);
    if (res.ok()) {
      const body = await res.json();
      const users = body.users || body || [];
      for (const u of users) {
        if (
          u &&
          typeof u.username === 'string' &&
          u.username.startsWith(E2E_PREFIX)
        ) {
          const del = await mutate(request, 'DELETE', `${API}/users/${u.id}`);
          if (!del.ok()) {
            // eslint-disable-next-line no-console
            console.warn(
              `[cleanup] DELETE /users/${u.id} -> ${del.status()}`
            );
          }
        }
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[cleanup] users sweep failed:', err.message);
  }

  // Logout to leave the request context clean.
  try {
    await apiLogout(request);
  } catch (_) {
    /* ignore */
  }
}

module.exports = {
  API,
  CSRF_COOKIE,
  ACCESS_COOKIE,
  E2E_PREFIX,
  readCookie,
  getCsrfToken,
  mutate,
  apiLogin,
  apiLogout,
  cleanupTestData,
};
