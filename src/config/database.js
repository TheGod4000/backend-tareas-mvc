'use strict';

const { Sequelize } = require('sequelize');
const env = require('./env');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: env.DB_STORAGE,
  logging: false,
  define: {
    freezeTableName: false,
  },
});

module.exports = sequelize;
