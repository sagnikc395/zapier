# zapier

A Zapier-like workflow automation platform that lets users connect different
services together and automate repetitive tasks. Users build **Zaps** — a Zap
is a single **Trigger** (an event in some external service, e.g. "new email
received") followed by one or more ordered **Actions** (e.g. "send a Slack
message", "append a row to a sheet", "send an email"). When the trigger fires,
the platform runs each action in sequence, passing data forward through the
pipeline.

The system is built as a microservices monorepo so that each responsibility —
receiving external events, reliably queuing them, and executing individual
actions — can scale independently. Reliability is handled via the
**transactional outbox pattern**: incoming trigger events are written to the
database in the same transaction as the ZapRun, and a separate processor
publishes them to Kafka for downstream consumption.

## Features

- Visual workflow automation across multiple applications
- Trigger + ordered actions model (Zaps, ZapRuns)
- Reliable event delivery via the transactional outbox pattern
- Kafka-based message passing between services for back-pressure and scale
- PostgreSQL (via Prisma) as the source of truth
- Email notifications as a built-in action
- Monorepo with shared database, types, UI, and config packages
- Microservice architecture, easy to deploy and scale horizontally

## Tech Stack

- **Frontend:** Next.js, React, shared UI package
- **Database:** PostgreSQL via Prisma
- **Messaging:** Apache Kafka
- **Language:** TypeScript
- **Monorepo:** TurboRepo + npm workspaces
- **Tooling:** ESLint, Prettier, shared TS config

## Architecture

High-level flow of a Zap from trigger to completion:

```text
                  ┌────────────────────────┐
                  │      External App      │
                  │  (Gmail, Slack, etc.)  │
                  └───────────┬────────────┘
                              │ webhook / event
                              ▼
   ┌────────────┐      ┌──────────────┐      ┌─────────────────┐
   │   web      │◀────▶│    server    │      │   PostgreSQL    │
   │ (Next.js)  │      │  (Express    │─────▶│  Zap / ZapRun   │
   │ build &    │      │   REST API)  │      │     Outbox      │
   │ manage Zap │      └──────────────┘      └────────┬────────┘
   └────────────┘             ▲                       │
                              │ webhook               │
                       ┌──────────────┐               │
                       │   hooks api  │───────────────┤
                       │ (trigger in) │               │
                       └──────────────┘               │
                                                      │ polls outbox
                                                      ▼
                                             ┌─────────────────┐
                                             │    processor    │
                                             │ (outbox → kafka)│
                                             └────────┬────────┘
                                                      │ publish
                                                      ▼
                                             ┌─────────────────┐
                                             │      Kafka      │
                                             └─────────────────┘
```

Key ideas:

- The **web** app (Next.js) is where users sign up, log in, view their
  dashboard of Zaps, and use the visual editor to pick a trigger, chain
  actions, and publish a Zap.
- The **server** app is an Express REST API that backs the web app. It
  exposes `/api/auth`, `/api/zaps`, `/api/triggers`, and `/api/actions` for
  account management and CRUD on Zaps, available triggers, and available
  actions.
- The **hooks** app is the public webhook ingress. When an external event
  hits it, the event is persisted alongside a `ZapRunOutbox` row in a single
  DB transaction — no event is lost even if Kafka is momentarily unavailable.
- The **processor** polls the outbox table and publishes pending runs to
  Kafka, then marks them as dispatched.

### Web app routes

- `/login`, `/sign-up` — authentication
- `/dashboard` — list, enable/disable, and manage existing Zaps
- `/editor` — visual Zap builder: pick a trigger, chain ordered actions
- `/not-found` — 404 fallback

### REST API (server)

- `POST /api/auth/...` — sign up, sign in, session management
- `GET/POST /api/zaps` — list and create Zaps; fetch a single Zap with its
  trigger and actions
- `GET /api/triggers` — list `AvailableTriggers` the user can pick from
- `GET /api/actions` — list `AvailableActions` the user can chain

## Project Structure

The project is organized as a monorepo using TurboRepo with npm workspaces.

```text
root/
├── apps/
│   ├── web/               # Next.js frontend — login, dashboard, visual Zap editor
│   ├── server/            # Express REST API — auth, zaps, triggers, actions
│   ├── hooks/             # Webhook ingress — receives external trigger events
│   └── processor/         # Outbox poller — drains ZapRunOutbox into Kafka
├── packages/
│   ├── db/                # Prisma schema + generated client (PostgreSQL)
│   ├── kafka/             # Shared Kafka producer/consumer config
│   ├── email/             # Shared email-sending utilities (built-in action)
│   ├── types/             # Shared TS types & Zod schemas (zap, trigger, action)
│   ├── ui/                # Shared React UI components
│   ├── utils/             # Shared utility helpers
│   ├── eslint-config/     # Shared ESLint configuration
│   └── typescript-config/ # Shared TypeScript configuration
├── turbo.json
└── README.md
```

### Core data model (Prisma)

- `User` — account owner
- `Zap` — a user's workflow; has one `Trigger` and many ordered `Action`s
- `Trigger` / `AvailableTriggers` — the event that starts a Zap
- `Action` / `AvailableActions` — the steps executed in order
- `ZapRun` — a single execution of a Zap
- `ZapRunOutbox` — outbox row used to reliably hand runs off to Kafka

## Getting Started

```bash
npm install
npm run dev
```

Other scripts:

- `npm run build` — build all apps and packages
- `npm run lint` — lint the monorepo
- `npm run check-types` — typecheck the monorepo
- `npm run format` — format with Prettier