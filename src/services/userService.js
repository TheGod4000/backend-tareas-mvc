'use strict';

const { User } = require('../models');
const { hash } = require('../utils/password');
const { HttpError } = require('../middleware/errorHandler');

async function list() {
  return User.findAll({ order: [['id', 'ASC']] });
}

async function getById(id) {
  const user = await User.findByPk(id);
  if (!user) throw new HttpError(404, 'User not found');
  return user;
}

async function create({ username, email, password, role }) {
  if (!username || !email || !password) {
    throw new HttpError(400, 'username, email, and password are required');
  }
  const passwordHash = await hash(password);
  return User.create({
    username,
    email,
    passwordHash,
    role: role === 'admin' ? 'admin' : 'user',
  });
}

async function update(id, payload) {
  const user = await getById(id);
  const fields = {};
  if (payload.username !== undefined) fields.username = payload.username;
  if (payload.email !== undefined) fields.email = payload.email;
  if (payload.role !== undefined) {
    if (!['admin', 'user'].includes(payload.role)) {
      throw new HttpError(400, 'role must be admin or user');
    }
    fields.role = payload.role;
  }
  if (payload.password !== undefined && payload.password !== null && payload.password !== '') {
    fields.passwordHash = await hash(payload.password);
  }
  await user.update(fields);
  return user;
}

async function remove(id) {
  const user = await getById(id);
  await user.destroy();
  return { ok: true };
}

module.exports = { list, getById, create, update, remove };
