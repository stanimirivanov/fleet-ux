# Fleet overview and asset discovery design slice

Status: completed on 7 October 2026

Milestone: M04 - Semantic Twin and Live UI

## Goal

Build a coherent, responsive fleet overview and asset discovery experience from
the approved v1 design while keeping the current backend boundary truthful.

## Scope

- Compose compact fleet metrics, a map-shaped spatial preview, asset discovery,
  attention queue, data quality, and energy/utilization panels in one stable
  application frame.
- Render the local development overview from a separate deterministic demo
  projection. Keep operational condition, connectivity, freshness, alerts, and
  positions distinct from the contract-backed asset identity model.
- Give every synthetic panel a subtle visual treatment and a visible
  "Sample data" label that can be removed when a real read model replaces it.
- Make URL-backed overview search, type, condition, and connectivity
  filters useful against the complete local sample set. Retain the bounded,
  shareable cursor flow in the asset catalogue preview at `/assets?preview=sample`.
- Keep the production build in an unconfigured state with no fixture payload or
  implied live readings. Cover desktop/narrow layouts and source disclosure in
  Solid and Playwright checks.

## Design decisions

The approved v1 overview is the visual direction: restrained light-first
industrial surfaces, compact top bar and left navigation, dense information
panels, and a two-column wide layout that stacks at narrow widths. Dark uses the
same hierarchy. This PR implements a static, accessible map preview; a live map
SDK waits for a backend location contract and map service. Synthetic operational
data lives in a development-only adapter, outside `AssetSummary`, and is keyed
by internal asset ID. Overview search and facet filters apply to the local
sample set only and are never presented as server-side search. The existing
catalogue reader remains the sole boundary for contract-shaped asset pages.

## Acceptance criteria

- Local development `/` shows all six named sections with explicit per-panel
  sample disclosure; asset condition, gateway connection, and data freshness
  are separate labels.
- The URL-backed overview search and type, condition, and connectivity facets
  change visible sample rows. A link reaches the detailed sample catalogue;
  the existing cursor journey reaches later assets and preserves history.
- The page is usable at desktop and narrow widths with no document-level
  horizontal overflow; the main frame stays stable while navigating.
- The production build shows no synthetic overview or catalogue data, even
  when a sample query parameter is supplied.
- `pnpm check` and production plus development Playwright suites pass, with
  a documented limitation if any check cannot run.

## Out of scope

Live identity and HTTP reads, real telemetry/location/alert/calculation
contracts, geofence editing, map tile hosting, native mobile, and operational
action controls.

## Acceptance evidence

- `pnpm check` passed: formatting, TypeScript, dependency boundaries, view
  size, documentation, design tokens, contract, unit and component tests, and
  the production build.
- `pnpm e2e` passed on isolated local ports: eight production and five
  development Chromium scenarios. The final Type facet and dark-theme assertions
  passed a focused development overview rerun (two scenarios).
- Production browser checks show the overview and asset catalogue remain
  unconfigured, and a production-output search found none of the sample asset
  names, alert IDs, or fixed-snapshot copy.
- The development browser journey verifies six disclosed panels, URL-backed
  search and facets, stable desktop/narrow layout, and navigation into the
  bounded catalogue. The catalogue journey reaches all eight fixtures,
  preserves browser history, and recovers from invalid or exhausted cursors.
- Remote CI remains pending until the branch is pushed.
