# CLAUDE.md

Guidance for AI assistants (and humans) working in this repository.

## ⚠️ Current state: empty scaffold

As of this writing, **this repository contains no application code**. The only
tracked files are `README.md` and this `CLAUDE.md`. There is no `package.json`,
no source tree, no build tooling, and no database schema yet.

Before assuming any structure exists, verify with:

```bash
git ls-files          # list everything tracked
ls -la                # inspect the working tree
```

Do **not** invent file paths, scripts, or commands that are not actually
present. If a task requires code that does not exist yet, create it explicitly
and update this file to match.

## Intended project

The repository name — `react-mysql-blog` — describes the planned application:
a **blog** with a **React** frontend backed by a **MySQL** database. Nothing
below is implemented yet; treat it as the target architecture to build toward,
not as documentation of existing code.

A conventional shape for this stack would be:

- **Frontend** — React single-page app (likely bootstrapped with Vite or
  Create React App). Renders posts, handles routing and forms.
- **Backend/API** — a server (commonly Node.js + Express) exposing a REST or
  GraphQL API for posts, comments, and auth, talking to MySQL.
- **Database** — MySQL, storing posts, users, and comments.

When you scaffold any of these, keep frontend and backend in clearly separated
directories (e.g. `client/` and `server/`, or a monorepo with workspaces) and
record the real choices here.

## Working conventions

- **Verify before you document.** This file must always reflect the repository's
  actual state. When you add tooling, capture the real install/build/test/run
  commands here rather than generic guesses.
- **Secrets stay out of git.** Database credentials, connection strings, and API
  keys belong in a `.env` file that is gitignored, with a committed
  `.env.example` documenting the required variables. Never hardcode MySQL
  passwords or commit a real `.env`.
- **Add a `.gitignore` early.** At minimum ignore `node_modules/`, build output
  (`dist/`, `build/`), and `.env` before the first dependency install.
- **Match the surrounding code.** Once code exists, follow its formatting,
  naming, and structure. Prefer the project's own scripts (lint, test, build)
  over ad-hoc commands.

## Git workflow

- Default branch: `main`.
- Do all work on a dedicated feature branch; do not commit directly to `main`.
- Write clear, descriptive commit messages.
- Push with `git push -u origin <branch-name>`.
- Open a pull request only when explicitly asked.

## Maintaining this file

This CLAUDE.md was created while the repo was an empty scaffold. **As soon as
real code lands, update it** with:

- the actual directory layout,
- exact commands to install, run, build, lint, and test,
- how to configure and connect to MySQL locally,
- any conventions the team adopts (component structure, API design, migrations).

Keep it concise and accurate — an out-of-date CLAUDE.md is worse than none.
