# Task Management System

A full-stack task manager with two roles (Admin and User), JWT authentication, CSRF
protection (double-submit cookie), role-based access control, and a comprehensive
Playwright E2E test suite.

```
backend-tareas-mvc/        ← Express 5 + Sequelize + SQLite + Playwright (this folder)
APIRest/frontend-tareas/   ← Vue 3 + Vuetify 3 + Vite SPA
```

## Project tree (source-only)

```
backend-tareas-mvc/
├── server.js
├── playwright.config.js
├── src/
│   ├── app.js
│   ├── seed.js
│   ├── config/{env.js, database.js}
│   ├── models/{index.js, User.js, Task.js, Tag.js}
│   ├── middleware/{auth.js, csrf.js, rbac.js, errorHandler.js}
│   ├── services/{authService.js, userService.js, taskService.js, tagService.js, searchService.js}
│   ├── controllers/{authController.js, userController.js, taskController.js, tagController.js, searchController.js}
│   ├── routes/{index.js, authRoutes.js, userRoutes.js, taskRoutes.js, tagRoutes.js, searchRoutes.js}
│   └── utils/{jwt.js, password.js}
└── tests/e2e/
    ├── _helpers/{api.js, ui.js}
    ├── auth.spec.js
    ├── admin-users-crud.spec.js
    ├── tasks-crud.spec.js
    ├── tags-crud.spec.js
    ├── multi-tag-search.spec.js
    ├── admin-advanced-search.spec.js
    ├── csrf.spec.js
    └── rbac.spec.js

APIRest/frontend-tareas/
├── index.html
├── vite.config.js
└── src/
    ├── main.js
    ├── App.vue
    ├── plugins/vuetify.js
    ├── api/{http.js, auth.js, users.js, tasks.js, tags.js, search.js}
    ├── store/auth.js
    ├── router/index.js
    ├── views/{LoginView.vue, TasksView.vue, TagsView.vue,
    │          AdminUsersView.vue, AdvancedSearchView.vue, NotFoundView.vue}
    └── components/{TaskFormDialog.vue, UserFormDialog.vue}
```

## Default credentials (seeded on first start)

| Role  | Username | Password    |
| ----- | -------- | ----------- |
| Admin | `admin`  | `Admin123!` |
| User  | `user`   | `User123!`  |

The seed also inserts four tags (`work`, `home`, `urgent`, `low`) and one sample task
for `user` titled "Sample task" tagged `work` + `urgent`.

## Local execution

### 1. Install (first run only)

```bash
# Backend (deps already installed in node_modules; re-run if needed):
cd backend-tareas-mvc
npm install
npx playwright install chromium     # for E2E

# Frontend — install vue-router and axios that we added:
cd ../APIRest/frontend-tareas
npm install
```

### 2. Initialise the database (one-time, or after schema changes)

```bash
cd backend-tareas-mvc
npm run db:migrate
# → creates database.sqlite with the users / tags / tasks / task_tags tables
```

If you previously had a stale `database.sqlite` from a different project, wipe and re-migrate:

```bash
npm run db:reset    # drops database.sqlite, then re-runs migrations
```

### 3. Start the backend (terminal #1)

```bash
cd backend-tareas-mvc
npm start
# → listens on http://localhost:3000
# Idempotent runtime seed inserts the default admin/user/tags/sample task if missing.
```

### 4. Start the frontend (terminal #2)

```bash
cd APIRest/frontend-tareas
npm run dev
# → opens http://localhost:5173
```

### 5. Run the E2E test suite (terminal #3, both servers up)

```bash
cd backend-tareas-mvc
npx playwright test                # headless run
npx playwright test --headed       # watch the browser
npx playwright show-report         # open the HTML report afterwards
```

## API surface (JSON, prefixed with `/api`)

| Method | Path                                            | Auth   |
| ------ | ----------------------------------------------- | ------ |
| GET    | `/csrf`                                         | public |
| POST   | `/auth/login`                                   | public |
| POST   | `/auth/logout`                                  | public |
| GET    | `/auth/me`                                      | auth   |
| POST   | `/auth/register`                                | admin  |
| GET    | `/users`, `/users/:id`                          | admin  |
| POST   | `/users`                                        | admin  |
| PUT    | `/users/:id`                                    | admin  |
| DELETE | `/users/:id`                                    | admin  |
| GET    | `/tasks`, `/tasks/:id`                          | auth   |
| POST   | `/tasks`                                        | auth   |
| PUT    | `/tasks/:id`                                    | auth   |
| DELETE | `/tasks/:id`                                    | auth   |
| GET    | `/tasks/search?tags=a,b&mode=and\|or`           | auth   |
| GET    | `/tags`                                         | auth   |
| POST   | `/tags`                                         | auth   |
| PUT    | `/tags/:id`                                     | admin  |
| DELETE | `/tags/:id`                                     | admin  |
| GET    | `/admin/search/users-by-tags?tags=a,b&mode=…`   | admin  |
| GET    | `/admin/search/tasks-by-tags?tags=a,b&mode=…`   | admin  |
| GET    | `/admin/search/tags-by-users?users=u1&mode=…`   | admin  |

## Security notes

- **JWT** — HS256, 8-hour expiry. Stored in an `HttpOnly`, `SameSite=lax` cookie
  named `access_token`. Never exposed to JavaScript.
- **CSRF** — Double-submit cookie. Server sets a non-HttpOnly cookie
  `csrf_token` on `GET /api/csrf` and on every successful login. The SPA reads
  the cookie and sends its value in the `x-csrf-token` HTTP header for every
  POST/PUT/PATCH/DELETE. The server compares cookie vs header with
  `crypto.timingSafeEqual`. The login and logout endpoints are exempt from the
  CSRF check (login has no prior session; logout is idempotent).
- **RBAC** — `requireAuth` then `requireRole('admin')`. The frontend hides
  admin views from regular users; the backend enforces the same gate
  independently — UI bypassing returns `403`.
- **Passwords** — Hashed with `bcryptjs` (10 rounds). `passwordHash` is stripped
  from every response by the User model's `toJSON`.

## Environment overrides (optional)

Create `backend-tareas-mvc/.env` to override defaults:

```
PORT=3000
JWT_SECRET=replace-me-in-production
JWT_EXPIRES_IN=8h
DB_STORAGE=./database.sqlite
```

## Database lifecycle

| Command                 | What it does                                                |
| ----------------------- | ----------------------------------------------------------- |
| `npm run db:migrate`    | Apply pending migrations from `./migrations/`               |
| `npm run db:migrate:undo` | Undo all migrations (drops every managed table)            |
| `npm run db:drop`       | Delete `database.sqlite` (and its journal)                  |
| `npm run db:reset`      | `db:drop` then `db:migrate` — clean schema, idempotent      |
| `npm start`             | Boots the server; runs the idempotent runtime seed          |

Add new schema changes as a new file in `./migrations/` (timestamped name) and
run `npm run db:migrate`. The runtime seed in `src/seed.js` only inserts the
defaults when missing, so it's safe to re-run on every boot.
