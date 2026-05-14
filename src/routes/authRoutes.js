'use strict';

const express = require('express');
const { login, logout, me, register } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', requireAuth, me);
router.post('/register', requireAuth, requireRole('admin'), register);

module.exports = router;
