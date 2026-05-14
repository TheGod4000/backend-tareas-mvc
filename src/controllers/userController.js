'use strict';

const userService = require('../services/userService');
const { asyncHandler } = require('../middleware/errorHandler');

const list = asyncHandler(async (req, res) => {
  const users = await userService.list();
  return res.json({ users });
});

const getById = asyncHandler(async (req, res) => {
  const user = await userService.getById(req.params.id);
  return res.json({ user });
});

const create = asyncHandler(async (req, res) => {
  const user = await userService.create(req.body || {});
  return res.status(201).json({ user });
});

const update = asyncHandler(async (req, res) => {
  const user = await userService.update(req.params.id, req.body || {});
  return res.json({ user });
});

const remove = asyncHandler(async (req, res) => {
  const result = await userService.remove(req.params.id);
  return res.json(result);
});

module.exports = { list, getById, create, update, remove };
