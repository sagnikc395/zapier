## zapier

an way to automate workflows , integrate multiple services seamelessly.

### features and architectural decisions

- workflow automation across multiple applications
- microservices architecture for modular development
- kafka for efficient load management and communication between services
- PostgreSQL as the database
- turborepo for managing shared configurations and pacakges
- email notification functionality
- easy deployment and scalable architecture

### Tech Stack

Backend: Node.js, Express.js
Frontend: Next.js
Database: PostgreSQL
Messaging: Kafka
Monorepo Management: TurboRepo
Other Utilities: Shared configurations for database, Kafka, and email sender

### Project Structure

The project is organized as a monorepo using TurboRepo, enabling shared configurations across services. Below is an overview of the structure:

```
root/
├── apps/
│   ├── server/      # Node.js + Express backend for creating users and zaps
│   ├── web/         # Next.js frontend
│   ├── hooks/       # Node.js + Express backend for handling hooks triggered by any external trigger
│   ├── processor/   # Node.js microservice for implementing transactional outbox pattern
│   ├── worker/      # Node.js microservices to pick individual actions in zap, and put the next action in kafka if required.
├── packages/
│   ├── db-config/    # Shared database configurations
│   ├── kafka-config/ # Kafka producer/consumer configurations
│   ├── email-sender/ # Shared email utilities
└── README.md
```
