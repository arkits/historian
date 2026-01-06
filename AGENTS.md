# Historian

## Overview

- Full-stack web application using Bun runtime
- React 19 frontend with TypeScript
- tRPC for type-safe API communication
- Drizzle ORM with PostgreSQL database
- better-auth for authentication
- Tailwind CSS with shadcn/ui components
- Vitest for testing

## Development Commands

| Command            | Description                              |
| ------------------ | ---------------------------------------- |
| `bun dev`          | Start development server with hot reload |
| `bun start`        | Start production server                  |
| `bun run build`    | Build the application                    |
| `bun test`         | Run tests with Vitest                    |
| `bun run migrate`  | Run database migrations                  |
| `bun run db:reset` | Reset and reapply database schema        |

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

## Development Workflow

- You must execute `bun run build` and `bun run test` ; and ensure that there are no build issues and that all tests pass.

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

## MANDATORY WORKFLOW:

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

## CRITICAL RULES:

- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
- Use 'bd' for task tracking
- NEVER use npm. Always use bun.
