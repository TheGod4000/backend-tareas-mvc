'use strict';

const sequelize = require('../config/database');
const User = require('./User');
const Task = require('./Task');
const Tag = require('./Tag');

// Associations
User.hasMany(Task, { foreignKey: 'userId', as: 'tasks', onDelete: 'CASCADE' });
Task.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Task.belongsToMany(Tag, {
  through: 'task_tags',
  as: 'tags',
  foreignKey: 'taskId',
  otherKey: 'tagId',
  timestamps: false,
});
Tag.belongsToMany(Task, {
  through: 'task_tags',
  as: 'tasks',
  foreignKey: 'tagId',
  otherKey: 'taskId',
  timestamps: false,
});

module.exports = {
  sequelize,
  User,
  Task,
  Tag,
};
