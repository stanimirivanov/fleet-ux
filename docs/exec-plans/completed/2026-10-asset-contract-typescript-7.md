# Pinned asset catalogue contract and TypeScript 7

Status: completed on 6 October 2026

Milestone: M02 - Product Foundation

## Goal

Consume the backend's first bounded asset read contract as a trustworthy UI
boundary while moving the whole workspace to the stable TypeScript 7 compiler.

## Scope

- Pin the backend-owned OpenAPI UI baseline at an exact platform commit and
  record its digest and update procedure.
- Validate unknown asset-page payloads with Effect v4 Schema and translate
  wire fields into a feature model. Keep tenant, page-size, and cursor
  checks at the boundary.
- Add a feature-facing reader port and deterministic fixture reader for later
  development, with focused parser, fixture, and contract-example tests.
- Upgrade TypeScript across all workspace packages and the lockfile.
- Correct the current asset workspace copy now that a contract exists, while
  continuing to show the honest unconnected state.

## Design decisions

The current backend bearer secret is a single-principal workload credential,
not a browser login. No live browser adapter, credential injection, or fixture
mode is activated in this PR. The OpenAPI file is a pinned source snapshot;
Effect Schema was a manually maintained runtime projection in this slice.
The evaluated `openapi-typescript` generator required a programmatic compiler
API absent from TypeScript 7.0, so this slice deferred generated wire types.

## Acceptance evidence

- `pnpm contract:check` verifies the copied OpenAPI bytes against the backend
  commit and SHA-256 recorded in `contracts/http/source.json`.
- The backend-published 200 example decodes; parser and fixture tests reject
  malformed, oversized, duplicate, cross-tenant, and non-advancing pages.
  Deterministic fixture pagination uses the same parser and reader port.
- `pnpm exec tsc --version` reports 7.0.2. Frozen install and peer checks pass.
- `pnpm check` passes formatting, TypeScript, architecture, documentation,
  design contrast, contract integrity, three pure tests, twelve Vitest tests,
  and production build.
- `pnpm e2e` passes six Chromium browser tests. `pnpm guide:generate` produces
  the 13-step executable guide with updated, accurate connection wording.
- Remote CI was not run locally; the existing workflows will verify the branch
  when pushed to GitHub.

## Out of scope

Catalogue rendering, live HTTP and browser authentication, location and signal
read models, telemetry, maps, and native mobile clients.

## Post-completion correction

The TypeScript 7.0 limitation above applies to `openapi-typescript`, not to
OpenAPI generation generally. The official Effect v4 generator works with this
workspace and is integrated in the [Effect OpenAPI generation follow-up](2026-10-effect-openapi-generation.md).
The original scope and acceptance evidence remain recorded above.
