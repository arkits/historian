# Historian

A full-stack web application built with Bun, React, tRPC, and PostgreSQL.

## Tech Stack

- **Runtime**: [Bun](https://bun.sh/) - Fast all-in-one JavaScript runtime
- **Frontend**: React 19 with TypeScript
- **Backend**: tRPC for type-safe APIs
- **Database**: PostgreSQL with [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [better-auth](https://www.better-auth.com/)
- **Styling**: Tailwind CSS with shadcn/ui components
- **Testing**: Vitest
- **Database Migrations**: Drizzle migrations

## Prerequisites

- [Bun](https://bun.sh/) installed
- PostgreSQL database (local or hosted)

## Getting Started

### Installation

```bash
bun install
```

### Environment Variables

Create a `.env` file based on `.env.example` (copy and modify):

```bash
cp .env.example .env
```

Configure the following variables:

- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_SECRET` - Secret key for authentication

### Database Setup

Run migrations to set up the database schema:

```bash
bun run migrate
```

### Development

Start the development server with hot reload:

```bash
bun dev
```

The application will be available at `http://localhost:3000`

### Production

Build and start the production server:

```bash
bun run build
bun start
```

### Testing

Run tests with Vitest:

```bash
bun test
```

## Project Structure

```
├── src/
│   ├── client/           # tRPC client configuration
│   ├── components/       # React components (shadcn/ui)
│   ├── lib/              # Utility functions and database
│   ├── pages/            # Page components
│   ├── server/           # tRPC router and server setup
│   ├── App.tsx           # Main App component
│   ├── frontend.tsx      # Frontend entry point
│   └── index.ts          # Application entry point
├── drizzle/
│   ├── meta/             # Drizzle migration metadata
│   └── 0000_heavy_venom.sql  # Migration files
├── tests/                # Vitest test files
├── build.ts              # Build script
├── migrate.ts            # Database migration script
├── drizzle.config.ts     # Drizzle configuration
└── bunfig.toml           # Bun configuration
```

## Docker

Build and run with Docker:

```bash
docker build -t historian .
docker run -p 3000:3000 historian
```

## Available Scripts

| Command            | Description              |
| ------------------ | ------------------------ |
| `bun dev`          | Start development server |
| `bun start`        | Start production server  |
| `bun run build`    | Build the application    |
| `bun test`         | Run tests                |
| `bun run migrate`  | Run database migrations  |
| `bun run db:reset` | Reset database schema    |

## License

MIT
