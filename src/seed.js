'use strict';

const { User, Task, Tag } = require('./models');
const { hash } = require('./utils/password');

async function ensureUser({ username, email, password, role }) {
  const existing = await User.findOne({ where: { username } });
  if (existing) return existing;
  const passwordHash = await hash(password);
  return User.create({ username, email, passwordHash, role });
}

async function ensureTag(name) {
  const existing = await Tag.findOne({ where: { name } });
  if (existing) return existing;
  return Tag.create({ name });
}

async function seed() {
  const admin = await ensureUser({
    username: 'admin',
    email: 'admin@local.test',
    password: 'Admin123!',
    role: 'admin',
  });

  const user = await ensureUser({
    username: 'user',
    email: 'user@local.test',
    password: 'User123!',
    role: 'user',
  });

  const tagNames = ['work', 'home', 'urgent', 'low'];
  const tags = {};
  for (const name of tagNames) {
    tags[name] = await ensureTag(name);
  }

  const sampleExisting = await Task.findOne({
    where: { title: 'Sample task', userId: user.id },
  });
  if (!sampleExisting) {
    const sample = await Task.create({
      title: 'Sample task',
      description: 'A seeded sample task for the regular user.',
      status: 'todo',
      userId: user.id,
    });
    await sample.setTags([tags.work, tags.urgent]);
  }

  return { admin, user };
}

module.exports = seed;
