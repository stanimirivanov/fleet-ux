# Asset inspector sample slice

## TL;DR

Build the approved asset inspector as a complete development-only slice for a
rail asset and a refrigerated trailer. Use one typed sample projection for
topology, readings, source, quality, time, and history. Production must show an
honest unconfigured state until protected read models and browser-safe access
exist.

Status: completed

Milestone: M04 - Semantic Twin and Live UI

## Goal

Let an operator move from a discovered asset to its physical topology, inspect
a selected component, and understand what evidence supports a reading without
confusing asset condition, gateway connectivity, or telemetry freshness.

## Scope

- Add an asset detail route at /assets/:assetId and preserve the existing shell
  and content origin when entering it from the overview or catalogue.
- Compose the inspector from named sections: asset identity and independent
  status labels, searchable component topology, selected component readings and
  synchronized evidence, and an evidence/context panel for source, time,
  quality, and unattributed signals.
- Supply deterministic, clearly disclosed sample scenes for asset-004
  (Electric locomotive 417) and asset-008 (Refrigerated trailer 11). Keep
  topology and operational readings outside the backend-shaped AssetSummary.
- Put selected component state in the URL. Preserve catalogue/overview context
  and browser Back behavior. Do not imply that a component is a tracker or that
  disconnected telemetry establishes asset condition.
- Match the approved light and dark asset-inspector concepts. Keep the
  three-zone desktop hierarchy, reflow context beneath the selected component
  at narrower widths, and retain essential reading and source information on a
  narrow web viewport.
- Cover development and production states with component and Playwright tests,
  including a meaningful long journey through multiple nodes and a
  non-locomotive asset.

## Design decisions

The concept images are directional and contain internally inconsistent
synthetic readings. A single typed sample scene owns each value, unit, band,
chart series, event time, receive time, quality, source, and attribution state;
presentation does not invent them independently. A "Sample data" label and
subtle panel treatment identify every synthetic evidence section. Shareable
component selection uses a URL query parameter; transient disclosures stay
local. Charts have a textual or tabular reading alternative and mark absent
evidence explicitly. Controls without a working contract remain absent or
visibly unavailable.

The published backend contract currently provides bounded tenant-scoped asset
identity pages, not a browser-safe asset-detail, topology, attributed signal,
history, or provenance read model. The preview can validate interaction but
cannot make these synthetic fields live in production.

## Acceptance criteria

- Selecting a rail asset from discovery opens its inspector without a shell
  jump, and the browser can return to the prior route and filters.
- Rail and trailer preview scenes show different topology and component
  evidence; selecting a node updates both the visible evidence and a shareable
  URL.
- Condition, connectivity, and freshness remain separate, with unknown and
  stale states never displayed as healthy or current evidence.
- Readings show unit, an explicitly illustrative sample band where available,
  event and receive time, quality, source, and mapping/attribution context.
  Missing evidence is labelled rather
  than rendered as zero.
- At wide, laptop, and narrow widths, topology, selected evidence, and context
  remain navigable without document-level horizontal overflow. Light and dark
  themes keep the same hierarchy.
- The production build cannot expose sample scenes, even with
  ?preview=sample or a direct detail URL, and gives an honest connection state.
- pnpm check and both production and development Playwright suites pass.
  Record any limitation accurately before moving this plan to completed.

## Out of scope

Live telemetry subscriptions, real normal bands and anomaly calculation,
backend alert lifecycle, operational controls, work orders, map workbench,
native mobile, and adding browser workload-bearer credentials.

## Acceptance evidence

- pnpm check passed on 7 October 2026: Biome, TypeScript, dependency boundaries,
  view-size policy, documentation, design tokens, pinned contract, 38 component
  tests, three unit tests, and production build.
- pnpm e2e passed: nine production and eight development Chromium journeys.
  The rail journey covers URL selection, history gaps, tables, tabs, provenance,
  browser history, and dark theme; the trailer journey covers absent readings
  and narrow-screen layout. Direct production detail URLs expose no sample data.
- Reviewed generated 1680 px light and dark desktop and 390 px narrow
  screenshots against the approved inspector concepts. The wide layout keeps
  the topology, selected evidence, and context hierarchy; the narrow layout
  stacks those sections without document-level horizontal overflow.
- Live data remains intentionally unavailable. Protected backend metadata
  routes need browser-safe identity and a published UI contract; latest
  telemetry, history, and condition require backend-owned read models.
