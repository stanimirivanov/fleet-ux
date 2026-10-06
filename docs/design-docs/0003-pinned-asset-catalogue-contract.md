# ADR 0003: Pin the backend asset catalogue contract before rendering it

Status: accepted, 6 October 2026

## Context

The backend now publishes an OpenAPI 3.1 UI baseline for version discovery and
a bounded tenant asset catalogue. FleetIQ UX needs stable test payloads while
the backend and web app evolve in parallel. The protected route currently uses
a single-principal workload bearer secret, not a browser-safe sign-in flow.

TypeScript 7 is the workspace compiler. The currently established
`openapi-typescript` generator requires a programmatic TypeScript compiler API
that TypeScript 7 does not yet provide.

## Decision

Pin the exact backend contract artifact and revision in `contracts/http`.
Keep its wire shape separate from the asset feature model. Effect v4 Schema
validates unknown page payloads at the boundary; cross-field checks enforce
the requested tenant and bounded cursor semantics. The published 200 response
example and deterministic fixtures must pass the same boundary tests.

Expose a feature-facing catalogue reader and an import-only fixture adapter.
The default application continues to show an unconnected state. A later PR
may opt into explicitly labeled development sample mode. A live browser
adapter waits for an approved identity flow and never embeds the workload
bearer secret.

## Consequences

Contract changes require an explicit snapshot update and reconciliation of
the maintained runtime schema and tests. No generated wire types are claimed.
When a TypeScript 7-compatible generator exists, generation can be added
without changing the trusted feature model or reader port. The current UI
cannot claim asset locations, health, telemetry, or a complete fleet count;
none is available in this contract.

## Alternatives considered

Using the workload bearer in a browser would expose a server credential and
misrepresent the authentication model. Hand-writing a live HTTP adapter now
would leave that problem unresolved. Installing the current OpenAPI generator
against TypeScript 7 would require a parallel older compiler solely for its
AST API; this small baseline does not justify that toolchain yet.
