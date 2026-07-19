# CLAUDE.md

Guidance for AI assistants (and humans) working in this repository.

## What this is

A full-stack blog application:

- **`client/`** — React 18 + React Router 6 frontend, built with **Vite**.
- **`server/`** — **Express** REST API talking to **MySQL** via `mysql2`
  (raw SQL, connection pool — no ORM).
- **MySQL** — stores users, blog posts, and comments.

Authentication is **JWT-based** (`jsonwebtoken`), with passwords hashed via
`bcryptjs`. Posts and comments are owned by users; only an owner can edit or
delete their own content.

The two halves are independent npm packages (each has its own `package.json`).
There is no root `package.json`; run commands inside `client/` or `server/`.

## Directory layout

```
react-mysql-blog/
├── client/                     # React frontend (Vite)
│   ├── index.html
│   ├── vite.config.js          # dev server + /api proxy → :3001
│   ├── package.json
│   └── src/
│       ├── main.jsx            # entry; wraps <App> in Router + AuthProvider
│       ├── App.jsx             # route definitions (some behind ProtectedRoute)
│       ├── index.css           # all app styles (plain CSS)
│       ├── api/                # http.js (fetch+JWT helper), posts, auth, comments
│       ├── context/AuthContext.jsx   # auth state, login/register/logout
│       ├── components/         # Navbar, PostCard, PostForm, Comments, ProtectedRoute
│       └── pages/              # Home, PostDetail, CreatePost, EditPost, Login, Register
├── server/                     # Express + MySQL API
│   ├── .env.example            # copy to .env (gitignored)
│   ├── package.json
│   └── src/
│       ├── index.js            # app entry, middleware, route mounting
│       ├── middleware/auth.js  # signToken() + requireAuth (JWT verify)
│       ├── routes/             # posts.js, auth.js, comments.js
│       ├── controllers/        # postsController, authController, commentsController
│       └── db/
│           ├── pool.js         # shared mysql2 connection pool
│           ├── init.js         # `npm run db:init` — creates DB + schema
│           └── schema.sql      # users, posts, comments tables
├── .gitignore
├── README.md
└── CLAUDE.md
```

## Development workflow

Run the backend and frontend in two terminals. **MySQL must be running.**

### Backend (`server/`)

```bash
cd server
npm install
cp .env.example .env      # edit with your MySQL credentials
npm run db:init           # create the database + tables (users, posts, comments)
npm run dev               # node --watch, API on http://localhost:3001
```

- `npm start` — run without watch.
- `npm run db:init` — idempotent; safe to re-run (uses `CREATE ... IF NOT EXISTS`).

### Frontend (`client/`)

```bash
cd client
npm install
npm run dev               # Vite dev server on http://localhost:5173
npm run build             # production build → dist/
npm run preview           # preview the production build
```

Vite proxies `/api/*` to `http://localhost:3001` (see `client/vite.config.js`),
so the frontend calls the API with relative paths and there's no CORS in dev.

## API surface

Routes marked 🔒 require a `Authorization: Bearer <token>` header. Write and
delete operations also enforce **ownership** (403 otherwise).

**Auth** (`server/src/routes/auth.js`):

| Method | Path                  | Notes                                    |
| ------ | --------------------- | ---------------------------------------- |
| POST   | `/api/auth/register`  | `{username,email,password}` → `{user,token}`; 409 on duplicate |
| POST   | `/api/auth/login`     | `{email,password}` → `{user,token}`; 401 on bad creds |
| GET    | `/api/auth/me` 🔒     | current user                             |

**Posts** (`server/src/routes/posts.js`):

| Method | Path             | Notes                                       |
| ------ | ---------------- | ------------------------------------------- |
| GET    | `/api/posts`     | newest first; `author` = owner's username   |
| GET    | `/api/posts/:id` | 404 if missing                              |
| POST   | `/api/posts` 🔒  | owner = authenticated user; 400 if blank    |
| PUT    | `/api/posts/:id` 🔒 | owner only (403); 400 blank, 404 missing  |
| DELETE | `/api/posts/:id` 🔒 | owner only (403); 204 on success          |

**Comments** (`server/src/routes/comments.js`):

| Method | Path                          | Notes                              |
| ------ | ----------------------------- | ---------------------------------- |
| GET    | `/api/posts/:postId/comments` | oldest first; `author` = username  |
| POST   | `/api/posts/:postId/comments` 🔒 | 400 if blank, 404 if no post    |
| DELETE | `/api/comments/:id` 🔒        | author only (403); 204 on success  |

`GET /api/health` → `{ "status": "ok" }`. Unknown `/api/*` routes → 404 JSON.

### Data model (`server/src/db/schema.sql`)

- **`users`**: `id` (PK), `username` (unique), `email` (unique),
  `password_hash` (bcrypt), `created_at`.
- **`posts`**: `id` (PK), `user_id` (FK → users, `ON DELETE CASCADE`),
  `title`, `content`, `created_at`, `updated_at` (auto-updated). The `author`
  field in API responses is the owner's `username` via join, not a column.
- **`comments`**: `id` (PK), `post_id` (FK → posts, cascade), `user_id`
  (FK → users, cascade), `content`, `created_at`.

## Conventions

- **ES modules everywhere.** Both packages use `"type": "module"`; use
  `import`/`export`, not `require`.
- **Raw parameterized SQL.** All queries go through the `pool` in
  `server/src/db/pool.js` and use `?` placeholders — never string-interpolate
  user input into SQL.
- **Controllers own the SQL.** Route files only wire paths to handlers; query
  logic and validation live in `controllers/`. Errors are passed to `next(err)`
  and handled by the central error middleware in `index.js`.
- **Auth on the server.** Protect a route by adding the `requireAuth` middleware
  from `server/src/middleware/auth.js`; it attaches `req.user = { id, username }`.
  For writes, load the row's `user_id` and compare to `req.user.id`, returning
  403 on mismatch (see `getOwner` in `postsController.js`). Never trust a
  `user_id` from the request body — always take it from `req.user`.
- **Frontend API access** goes through the `client/src/api/` modules, which all
  call the shared `request()` helper in `api/http.js`. That helper injects the
  JWT from `localStorage` and throws `Error(message)` (with `.status`) on
  non-2xx. Don't call `fetch` directly from components.
- **Auth state** lives in `client/src/context/AuthContext.jsx` (`useAuth()`):
  `user`, `loading`, `login`, `register`, `logout`. Gate pages with
  `<ProtectedRoute>` and gate UI (edit/delete buttons) on ownership using
  `user?.id === row.user_id`.
- **`PostForm` is shared** by create and edit pages; extend it rather than
  duplicating form logic.
- **Styling** is plain CSS in `client/src/index.css` using CSS variables. No CSS
  framework or CSS-in-JS.
- **Secrets** live only in `server/.env` (gitignored) — including `JWT_SECRET`.
  Update `.env.example` whenever you add a new required variable.

## Validating changes

There is no test suite or linter configured yet. Before committing, at minimum:

- **Client:** `cd client && npm run build` must succeed.
- **Server:** `cd server && node --check src/**/*.js` (or start it and hit
  `/api/health`). Full CRUD requires a running MySQL.

If you add tests or linting, wire them into the relevant `package.json`
`scripts` and document the commands here.

## Git workflow

- Default branch: `main`. Do work on a feature branch; don't commit to `main`.
- Clear, descriptive commit messages.
- Push with `git push -u origin <branch-name>`.
- Open a pull request only when explicitly asked.

## Keeping this file current

When you change the structure, add endpoints, introduce tooling (tests, lint,
auth, migrations, Docker), or add tables/columns, **update this file and the
README in the same change.** An out-of-date CLAUDE.md is worse than none.
