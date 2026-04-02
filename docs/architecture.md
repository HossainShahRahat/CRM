# CRM Architecture Guidelines

## Architectural style

- Clean modular monolith first, microservice-ready later
- Feature modules own their HTTP surface, DTOs, and orchestration
- Shared cross-cutting concerns live in `core/`, `middleware/`, and `utils/`
- Business rules should depend on abstractions, not framework details

## Naming conventions

- Directories: `kebab-case`
- Files: `kebab-case.ts` or `kebab-case.tsx`
- Classes, interfaces, types, enums: `PascalCase`
- Variables and functions: `camelCase`
- Constants and environment keys: `UPPER_SNAKE_CASE`
- Route segments: plural nouns where applicable, for example `/api/v1/contacts`
- Mongo collections: plural, lowercase names

## Coding standards

- Use TypeScript in strict mode
- Keep modules cohesive and feature-oriented
- Prefer constructor/function injection over importing concrete dependencies deep into modules
- Keep controllers thin; move orchestration into services
- Validate request payloads at module boundaries once DTOs are introduced
- Use shared error types from `core/errors`
- Keep side effects behind adapters in `core/`
- Do not let frontend components call databases or external providers directly
- Prefer explicit exports via module `index.ts` files for public module surfaces

## Environment structure

Backend `.env` keys:

- `NODE_ENV`
- `PORT`
- `APP_NAME`
- `API_PREFIX`
- `MONGODB_URI`
- `MONGODB_DB_NAME`
- `CORS_ORIGIN`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`

Frontend `.env.local` keys:

- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_API_BASE_URL`

## Backend module responsibilities

- `auth/`: authentication entry points, token workflows, guards later
- `users/`: user profile and account management
- `contacts/`: CRM contact records
- `leads/`: qualification pipeline inputs
- `deals/`: revenue opportunities and stages
- `tasks/`: activity and follow-up workflows

## Frontend structure

- `app/`: route entry points
- `components/layout/`: shell primitives such as sidebar and topbar
- `config/`: navigation and app-level constants
- `lib/`: lightweight client utilities

