'use strict';

const tagService = require('../services/tagService');
const { asyncHandler } = require('../middleware/errorHandler');

const list = asyncHandler(async (req, res) => {
  const tags = await tagService.list();
  return res.json({ tags });
});

const create = asyncHandler(async (req, res) => {
  const tag = await tagService.create(req.body || {});
  return res.status(201).json({ tag });
});

const update = asyncHandler(async (req, res) => {
  const tag = await tagService.update(req.params.id, req.body || {});
  return res.json({ tag });
});

const remove = asyncHandler(async (req, res) => {
  const result = await tagService.remove(req.params.id);
  return res.json(result);
});

module.exports = { list, create, update, remove };
