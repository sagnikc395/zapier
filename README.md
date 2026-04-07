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
publishes them to Kafka. Workers then consume Kafka messages, execute one
action at a time, and re-enqueue the next action until the Zap finishes.

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
   │   web      │─────▶│   hooks api  │─────▶│   PostgreSQL    │
   │ (Next.js)  │      │ (trigger in) │      │  Zap / ZapRun   │
   │  build &   │      └──────────────┘      │     Outbox      │
   │ manage Zap │                            └────────┬────────┘
   └────────────┘                                     │
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
                                             └────────┬────────┘
                                                      │ consume
                                                      ▼
                                             ┌─────────────────┐
                                             │     worker      │
                                             │ runs one action │
                                             │ + enqueues next │
                                             └────────┬────────┘
                                                      │
                                   ┌──────────────────┼──────────────────┐
                                   ▼                  ▼                  ▼
                              email action      http action       …more actions
```

Key ideas:

- The **web** app is where users sign in, pick a trigger, chain actions, and
  activate a Zap.
- When an external event hits, it is persisted alongside a ZapRunOutbox row in
  a single DB transaction — no event is lost even if Kafka is momentarily
  unavailable.
- The **processor** drains the outbox into Kafka.
- The **worker** consumes Kafka, executes a single action at a time, updates
  progress in Postgres, and re-publishes the next action in the chain until
  the Zap run completes.

## Project Structure

The project is organized as a monorepo using TurboRepo with npm workspaces.

```text
root/
├── apps/
│   ├── web/               # Next.js frontend — build and manage Zaps
│   └── docs/              # Next.js documentation site
├── packages/
│   ├── db/                # Prisma schema + generated client (PostgreSQL)
│   ├── kafka/             # Shared Kafka producer/consumer config
│   ├── email/             # Shared email-sending utilities
│   ├── types/             # Shared TS types & Zod schemas (zap, trigger, action)
│   ├── ui/                # Shared React UI components
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