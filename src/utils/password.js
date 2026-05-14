'use strict';

const bcrypt = require('bcryptjs');
const env = require('../config/env');

async function hash(plain) {
  return bcrypt.hash(plain, env.BCRYPT_ROUNDS);
}

async function compare(plain, hashed) {
  return bcrypt.compare(plain, hashed);
}

module.exports = { hash, compare };
