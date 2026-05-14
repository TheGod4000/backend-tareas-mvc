'use strict';

const taskService = require('../services/taskService');
const { asyncHandler } = require('../middleware/errorHandler');

const list = asyncHandler(async (req, res) => {
  const tasks = await taskService.listForUser(req.user, { status: req.query.status });
  return res.json({ tasks });
});

const getById = asyncHandler(async (req, res) => {
  const task = await taskService.getByIdForUser(req.user, req.params.id);
  return res.json({ task });
});

const create = asyncHandler(async (req, res) => {
  const task = await taskService.create(req.user, req.body || {});
  return res.status(201).json({ task });
});

const update = asyncHandler(async (req, res) => {
  const task = await taskService.update(req.user, req.params.id, req.body || {});
  return res.json({ task });
});

const remove = asyncHandler(async (req, res) => {
  const result = await taskService.remove(req.user, req.params.id);
  return res.json(result);
});

const search = asyncHandler(async (req, res) => {
  const tasks = await taskService.searchByTags(req.user, {
    tags: req.query.tags,
    mode: req.query.mode,
  });
  return res.json({ tasks });
});

module.exports = { list, getById, create, update, remove, search };
