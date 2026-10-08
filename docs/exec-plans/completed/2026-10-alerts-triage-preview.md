# Development alert triage and evidence

## TL;DR

Complete the fifth approved FleetIQ concept screen as an explicitly synthetic, development-only alert triage workspace. Let an operator find an alert, inspect its evidence and uncertainty, and navigate to the affected asset without suggesting that acknowledgment or resolution exists in production.

Status: completed

Milestone: M05 - Analytics and Operations

## Goal

Make alert priority, affected asset and component, observed value, trigger basis, source, freshness, and sequence of events understandable in one stable screen. Preserve the visual hierarchy of the approved `04-alert-triage.png` concept and the existing calm, light-first design language.

## Scope

- Add an Alerts route and active development navigation, with a clear production unconfigured state and no synthetic activation in a production build.
- Compose a summary strip, searchable/filterable queue, selected-alert evidence, accessible trend/table, and event timeline as one responsive domain slice.
- Keep query, severity/state filters, and selected alert in shareable URL state. Recover from unknown or stale alert IDs and preserve browser Back/reload behavior.
- Use deterministic development fixtures and pure projections for priority ordering, counts, missing/stale evidence, quality, and selection. Clearly label invented thresholds and times.
- Link to the affected sample asset when a supported inspector exists. Keep asset condition, device connectivity, alert severity, and telemetry freshness distinct.
- Support keyboard selection, visible focus, light/dark themes, desktop and narrow layouts, and no document-level horizontal overflow.
- Add pure, Solid component, and Playwright tests, including production isolation. Update architecture, frontend, testing, and product documentation.

## Design decisions

The backend has no alert lifecycle, alert read model, or browser-safe alert API. Therefore this is an interaction and visual preview only. The sample queue and evidence cannot imply live monitoring, an authorized acknowledgment, a resolved condition, or an actual work order. Do not expose a misleading Acknowledge or Resolve control.

The top summary derives from the same filtered or full sample dataset under an explicitly stated scope. Event time and receipt time remain separate. Thresholds and reference bands are illustrative. A missing observation is not zero, and stale evidence is never presented as a current healthy state.

The route owns URL state; feature models stay pure TypeScript; the development fixture is isolated behind the development route boundary. Page components orchestrate named sections, while each child owns local interaction state. No global store or Effect runtime is needed for a finite in-memory preview.

## Acceptance criteria

- Alerts appears as a usable development destination and matches the approved queue/evidence hierarchy in light and dark desktop views.
- The queue, summary, selected evidence, trend/table, and timeline stay synchronized through filters, selection, Back, direct URL, reload, no-match, and unknown-ID recovery.
- Every sample view is visibly synthetic. Severity, alert state, data quality, and freshness are separately labelled; evidence includes source and event/receipt times.
- No operational acknowledgment, resolution, or work-order mutation is implied. Production access, including `preview=sample`, exposes no synthetic alert data.
- A narrow viewport remains usable with keyboard and screen reader semantics; no horizontal document overflow or focus theft occurs.
- `pnpm check` and both production/development `pnpm e2e` suites pass. Design review and material limitations are recorded.

## Out of scope

Real alert evaluation or lifecycle, notification delivery, ownership, acknowledgment, resolution, suppression, work-order creation, production telemetry, customer thresholds, and analytics recommendations.

## Acceptance evidence

- `pnpm check` passed: Biome, TypeScript, dependency boundaries, page size, documentation, token contrast, contract validation, 89 Vitest checks, and production build.
- `pnpm e2e` passed: 12 production and 19 development Playwright journeys, including Alerts selection, filters, URL history, evidence, asset navigation, narrow layout, and sample isolation.
- Rendered light/dark previews at 1440px and 390px were compared with the approved alert concept. The queue/evidence hierarchy remains intact and no document-level horizontal overflow was found.
- The production bundle contains no sample alert IDs or titles.
