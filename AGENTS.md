# Agentic Development Guide

Use this file as the primary operating guide for coding work in this repository.

## Purpose

This repository is a self-hosted, INR-priced error tracking and sampled-APM platform for small teams. The codebase should stay easy for an agent to reason about: one language, one type system, one monorepo, and clear boundaries between services and packages.

## Architecture Rules

- TypeScript end-to-end across microservices, worker, gateway, dashboard, shared packages, and SDK surfaces.
- Microservices architecture split by function: Gateway, Ingestion (write), Processing, Grouping, Alerting, Query/API (read), Notification.
- Asynchronous / Event-Driven communication using Kafka (or compatible event streaming backbone) for loose coupling between services.
- Database-per-service (polyglot persistence): Postgres for domain objects/issues, ClickHouse/Elasticsearch for analytical metrics/search, S3 for raw blob storage, and Redis for caching/cooldowns.
- CQRS API pattern: Heavy write ingestion and read queries are completely isolated service boundaries.
- Multi-tenancy isolation enforced via tenant/project boundaries across database stores.
- Built-in resilience: Circuit breakers, retries with exponential backoff, and Dead-Letter Queues (DLQ).

## Scope Guardrails

Authorized architecture for the microservices platform:

- Functionally decoupled microservices (Gateway, Ingestion, Processing, Grouping, Alerting, Notification, Query)
- Kafka event streaming backbone & BullMQ queueing
- Polyglot persistence (Postgres, ClickHouse/Elasticsearch, S3/MinIO, Redis)
- CQRS read/write separation
- Kubernetes manifests and Docker Compose multi-service orchestration

## Workflow

- Read the relevant module and tests before changing it.
- Keep edits minimal and localized.
- Prefer concrete, falsifiable checks before broad refactors.
- Run the narrowest useful validation after each substantive change.
- If a change affects a package, validate that package before moving on.

## Production Readiness

Before onboarding real customers, ensure:

- Redis persistence behavior is defined and tested.
- Postgres backups and restore are documented and verified.
- Health checks are monitored.
- Ingest rate limiting is live.
- Scrubbing tests pass against realistic data.
- Fingerprinting misgroupings have a review process.

## Design Principles (SOLID)

All code modifications and architectural decisions MUST strictly adhere to the SOLID principles outlined in the following documents. Before writing or refactoring code, ensure compliance with these rules to prevent technical debt and maintain a clean, extensible codebase:

- **Single Responsibility Principle (SRP):** [01-single-responsibility-principle.md](./01-single-responsibility-principle.md) - Ensure classes/modules have only one axis of change.
- **Open/Closed Principle (OCP):** [02-open-closed-principle.md](./02-open-closed-principle.md) - Design for extension via abstractions (interfaces/polymorphism) rather than modifying existing code.
- **Liskov Substitution Principle (LSP):** [03-liskov-substitution-principle.md](./03-liskov-substitution-principle.md) - Subtypes must be behaviorally compatible with their base types without breaking expected contracts.
- **Interface Segregation Principle (ISP):** [04-interface-segregation-principle.md](./04-interface-segregation-principle.md) - Prefer small, client-specific interfaces over "fat" general-purpose ones.
- **Dependency Inversion Principle (DIP):** [05-dependency-inversion-principle.md](./05-dependency-inversion-principle.md) - High-level modules and low-level modules must both depend on abstractions, using dependency injection where appropriate.