# Historian

## Overview

- Full-stack web application using Bun runtime
- React 19 frontend with TypeScript
- tRPC for type-safe API communication
- Drizzle ORM with PostgreSQL database
- better-auth for authentication
- Tailwind CSS with shadcn/ui components
- Vitest for testing

## Tech Stack

| Category          | Technology   |
| ----------------- | ------------ |
| Runtime           | Bun          |
| Frontend          | React 19     |
| Backend Framework | tRPC         |
| Database          | PostgreSQL   |
| ORM               | Drizzle ORM  |
| Authentication    | better-auth  |
| Styling           | Tailwind CSS |
| Testing           | Vitest       |

## Project Structure

```
/historian
├── src/
│   ├── client/           # tRPC client setup
│   ├── components/       # React components (shadcn/ui)
│   ├── lib/              # Utilities, schema, db connection
│   ├── pages/            # Route pages (HomePage, LoginPage, etc.)
│   ├── server/           # tRPC router, auth, context, handlers
│   ├── App.tsx           # Main app component
│   ├── frontend.tsx      # Frontend entry
│   └── index.ts          # Application entry point
├── drizzle/
│   ├── meta/             # Migration metadata
│   └── 0000_heavy_venom.sql  # Migration files
├── tests/                # Vitest test files
├── build.ts              # Build script
├── migrate.ts            # Database migration script
├── scripts/
│   └── reset-db.ts       # Database reset script
├── bunfig.toml           # Bun configuration
├── drizzle.config.*      # Drizzle ORM config
├── vitest.config.ts      # Vitest configuration
└── package.json
```

## Development Commands

| Command            | Description                              |
| ------------------ | ---------------------------------------- |
| `bun dev`          | Start development server with hot reload |
| `bun start`        | Start production server                  |
| `bun run build`    | Build the application                    |
| `bun test`         | Run tests with Vitest                    |
| `bun run migrate`  | Run database migrations                  |
| `bun run db:reset` | Reset and reapply database schema        |

## Environment Variables

Required in `.env`:

- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_SECRET` - Secret for authentication

## Testing

- Framework: **Vitest**
- Test location: `tests/` directory
- Run tests: `bun test`

## Debugging

- Use Playwright MCP to browse the UI on http://localhost:3000/dashboard . Use credentials for testing: username `arkits` / password `admin123`

## Database

- **ORM**: Drizzle ORM
- **Database**: PostgreSQL
- **Migrations**: Stored in `drizzle/` directory
- Run migrations: `bun run migrate`
- Reset database: `bun run db:reset`

## Building

- Build script: `build.ts`
- Output: `dist/` directory
- Command: `bun run build`

## Docker

A Dockerfile is available for containerized deployment:

```bash
docker build -t historian .
docker run -p 3000:3000 historian
```

## Key Files

- `src/index.ts` - Application entry point
- `src/server/router.ts` - tRPC router definition
- `src/lib/schema.ts` - Database schema definitions
- `src/lib/db.ts` - Database connection setup
- `src/server/auth.ts` - Authentication configuration


## Development Workflow

- You must execute `bun run build` and `bun run test` ; and ensure that there are no build issues and that all tests pass.