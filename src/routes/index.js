'use strict';

const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const taskRoutes = require('./taskRoutes');
const tagRoutes = require('./tagRoutes');
const searchRoutes = require('./searchRoutes');
const { issueCsrfToken } = require('../middleware/csrf');

const router = express.Router();

router.get('/csrf', issueCsrfToken);

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/tasks', taskRoutes);
router.use('/tags', tagRoutes);
router.use('/admin/search', searchRoutes);

module.exports = router;
