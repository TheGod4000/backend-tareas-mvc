'use strict';

const { Tag } = require('../models');
const { HttpError } = require('../middleware/errorHandler');

async function list() {
  return Tag.findAll({ order: [['id', 'ASC']] });
}

async function getById(id) {
  const tag = await Tag.findByPk(id);
  if (!tag) throw new HttpError(404, 'Tag not found');
  return tag;
}

async function create({ name }) {
  if (!name || typeof name !== 'string' || !name.trim()) {
    throw new HttpError(400, 'name is required');
  }
  return Tag.create({ name: name.trim() });
}

async function update(id, { name }) {
  const tag = await getById(id);
  if (!name || typeof name !== 'string' || !name.trim()) {
    throw new HttpError(400, 'name is required');
  }
  await tag.update({ name: name.trim() });
  return tag;
}

async function remove(id) {
  const tag = await getById(id);
  await tag.destroy();
  return { ok: true };
}

module.exports = { list, getById, create, update, remove };
