'use strict';

const { User, Task, Tag } = require('../models');

function parseList(csv) {
  return (csv || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function isAndMode(mode) {
  return (mode || 'or').toLowerCase() === 'and';
}

/**
 * Users who own at least one task tagged with given tag names.
 * AND: user must have tasks covering ALL tags (union across their tasks).
 * OR: user must have at least one task tagged with any of the tags.
 */
async function usersByTags({ tags, mode }) {
  const tagNames = parseList(tags);
  if (tagNames.length === 0) {
    return User.findAll({ order: [['id', 'ASC']] });
  }
  const wantedSet = new Set(tagNames.map((t) => t.toLowerCase()));
  const and = isAndMode(mode);

  const users = await User.findAll({
    include: [
      {
        model: Task,
        as: 'tasks',
        required: false,
        include: [{ model: Tag, as: 'tags', through: { attributes: [] } }],
      },
    ],
    order: [['id', 'ASC']],
  });

  return users.filter((u) => {
    const userTagSet = new Set();
    for (const task of u.tasks || []) {
      for (const tag of task.tags || []) {
        userTagSet.add(tag.name.toLowerCase());
      }
    }
    if (and) {
      for (const t of wantedSet) if (!userTagSet.has(t)) return false;
      return true;
    }
    for (const t of wantedSet) if (userTagSet.has(t)) return true;
    return false;
  });
}

/**
 * Tasks tagged with the given tag names.
 * AND: task must carry all listed tags. OR: task carries any.
 */
async function tasksByTags({ tags, mode }) {
  const tagNames = parseList(tags);
  const and = isAndMode(mode);

  const tasks = await Task.findAll({
    include: [
      { model: Tag, as: 'tags', through: { attributes: [] } },
      { model: User, as: 'user', attributes: ['id', 'username', 'email', 'role'] },
    ],
    order: [['id', 'ASC']],
  });

  if (tagNames.length === 0) return tasks;
  const wantedSet = new Set(tagNames.map((t) => t.toLowerCase()));

  return tasks.filter((task) => {
    const taskTagSet = new Set((task.tags || []).map((t) => t.name.toLowerCase()));
    if (and) {
      for (const t of wantedSet) if (!taskTagSet.has(t)) return false;
      return true;
    }
    for (const t of wantedSet) if (taskTagSet.has(t)) return true;
    return false;
  });
}

/**
 * Tags appearing in tasks of given usernames.
 * AND: tag must appear in tasks of ALL listed users. OR: in any.
 */
async function tagsByUsers({ users, mode }) {
  const usernames = parseList(users);
  const and = isAndMode(mode);

  if (usernames.length === 0) {
    return Tag.findAll({ order: [['id', 'ASC']] });
  }

  // Pull all matching users with their tasks+tags
  const userRows = await User.findAll({
    where: { username: usernames },
    include: [
      {
        model: Task,
        as: 'tasks',
        required: false,
        include: [{ model: Tag, as: 'tags', through: { attributes: [] } }],
      },
    ],
  });

  // Build map: username -> Set of tag names
  const usernameToTagSet = new Map();
  for (const u of userRows) {
    const set = new Set();
    for (const t of u.tasks || []) {
      for (const tag of t.tags || []) set.add(tag.name);
    }
    usernameToTagSet.set(u.username, set);
  }

  // Make sure every requested username is represented (possibly empty set)
  for (const name of usernames) {
    if (!usernameToTagSet.has(name)) usernameToTagSet.set(name, new Set());
  }

  // Compute the resulting tag-name set
  let resultNames;
  if (and) {
    // intersection of all users' tag sets
    let inter = null;
    for (const name of usernames) {
      const s = usernameToTagSet.get(name) || new Set();
      if (inter === null) {
        inter = new Set(s);
      } else {
        const next = new Set();
        for (const v of inter) if (s.has(v)) next.add(v);
        inter = next;
      }
      if (inter.size === 0) break;
    }
    resultNames = inter || new Set();
  } else {
    const union = new Set();
    for (const name of usernames) {
      const s = usernameToTagSet.get(name) || new Set();
      for (const v of s) union.add(v);
    }
    resultNames = union;
  }

  if (resultNames.size === 0) return [];
  return Tag.findAll({
    where: { name: Array.from(resultNames) },
    order: [['id', 'ASC']],
  });
}

module.exports = { usersByTags, tasksByTags, tagsByUsers };
