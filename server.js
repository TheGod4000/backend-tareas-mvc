'use strict';

const app = require('./src/app');
const env = require('./src/config/env');
const { sequelize } = require('./src/models');
const seed = require('./src/seed');

async function start() {
  try {
    await sequelize.authenticate();
    // Set DB_RESET=1 to drop & rebuild all tables (useful when an old DB file
    // from a previous project has a stale schema that `alter` can't migrate).
    const force = process.env.DB_RESET === '1';
    //await sequelize.sync(force ? { force: true } : { alter: true });
    await seed();
    app.listen(env.PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`[server] listening on http://localhost:${env.PORT}`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[server] failed to start:', err);
    if (err && err.original && /no such column|SQLITE_ERROR/.test(err.original.message || '')) {
      // eslint-disable-next-line no-console
      console.error(
        '\n[hint] Looks like database.sqlite has a stale schema from a previous project.\n' +
          '       Either delete it:   rm -f database.sqlite database.sqlite-journal\n' +
          '       Or rebuild tables:  DB_RESET=1 npm start\n'
      );
    }
    process.exit(1);
  }
}

start();
