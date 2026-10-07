# Schematic fleet map workbench

## TL;DR

Build the approved paired-list map workspace as a complete, clearly labelled
development-only sample. The positions are schematic canvas coordinates, not
geodetic fixes or live tracking. Production keeps an honest unconfigured state
until browser-safe access and a location read model are published.

Status: completed

Milestone: M04 - Semantic Twin and Live UI

## Goal

Let an operator scan spatial context, select an asset from either the map or
its accessible list, and inspect that asset without losing filters or changing
the application frame. Make the reliability and absence of location evidence
obvious before an operator trusts a marker.

## Scope

- Add `/map` to the stable shell and activate its navigation destination.
  Development navigation opts into `?preview=sample`; production never does.
- Compose the three-zone concept: a searchable and filterable asset list, a
  schematic site canvas, and a persistent selected-asset context panel. Keep
  list and marker selection synchronized through one URL-backed asset ID.
- Reuse validated sample asset identity and operational context, but model
  location evidence independently. A telemetry observation time is not a
  position-fix time. Include a separate position observation timestamp,
  receive timestamp, and quality/availability state where displayed.
- Show current, stale/last-known, and unavailable position states with words,
  shape, and time as well as color. Keep unpositioned assets in the list.
- Preserve shareable search/filter/selection state and browser Back. The
  selected context links to the existing asset inspector when sample detail
  exists, and handles assets without detail honestly.
- Match the approved `02-live-map.png` hierarchy across desktop, laptop, and
  narrow layouts in both themes, using the same calm visual language as the
  overview and inspector. Use subtle sample borders/tints and visible
  `Sample data` labels on synthetic regions.
- Cover model consistency, interaction, keyboard/list parity, responsive
  behavior, URL state, and production isolation in focused and Playwright
  tests. Record a bounded fixture-size/performance observation without
  claiming a production fleet-scale benchmark.

## Design decisions

The published backend UI contract currently exposes bounded tenant asset
identity pages, not geodetic coordinates, position timestamps, location
quality, a location history, or a browser-safe authorized read. The existing
overview's percentage positions are illustrative site-layout coordinates.
This slice may render them in a schematic map adapter but must not pass them to
MapLibre as longitude/latitude or present the canvas as real geography. A real
basemap, clustering strategy, tile service, and representative fleet benchmark
follow an agreed location contract and data volume.

The sample scene has one fixed snapshot time, not a live clock. Position
freshness is based only on position evidence and that sample snapshot. It
must remain separate from device connectivity, general telemetry freshness,
and asset condition. Do not render a stale position as live movement or infer
an asset's condition from a missing position.

Both the asset list and canvas operate on the same selected ID and filtered
result. The list is the accessible source of truth; the visual canvas is an
additional spatial interaction. Shareable state belongs in the URL; transient
hover and disclosure stay local. A selected asset may lack position, and a
filter may hide the selected asset. Both states need deliberate UI behavior.

## Acceptance criteria

- The Map destination opens the sample workbench in development while the
  production route and direct `?preview=sample` URL expose no fixture data.
- Selecting a row or marker updates the same context panel and shareable URL.
  Browser Back restores prior selection and filters.
- A keyboard user can find and select every asset through the list, including
  unpositioned assets, without operating the canvas.
- Map and list apply the same filters and explain empty, no-match, and hidden
  selection states without inventing a fleet total.
- Position timestamps and quality are distinct from generic telemetry
  observation and connectivity. Stale and unknown are never presented as
  current, healthy, or zero.
- The three zones reflow without document-level horizontal overflow at wide,
  laptop, and narrow widths. Light and dark share one information hierarchy.
- `pnpm check` and both production and development Playwright suites pass;
  any material limitation is recorded before completion.

## Out of scope

A live location stream, real basemap or tile hosting, MapLibre integration
without geodetic data, trails, speed heatmaps, geofences, dispatch controls,
alert lifecycle, and browser use of the backend workload bearer.

## Acceptance evidence

- pnpm check passed on 7 October 2026: Biome, TypeScript, dependency
  boundaries, view-size policy, documentation, design tokens, pinned contract,
  47 component tests, three unit tests, and production build.
- pnpm e2e passed: ten production and eleven development Chromium journeys.
  The map journeys cover synchronized list/marker selection, URL and browser
  history, every filter, absent positions, table parity, narrow layout, dark
  theme, and production sample isolation. The final layout and filter-history
  changes also passed all three focused development map journeys.
- Reviewed 1440 px light and dark desktop and 390 px dark narrow screenshots
  against the approved live-map concept. The three zones retain their hierarchy;
  the desktop list scrolls its rows within a bounded pane and the narrow layout
  has no document-level horizontal overflow.
- The bounded sample has eight asset rows and seven schematic markers; one
  unpositioned asset remains selectable from the list. This is a fixture-size
  observation, not a benchmark for a production fleet.
- Live data remains intentionally unavailable. A browser-safe authorized
  location read model with geodetic fixes, observation/receive times, quality,
  and a representative fleet size is required before a real basemap, clustering,
  or performance benchmark can be selected.
