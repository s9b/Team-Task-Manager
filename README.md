# Team Task Manager

**Live URL:** https://ideal-achievement-production.up.railway.app

**Demo credentials:** `admin@demo.com` / `password123` · `member@demo.com` / `password123`

---

A full-stack web application for managing projects and tasks across teams. Supports role-based access control (Admin / Member), JWT authentication via httpOnly cookies, and a clean internal-tool interface.

---

## Tech Stack

- **Backend:** Node.js, Express, Prisma ORM, PostgreSQL
- **Auth:** JWT stored in httpOnly cookie
- **Frontend:** React 18, Vite, React Router v6, Axios
- **Styling:** Plain CSS with CSS custom properties

---

## Local Setup

### Prerequisites

- Node.js 18+
- PostgreSQL (local instance or hosted)

### 1. Clone and install

```bash
git clone <repo-url>
cd team-task-manager
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env
# Edit .env — set DATABASE_URL and JWT_SECRET
npm install
npx prisma migrate dev --name init
npm run seed          # optional: populate demo data
npm run dev           # starts on port 4000
```

### 3. Frontend setup

```bash
cd ../frontend
cp .env.example .env
# Edit .env — set VITE_API_URL=http://localhost:4000
npm install
npm run dev           # starts on port 5173
```

Open `http://localhost:5173`.

Seed credentials:
- `admin@demo.com` / `password123`
- `member@demo.com` / `password123`

---

## Environment Variables

### Backend `.env`

| Variable       | Description                              | Example                          |
|----------------|------------------------------------------|----------------------------------|
| `DATABASE_URL` | PostgreSQL connection string             | `postgresql://user:pass@host/db` |
| `JWT_SECRET`   | Long random string for signing tokens    | `supersecret123...`              |
| `PORT`         | Port for Express server                  | `4000`                           |
| `FRONTEND_URL` | CORS allowed origin                      | `http://localhost:5173`          |

### Frontend `.env`

| Variable        | Description              | Example                    |
|-----------------|--------------------------|----------------------------|
| `VITE_API_URL`  | Backend base URL         | `http://localhost:4000`    |

---

## API Endpoint Reference

### Auth — `/api/auth`

| Method | Path        | Auth | Description                        |
|--------|-------------|------|------------------------------------|
| POST   | /register   | No   | Register. Returns user + sets cookie |
| POST   | /login      | No   | Login. Returns user + sets cookie  |
| POST   | /logout     | No   | Clears cookie                      |
| GET    | /me         | Yes  | Returns current user               |

### Users — `/api/users`

| Method | Path | Auth        | Description     |
|--------|------|-------------|-----------------|
| GET    | /    | Yes (Admin) | List all users  |

### Projects — `/api/projects`

| Method | Path                       | Auth             | Description                         |
|--------|----------------------------|------------------|-------------------------------------|
| GET    | /                          | Yes              | List projects the user belongs to   |
| POST   | /                          | Yes              | Create project                      |
| GET    | /:id                       | Yes (member)     | Get project details + members + tasks |
| PUT    | /:id                       | Yes (proj admin) | Update project name/description     |
| DELETE | /:id                       | Yes (proj admin) | Delete project                      |
| POST   | /:id/members               | Yes (proj admin) | Add member by email                 |
| DELETE | /:id/members/:userId       | Yes (proj admin) | Remove member                       |

### Tasks — `/api/tasks`

| Method | Path                  | Auth         | Description                                         |
|--------|-----------------------|--------------|-----------------------------------------------------|
| POST   | /                     | Yes (member) | Create task                                         |
| GET    | /                     | Yes          | Get tasks assigned to current user                  |
| GET    | /project/:projectId   | Yes (member) | Get all tasks for a project                         |
| PUT    | /:id                  | Yes          | Update task (Admin: all fields; Member: status only) |
| DELETE | /:id                  | Yes (admin)  | Delete task                                         |

### Dashboard — `/api/dashboard`

| Method | Path | Auth | Description                                  |
|--------|------|------|----------------------------------------------|
| GET    | /    | Yes  | Stats, task breakdown, overdue, recent tasks |

---

## Deployment on Railway

### Overview

Deploy as two separate Railway services sharing one PostgreSQL plugin.

### Steps

1. Create a new Railway project.
2. Add a PostgreSQL plugin — Railway will provide `DATABASE_URL`.
3. Add two services from this monorepo:

**Backend service**
- Root directory: `/backend`
- Railway detects `nixpacks.toml` automatically
- Environment variables to set:
  - `DATABASE_URL` — link from the Postgres plugin
  - `JWT_SECRET` — any long random string
  - `PORT` — Railway sets this automatically
  - `FRONTEND_URL` — the public URL of your deployed frontend service

**Frontend service**
- Root directory: `/frontend`
- Railway detects `nixpacks.toml` automatically
- Environment variables to set:
  - `VITE_API_URL` — the public URL of your deployed backend service

4. Deploy both services. Railway will run the build commands from `nixpacks.toml`, which include Prisma migrations.

---

## Design Decisions

- **httpOnly cookies** are used for JWT storage to prevent XSS-based token theft.
- **Role separation at two levels:** global `User.role` (site-wide admin) and `ProjectMember.role` (project-scoped admin/member). Most access control uses the project-level role.
- **Inline forms** rather than modal dialogs keep the UI accessible and avoid a third-party modal library dependency.
- **No chart library** — the status breakdown bar is built with plain CSS flexbox segments.
- **Prisma cascade deletes** ensure that removing a project cleans up its tasks and memberships automatically.
- **express-validator** is used for input validation at the route layer; controllers can assume validated input.

---

## What I Would Add With More Time

- **Email notifications** — alert assignees when a task is assigned to them or its due date is approaching
- **Task comments** — threaded discussion on individual tasks with @mentions
- **File attachments** — upload supporting docs directly to a task
- **Activity log** — per-project audit trail showing who changed what and when
- **Pagination & search** — task/project lists are currently unbounded; needs server-side pagination for large datasets
- **Refresh token rotation** — current JWTs are 7-day fixed; a refresh token system would allow shorter-lived access tokens without forcing re-login
- **Unit + integration tests** — Jest for controller logic, Supertest for API route coverage
