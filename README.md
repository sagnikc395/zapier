# Zapier Clone Monorepo

This repository is a Zapier-style workflow automation platform built as a Turbo monorepo. Users can sign up, create Zaps with one trigger and multiple ordered actions, publish them, and invoke webhook URLs that create `ZapRun` jobs for downstream processing.

## Apps

- `apps/web`: Next.js frontend for auth, dashboard, and the Zap editor
- `apps/server`: Express API for auth, triggers, actions, and Zap CRUD
- `apps/hooks`: Webhook ingress service that creates `ZapRun` and `ZapRunOutbox` records
- `apps/processor`: Outbox poller that publishes pending Zap runs to Kafka

## Packages

- `packages/db`: Prisma schema and shared Prisma client
- `packages/kafka`: shared Kafka client
- `packages/email`: email utility used during signup
- `packages/types`: shared Zod schemas and TypeScript types
- `packages/ui`: shared React UI components
- `packages/utils`: shared frontend helpers

## Architecture

```text
web (3000) -> server (5000) -> postgres
                    |
                    v
               hooks (8000) -> zap_run_outbox
                    |
                    v
             processor -> kafka (9092)
```

Main request flow:

1. Users authenticate in `web`.
2. `web` calls `server` to create or update Zaps.
3. Each Zap has one trigger and many ordered actions.
4. External systems hit `hooks` using the generated webhook URL.
5. `hooks` writes a `ZapRun` and matching `ZapRunOutbox` record in one transaction.
6. `processor` reads pending outbox rows and publishes them to Kafka.

## Prerequisites

- Node.js 20+ recommended
- npm
- PostgreSQL
- Kafka running locally on `localhost:9092`

## Environment

Create environment files before starting the services.

Root or service-level variables you will need:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/zapier"
JWT_SECRET="replace-me"
SERVER_PORT=5000
HOOKS_PORT=8000
SMTP_HOST="smtp.gmail.com"
SMTP_USER="your-email@example.com"
SMTP_PASSWORD="your-app-password"
SENDER_EMAIL="your-email@example.com"
```

The frontend currently uses hardcoded local API URLs:

- `http://localhost:5000` for the API
- `http://localhost:8000` for webhook URLs

## Setup

```bash
npm install
npx prisma generate --schema packages/db/prisma/schema.prisma
npx prisma db push --schema packages/db/prisma/schema.prisma
```

If you use sample trigger/action rows, seed them before opening the editor. The UI expects `AvailableTriggers` and `AvailableActions` data to exist in the database.

## Development

Run the apps in separate terminals if Turbo is unavailable locally:

```bash
npm run dev
```

Or per app:

```bash
npm --workspace apps/web run dev
npm --workspace apps/server run dev
npm --workspace apps/hooks run dev
npm --workspace apps/processor run dev
```

Default local ports:

- `web`: `3000`
- `server`: `5000`
- `hooks`: `8000`
- `kafka`: `9092`

## Useful Commands

```bash
npm run build
npm run check-types
npm run lint
npm run format
```

## Current Notes

- The frontend assumes local development URLs and does not yet read API hosts from environment variables.
- Signup sends a confirmation email; if SMTP is not configured, signup may still create the user but email delivery will fail.
- The processor only publishes queued Zap runs to Kafka. Action execution consumers are not implemented in this repository.

## Project Structure

```text
apps/
  web/
  server/
  hooks/
  processor/
packages/
  db/
  kafka/
  email/
  types/
  ui/
  utils/
```
