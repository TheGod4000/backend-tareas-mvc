'use strict';

const searchService = require('../services/searchService');
const { asyncHandler } = require('../middleware/errorHandler');

const usersByTags = asyncHandler(async (req, res) => {
  const users = await searchService.usersByTags({
    tags: req.query.tags,
    mode: req.query.mode,
  });
  return res.json({ users });
});

const tasksByTags = asyncHandler(async (req, res) => {
  const tasks = await searchService.tasksByTags({
    tags: req.query.tags,
    mode: req.query.mode,
  });
  return res.json({ tasks });
});

const tagsByUsers = asyncHandler(async (req, res) => {
  const tags = await searchService.tagsByUsers({
    users: req.query.users,
    mode: req.query.mode,
  });
  return res.json({ tags });
});

module.exports = { usersByTags, tasksByTags, tagsByUsers };
