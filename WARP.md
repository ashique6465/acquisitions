# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview
Acquisitions is a production-level backend API built with Express.js focused on DevOps practices. The project uses:
- Node.js with ESM (ES Modules)
- Express.js 5.x for the API framework
- Drizzle ORM with Neon (serverless PostgreSQL)
- JWT authentication with bcrypt password hashing
- Winston for logging, Morgan for HTTP request logging
- Zod for request validation

## Development Commands

### Running the Application
```powershell
npm run dev
```
Runs the application with Node.js watch mode - automatically restarts on file changes.

### Code Quality
```powershell
npm run lint          # Check code with ESLint
npm run lint:fix      # Auto-fix linting issues
npm run format        # Format code with Prettier
npm run format:check  # Check formatting without modifying files
```

### Database Operations
```powershell
npm run db:generate   # Generate migration files from schema changes
npm run db:migrate    # Apply migrations to database
npm run db:studio     # Open Drizzle Studio (database GUI)
```

Database operations require `DATABASE_URL` environment variable to be set in `.env` file.

## Architecture

### Module System
This project uses ES Modules with import path aliases defined in `package.json`:
- `#config/*` → `./src/config/*`
- `#controllers/*` → `./src/controllers/*`
- `#middleware/*` → `./src/middleware/*`
- `#models/*` → `./src/models/*`
- `#routes/*` → `./src/routes/*`
- `#services/*` → `./src/services/*`
- `#utils/*` → `./src/utils/*`
- `#validations/*` → `./src/validations/*`

Always use these path aliases instead of relative imports when referencing modules across different directories.

### Application Structure
The application follows a layered architecture:

**Entry Point**: `src/index.js` → loads dotenv config and starts `src/server.js`

**Layers** (in order of request flow):
1. **Routes** (`src/routes/`): Define API endpoints and map to controllers
2. **Controllers** (`src/controllers/`): Handle HTTP request/response, validate input with Zod schemas, call services
3. **Services** (`src/services/`): Contain business logic, interact with database via Drizzle ORM
4. **Models** (`src/models/`): Define database schema using Drizzle ORM's pgTable

**Supporting modules**:
- **Config** (`src/config/`): Database connection (`database.js`), logger configuration (`logger.js`)
- **Validations** (`src/validations/`): Zod schemas for request validation
- **Utils** (`src/utils/`): Reusable utilities (JWT, cookies, formatters)

### Database Schema
Database models are defined using Drizzle ORM in `src/models/*.js`. The ORM uses:
- `pgTable` from `drizzle-orm/pg-core` for table definitions
- Neon serverless PostgreSQL driver (`@neondatabase/serverless`)
- HTTP-based connection via `drizzle-orm/neon-http`

Schema changes workflow:
1. Modify model files in `src/models/`
2. Run `npm run db:generate` to create migration SQL files in `drizzle/` directory
3. Run `npm run db:migrate` to apply migrations

### Authentication Pattern
Current authentication implementation (see `src/controllers/auth.controller.js`, `src/services/auth.service.js`):
- Passwords are hashed using bcrypt with 10 rounds
- JWT tokens are signed with payload `{id, email, role}` and 1-day expiration
- Tokens are stored in httpOnly cookies with secure flag in production
- Cookie maxAge is 15 minutes (note: shorter than JWT expiration)

### Logging
Winston logger is configured in `src/config/logger.js`:
- Log level controlled by `LOG_LEVEL` env var (defaults to 'info')
- File transports: `logs/error.log` (errors only), `logs/combined.log` (all logs)
- Console transport enabled in non-production environments
- All logs include timestamp and service metadata `{service: 'acquisitions-api'}`
- HTTP requests are logged via Morgan middleware with 'combined' format

Use `logger.info()`, `logger.warn()`, `logger.error()` imported from `#config/logger.js` for application logging.

## Code Style

### Linting Rules (ESLint)
- **Indentation**: 2 spaces (with switch case indentation)
- **Quotes**: Single quotes
- **Semicolons**: Required
- **Line endings**: Unix (LF)
- **Variables**: Use `const` by default, prefer arrow functions
- **Unused variables**: Prefix with underscore `_` to ignore

### Formatting (Prettier)
- Single quotes, semicolons, 2-space tabs
- 80 character line width
- Arrow function parens: avoid when single parameter
- Trailing commas: ES5 style

Run `npm run lint:fix` and `npm run format` before committing code.

## Environment Variables
Required environment variables (create `.env` file):
- `DATABASE_URL`: Neon PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT signing (defaults to insecure fallback)
- `NODE_ENV`: Environment mode (`production` or other)
- `PORT`: Server port (defaults to 3000)
- `LOG_LEVEL`: Winston log level (defaults to 'info')

## Health Check
The API exposes `/health` endpoint that returns:
```json
{
  "status": "OK",
  "timestamp": "ISO timestamp",
  "uptime": "process uptime in seconds"
}
```
