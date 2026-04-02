# CRM System

Production-grade CRM monorepo with:

- `backend/`: Express + TypeScript + MongoDB API
- `frontend/`: Next.js App Router dashboard
- `docs/`: architecture and schema notes

## Features

- JWT authentication with role-based access
- Contacts, leads, deals, tasks, notifications, dashboard, and settings modules
- Shared in-app notifications
- Dashboard metrics and charts
- Kanban pipeline board
- Task list and basic calendar view

## Project structure

```text
backend/
frontend/
docs/
docker-compose.yml
```

## Environment setup

### Backend

Create `backend/.env` from `backend/.env.example`.

Required keys:

- `NODE_ENV`
- `PORT`
- `APP_NAME`
- `API_PREFIX`
- `MONGODB_URI`
- `MONGODB_DB_NAME`
- `MONGODB_MAX_POOL_SIZE`
- `MONGODB_MIN_POOL_SIZE`
- `CORS_ORIGIN`
- `JWT_ACCESS_SECRET`
- `JWT_ACCESS_EXPIRES_IN`
- `JWT_ISSUER`
- `JWT_AUDIENCE`
- `BCRYPT_SALT_ROUNDS`

### Frontend

Create `frontend/.env.local` from `frontend/.env.example`.

Required keys:

- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_API_BASE_URL`

## Local development

### 1. Install dependencies

```bash
cd backend
npm install
cd ../frontend
npm install
```

### 2. Start MongoDB

Use a local MongoDB instance, MongoDB Atlas, or Docker:

```bash
docker compose up mongodb -d
```

### 3. Start backend

```bash
cd backend
npm run dev
```

Backend runs on `http://localhost:5000`.

### 4. Start frontend

```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:3000`.

## Production-style Docker run

### 1. Prepare env files

- `backend/.env`
- `frontend/.env.local` for local frontend work

### 2. Build and run

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- MongoDB: `mongodb://localhost:27017`

## Validation and quality checks

### Backend

```bash
cd backend
npm run check
```

### Frontend

```bash
cd frontend
npm run check
```

## API connection notes

- The frontend uses `NEXT_PUBLIC_API_BASE_URL`
- Auth tokens are stored in `localStorage` under `crm_access_token`
- Frontend API calls are centralized in [frontend/lib/api-client.ts](/e:/dream/CRM/frontend/lib/api-client.ts)

## Optimization notes

- Backend queries are tenant-scoped by `workspaceId`
- Dashboard metrics use Mongo aggregation with early `$match`
- MongoDB client and Mongoose both use configurable pool sizes
- Frontend API calls share a single request helper for consistent error handling

## Deployment notes

### Backend

- Dockerfile: [backend/Dockerfile](/e:/dream/CRM/backend/Dockerfile)
- Uses production `npm ci --omit=dev`
- Exposes port `5000`

### Frontend

- Dockerfile: [frontend/Dockerfile](/e:/dream/CRM/frontend/Dockerfile)
- Uses Next.js standalone output
- Exposes port `3000`

### Compose

- Orchestration file: [docker-compose.yml](/e:/dream/CRM/docker-compose.yml)

## Recommended first-run flow

1. Start MongoDB.
2. Configure `backend/.env`.
3. Configure `frontend/.env.local`.
4. Start backend and frontend.
5. Register a workspace admin through the auth API.
6. Log in and persist the returned access token to `localStorage` as `crm_access_token`.
7. Use the CRM modules from the dashboard UI.

## Important implementation files

- Backend router: [backend/src/core/router.ts](/e:/dream/CRM/backend/src/core/router.ts)
- Mongo connection: [backend/src/core/database/mongodb.ts](/e:/dream/CRM/backend/src/core/database/mongodb.ts)
- Shared frontend API client: [frontend/lib/api-client.ts](/e:/dream/CRM/frontend/lib/api-client.ts)
- Frontend settings/env config: [frontend/lib/app-config.ts](/e:/dream/CRM/frontend/lib/app-config.ts)

