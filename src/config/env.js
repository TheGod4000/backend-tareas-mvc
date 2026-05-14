'use strict';

require('dotenv').config();

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 3000,
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '8h',
  DB_STORAGE: process.env.DB_STORAGE || './database.sqlite',
  COOKIE_ACCESS_NAME: 'access_token',
  COOKIE_CSRF_NAME: 'csrf_token',
  CORS_ORIGINS: ['http://localhost:5173', 'http://localhost:3000'],
  BCRYPT_ROUNDS: 10,
};

module.exports = env;
