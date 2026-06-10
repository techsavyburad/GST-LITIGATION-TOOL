# Enterprise Open-Source Upgrade Path

This app is currently a reliable office-LAN MVP: static browser UI, Express API, JWT employee login, and Excel persistence. The next enterprise version should keep the GST workflow domain model, but move the platform to a database-backed, audited, role-secured SaaS architecture.

## Target Stack

| Layer | Open-source choice | Why |
| --- | --- | --- |
| Frontend | Next.js + React + TypeScript | Strong UI architecture, SSR-ready, large ecosystem |
| UI system | Radix UI + Tailwind CSS + TanStack Table | Accessible controls, dense legal-tech tables, advanced filtering |
| Backend | NestJS or Fastify + TypeScript | Structured API modules, validation, policy guards, testability |
| Database | PostgreSQL | Best fit for structured litigation records, reports, constraints, transactions |
| ORM | Prisma or Drizzle | Type-safe migrations and query layer |
| Auth / SSO | Keycloak | Open-source enterprise SSO, MFA, roles, groups, identity federation |
| Background jobs | Redis + BullMQ | Hearings, reminders, escalation jobs, report generation |
| File storage | MinIO S3-compatible storage | Open-source document vault, versioned object storage |
| Search | OpenSearch | Full-text search across cases, notices, orders, issues, and documents |
| Observability | OpenTelemetry + Grafana + Prometheus + Loki | Metrics, traces, logs, production diagnosis |
| Deployment | Docker Compose first, then Kubernetes | Repeatable deployment without vendor lock-in |
| Reverse proxy | Caddy or Traefik | HTTPS, routing, security headers |

## Core Enterprise Data Model

Minimum PostgreSQL tables:

- `organizations`
- `users`
- `roles`
- `clients`
- `gstins`
- `cases`
- `case_stage_history`
- `notices`
- `orders`
- `hearings`
- `tasks`
- `documents`
- `document_versions`
- `payments`
- `demands`
- `contingent_liabilities`
- `audit_logs`
- `notifications`

## Security Requirements

- Organization-level tenancy on every record.
- Role-based access with policy checks on every API route.
- PostgreSQL constraints for critical fields: GSTIN, case number, stage, amount fields, and owner.
- Immutable audit log for create, update, delete, export, login, document view, and document download.
- MFA-ready SSO through Keycloak.
- JWT/session secret from environment only.
- HTTPS-only production access.
- CORS restricted to exact application origins.
- Daily encrypted database backup and separate object-storage backup.
- No direct internet exposure for the current Excel backend.

## Migration Phases

1. Stabilize current office app: security headers, restricted CORS, safer Excel writes, rotating backups, and environment config.
2. Create PostgreSQL schema and one-way Excel import.
3. Build API modules for cases, clients, hearings, documents, tasks, reports, and audit logs.
4. Move auth to Keycloak and enforce server-side authorization policies.
5. Replace localStorage sync with API-backed state using TanStack Query.
6. Move documents from IndexedDB to MinIO with version history.
7. Add Redis/BullMQ reminders for due dates, hearings, and escalation.
8. Add OpenSearch indexing for case/document discovery.
9. Add observability and backup runbooks.
10. Freeze Excel as export/import only after PostgreSQL is verified.

## Non-Negotiable GST Litigation Features

- Case stage model from SCN to adjudication, appeal, GSTAT, High Court, Supreme Court, closure, and drop.
- Statutory clock tracker for reply, appeal, GSTAT, High Court, refund, and internal review dates.
- Pre-deposit ledger with challan proof.
- Contingent liability classification and provisioning reports.
- Hearing diary with adjournment count.
- Document vault with versioning and missing-document controls.
- Maker-checker workflow for stage changes and closure.
- Client/GSTIN-wise MIS export.
- Full audit trail for every material action.

## Current App Compatibility

The existing Excel workbook remains the source of truth until the PostgreSQL import is validated. The current server now has safer defaults and can continue running on office LAN while the enterprise stack is built module by module.
