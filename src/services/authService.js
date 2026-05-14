'use strict';

const { User } = require('../models');
const { hash, compare } = require('../utils/password');
const { sign } = require('../utils/jwt');
const { HttpError } = require('../middleware/errorHandler');

async function login({ username, password }) {
  if (!username || !password) {
    throw new HttpError(400, 'username and password are required');
  }
  const user = await User.findOne({ where: { username } });
  if (!user) {
    throw new HttpError(401, 'Invalid credentials');
  }
  const ok = await compare(password, user.passwordHash);
  if (!ok) {
    throw new HttpError(401, 'Invalid credentials');
  }
  const token = sign({ sub: user.id, role: user.role, username: user.username });
  return { token, user };
}

async function register({ username, email, password, role }) {
  if (!username || !email || !password) {
    throw new HttpError(400, 'username, email, and password are required');
  }
  const passwordHash = await hash(password);
  const user = await User.create({
    username,
    email,
    passwordHash,
    role: role === 'admin' ? 'admin' : 'user',
  });
  return user;
}

async function getById(id) {
  const user = await User.findByPk(id);
  if (!user) throw new HttpError(404, 'User not found');
  return user;
}

module.exports = { login, register, getById };
