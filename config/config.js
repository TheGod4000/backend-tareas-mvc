'use strict';

// Configuration consumed by `sequelize-cli` (db:migrate, db:seed). The runtime
// app uses src/config/database.js which reads the same env vars and produces an
// equivalent Sequelize instance — keeping them aligned is important.

require('dotenv').config();

const common = {
  dialect: 'sqlite',
  storage: process.env.DB_STORAGE || './database.sqlite',
  logging: false,
};

module.exports = {
  development: common,
  test: {
    ...common,
    storage: process.env.TEST_DB_STORAGE || './database.test.sqlite',
  },
  production: common,
};
