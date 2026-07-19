# CLAUDE.md

Guidance for AI assistants (and humans) working in this repository.

## What this is

A full-stack blog application:

- **`client/`** — React 18 + React Router 6 frontend, built with **Vite**.
- **`server/`** — **Express** REST API talking to **MySQL** via `mysql2`
  (raw SQL, connection pool — no ORM).
- **MySQL** — stores blog posts.

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
│       ├── main.jsx            # entry; mounts <App> in <BrowserRouter>
│       ├── App.jsx             # route definitions
│       ├── index.css           # all app styles (plain CSS)
│       ├── api/posts.js        # fetch wrappers for the posts API
│       ├── components/         # Navbar, PostCard, PostForm
│       └── pages/              # Home, PostDetail, CreatePost, EditPost
├── server/                     # Express + MySQL API
│   ├── .env.example            # copy to .env (gitignored)
│   ├── package.json
│   └── src/
│       ├── index.js            # app entry, middleware, route mounting
│       ├── routes/posts.js     # /api/posts router
│       ├── controllers/postsController.js   # request handlers + SQL
│       └── db/
│           ├── pool.js         # shared mysql2 connection pool
│           ├── init.js         # `npm run db:init` — creates DB + schema
│           └── schema.sql      # posts table definition
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
npm run db:init           # create the database + posts table
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

Base path `/api/posts` (see `server/src/routes/posts.js`):

| Method | Path             | Handler       | Notes                          |
| ------ | ---------------- | ------------- | ------------------------------ |
| GET    | `/api/posts`     | `listPosts`   | newest first                   |
| GET    | `/api/posts/:id` | `getPost`     | 404 if missing                 |
| POST   | `/api/posts`     | `createPost`  | 400 if title/content blank     |
| PUT    | `/api/posts/:id` | `updatePost`  | 400 if blank, 404 if missing   |
| DELETE | `/api/posts/:id` | `deletePost`  | 204 on success                 |

`GET /api/health` → `{ "status": "ok" }`. Unknown `/api/*` routes → 404 JSON.

### Data model (`server/src/db/schema.sql`)

`posts`: `id` (PK, auto-increment), `title`, `content`, `author`
(default `'Anonymous'`), `created_at`, `updated_at` (auto-updated).

## Conventions

- **ES modules everywhere.** Both packages use `"type": "module"`; use
  `import`/`export`, not `require`.
- **Raw parameterized SQL.** All queries go through the `pool` in
  `server/src/db/pool.js` and use `?` placeholders — never string-interpolate
  user input into SQL.
- **Controllers own the SQL.** Route files only wire paths to handlers; query
  logic and validation live in `controllers/`. Errors are passed to `next(err)`
  and handled by the central error middleware in `index.js`.
- **Frontend API access** goes through `client/src/api/posts.js` — don't call
  `fetch` directly from components. It throws `Error(message)` on non-2xx so
  callers can surface `err.message`.
- **`PostForm` is shared** by create and edit pages; extend it rather than
  duplicating form logic.
- **Styling** is plain CSS in `client/src/index.css` using CSS variables. No CSS
  framework or CSS-in-JS.
- **Secrets** live only in `server/.env` (gitignored). Update `.env.example`
  whenever you add a new required variable.

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
