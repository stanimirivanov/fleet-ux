# Generate Effect transport code from the pinned OpenAPI contract

Status: completed on 6 October 2026

Milestone: M02 - Product Foundation

## Goal

Replace the manually maintained asset-page wire schema with generated Effect v4
transport code and detect drift between that code and the pinned backend
contract while retaining the feature's semantic validation.

## Scope

- Pin `@effect/openapi-generator` and its `@effect/platform-node` CLI peer at
  4.0.1; generate a schema-backed HTTP client into
  `apps/web/src/generated/fleetiq-api.ts`.
- Decode unknown asset-page payloads with the generated `AssetPage` schema
  before applying maintained tenant, uniqueness, page-size, and cursor checks.
- Add `pnpm contract:generate` for reproducible output and extend
  `pnpm contract:check` to reject generated-code drift or generator warnings.
- Update the contract and frontend documentation to distinguish the
  `openapi-typescript` limitation from the compatible Effect generator.

## Design decisions

Use the official generator's `httpclient` format because it emits runtime
schemas, TypeScript types, and a client. The generated `AssetPage` uses Effect
Schema's `StructWithRest` form, not the illustrative `Schema.Class` form. In a
local comparison, `httpclient` emitted no warnings; `httpapi` warned that it
dropped response headers, and `httpclient-type-only` did not compile with
TypeScript 7.0.2. Keep generated code separate from the feature model. The
generated client is not connected to the browser while the backend requires a
workload bearer credential.

## Acceptance evidence

- The pinned OpenAPI published 200 example decodes through generated Schema;
  existing negative parser and fixture cases continue to reject malformed,
  oversized, duplicate, cross-tenant, and non-advancing pages.
- `pnpm contract:check` verifies the pinned OpenAPI digest and detects changes
  to the committed generated output. Generation emits no warnings.
- `pnpm check` passes formatting, strict TypeScript 7.0.2 typechecking,
  architecture, documentation, design, contract, unit, component, and build
  checks. Frozen installation and peer checks pass.
- Browser E2E was not rerun because this slice does not change rendered UI or
  browser navigation. Remote CI remains pending.

## Out of scope

Live HTTP requests, browser authentication, catalogue rendering, changing the
backend contract, and replacing feature-level semantic checks with generated
transport validation.
