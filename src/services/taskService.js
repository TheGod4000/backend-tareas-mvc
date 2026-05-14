'use strict';

const { Op } = require('sequelize');
const { Task, Tag, User } = require('../models');
const { HttpError } = require('../middleware/errorHandler');

const VALID_STATUS = new Set(['todo', 'doing', 'done']);

function tagInclude() {
  return {
    model: Tag,
    as: 'tags',
    through: { attributes: [] },
  };
}

function userInclude() {
  return {
    model: User,
    as: 'user',
    attributes: ['id', 'username', 'email', 'role'],
  };
}

async function listForUser(currentUser, { status } = {}) {
  const where = {};
  if (currentUser.role !== 'admin') where.userId = currentUser.id;
  if (status) {
    if (!VALID_STATUS.has(status)) throw new HttpError(400, 'Invalid status');
    where.status = status;
  }
  return Task.findAll({
    where,
    include: [tagInclude(), userInclude()],
    order: [['id', 'ASC']],
  });
}

async function getByIdForUser(currentUser, id) {
  const task = await Task.findByPk(id, { include: [tagInclude(), userInclude()] });
  if (!task) throw new HttpError(404, 'Task not found');
  if (currentUser.role !== 'admin' && task.userId !== currentUser.id) {
    throw new HttpError(403, 'Forbidden');
  }
  return task;
}

async function setTags(task, tagIds) {
  if (!Array.isArray(tagIds)) return;
  const cleanIds = tagIds.map((n) => parseInt(n, 10)).filter((n) => Number.isInteger(n) && n > 0);
  if (cleanIds.length === 0) {
    await task.setTags([]);
    return;
  }
  const tags = await Tag.findAll({ where: { id: { [Op.in]: cleanIds } } });
  await task.setTags(tags);
}

async function create(currentUser, payload) {
  if (!payload || !payload.title) {
    throw new HttpError(400, 'title is required');
  }
  if (payload.status && !VALID_STATUS.has(payload.status)) {
    throw new HttpError(400, 'Invalid status');
  }
  const task = await Task.create({
    title: payload.title,
    description: payload.description || null,
    status: payload.status || 'todo',
    userId: currentUser.id,
  });
  if (payload.tagIds) await setTags(task, payload.tagIds);
  return Task.findByPk(task.id, { include: [tagInclude(), userInclude()] });
}

async function update(currentUser, id, payload) {
  const task = await getByIdForUser(currentUser, id);
  const fields = {};
  if (payload.title !== undefined) fields.title = payload.title;
  if (payload.description !== undefined) fields.description = payload.description;
  if (payload.status !== undefined) {
    if (!VALID_STATUS.has(payload.status)) throw new HttpError(400, 'Invalid status');
    fields.status = payload.status;
  }
  await task.update(fields);
  if (payload.tagIds !== undefined) await setTags(task, payload.tagIds);
  return Task.findByPk(task.id, { include: [tagInclude(), userInclude()] });
}

async function remove(currentUser, id) {
  const task = await getByIdForUser(currentUser, id);
  await task.destroy();
  return { ok: true };
}

async function searchByTags(currentUser, { tags, mode }) {
  const tagNames = (tags || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (tagNames.length === 0) return listForUser(currentUser);

  const baseWhere = {};
  if (currentUser.role !== 'admin') baseWhere.userId = currentUser.id;

  // Fetch candidate tasks (those that have at least one of the requested tags) with all their tags
  const candidates = await Task.findAll({
    where: baseWhere,
    include: [
      {
        model: Tag,
        as: 'tags',
        through: { attributes: [] },
      },
      userInclude(),
    ],
    order: [['id', 'ASC']],
  });

  const wantedSet = new Set(tagNames.map((t) => t.toLowerCase()));
  const isAnd = (mode || 'or').toLowerCase() === 'and';

  return candidates.filter((task) => {
    const taskTagNames = (task.tags || []).map((t) => t.name.toLowerCase());
    const taskTagSet = new Set(taskTagNames);
    if (isAnd) {
      for (const t of wantedSet) {
        if (!taskTagSet.has(t)) return false;
      }
      return true;
    }
    for (const t of wantedSet) {
      if (taskTagSet.has(t)) return true;
    }
    return false;
  });
}

module.exports = {
  listForUser,
  getByIdForUser,
  create,
  update,
  remove,
  searchByTags,
};
