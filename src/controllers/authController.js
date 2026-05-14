'use strict';

const env = require('../config/env');
const authService = require('../services/authService');
const { asyncHandler } = require('../middleware/errorHandler');
const { generateToken, setCsrfCookie } = require('../middleware/csrf');

const ACCESS_COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: false,
  path: '/',
  maxAge: 8 * 60 * 60 * 1000,
};

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body || {};
  const { token, user } = await authService.login({ username, password });
  res.cookie(env.COOKIE_ACCESS_NAME, token, ACCESS_COOKIE_OPTS);
  setCsrfCookie(res, generateToken());
  return res.json({ user });
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie(env.COOKIE_ACCESS_NAME, { path: '/' });
  res.clearCookie(env.COOKIE_CSRF_NAME, { path: '/' });
  return res.json({ ok: true });
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.getById(req.user.id);
  return res.json({ user });
});

const register = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body || {};
  const user = await authService.register({ username, email, password, role });
  return res.status(201).json({ user });
});

module.exports = { login, logout, me, register };
