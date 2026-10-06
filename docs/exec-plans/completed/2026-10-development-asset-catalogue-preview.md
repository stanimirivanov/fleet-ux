# Development asset catalogue preview

Status: completed on 6 October 2026

Milestone: M02 - Product Foundation

## Goal

Make the pinned asset catalogue visible for local design and behavior review
without implying that the browser has a production data connection.

## Scope

- Render a contract-shaped catalogue from the deterministic feature reader
  only when a developer opens `/assets?preview=sample` in Vite development
  mode. Label the records as sample data.
- Keep `/assets` in its honest unconfigured state by default. A production
  build ignores the preview query and excludes fixture payloads.
- Model and render loading, populated, empty, and error reader outcomes with
  accessible status language and stable shell layout.
- Add focused component and browser coverage. Use a separate Playwright
  development-server suite for the sample flow; preserve the production E2E
  suite and its guide-producing journeys against the built application.
- Update architecture and frontend guidance to explain the sample boundary
  and the continued browser authentication limitation.

## Design decisions

The URL query is an explicit development inspection switch. Fixture data
enters through the existing `AssetCatalogueReader` boundary and its runtime
validation; the route must not bypass parsing or construct trusted asset
models directly. Keep sample payloads out of the production bundle and avoid
shipping hidden sample-mode switches. The generated HTTP client remains
unconnected because the backend's bearer is a workload secret. A component
test may inject reader outcomes to verify states without exposing testing
controls as product routes. No map, location, health, or telemetry is inferred
from catalogue fields.

## Acceptance criteria

- Development `/assets?preview=sample` shows a clearly marked, usable
  catalogue from the pinned fixture; default `/assets` remains unconfigured.
- Loading, empty, and error states are distinguishable and accessible.
- Production `/assets?preview=sample` still shows the unconfigured state, and
  the production output contains no fixture payload.
- Component tests cover reader states. Development-server Playwright tests
  cover the opt-in preview; production Playwright tests and guide remain
  accurate.
- `pnpm check`, production E2E, and the separate development E2E suite pass,
  or any limitation is recorded with its exact outcome.

## Acceptance evidence

- `pnpm check` passes Biome, strict TypeScript 7 typechecking, dependency
  boundaries, documentation, design tokens, contract integrity, three Node
  tests, sixteen Vitest tests, and a production build.
- `pnpm e2e` passes seven production-preview and two development-server
  Chromium scenarios. The production query remains unconfigured; the
  development journey covers explicit opt-in, populated catalogue, navigation
  history, exit, and narrow-width layout.
- Focused component tests cover loading, populated, empty, retry-after-error,
  and stale tenant-response behavior through an injected reader.
- The production output contains no fixture IDs or names, sample catalogue
  heading, or sample-view link. An inert shell source-label literal remains;
  it cannot activate preview mode. The generated client still makes no live
  browser requests.
- Documentation and diff checks pass. Remote CI remains pending until the
  branch is pushed. Guide generation was not rerun; its production browser
  journey passed in the production E2E suite.

## Out of scope

Browser sign-in, live protected reads, backend API changes, location or signal
read models, maps, native mobile clients, and adding a sample catalogue to
the production user guide.
