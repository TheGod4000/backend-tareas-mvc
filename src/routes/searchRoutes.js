'use strict';

const express = require('express');
const ctrl = require('../controllers/searchController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

const router = express.Router();

router.use(requireAuth, requireRole('admin'));

router.get('/users-by-tags', ctrl.usersByTags);
router.get('/tasks-by-tags', ctrl.tasksByTags);
router.get('/tags-by-users', ctrl.tagsByUsers);

module.exports = router;
