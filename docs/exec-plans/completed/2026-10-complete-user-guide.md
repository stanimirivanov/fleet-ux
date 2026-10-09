# Complete FleetIQ web user guide

## TL;DR

Build one executable guide for the implemented web UI: a production orientation
chapter and five clearly marked development-sample walkthroughs. The sample
chapters teach interactions and evidence reading without claiming that fleet
data, browser identity, live telemetry, or alert operations are connected.

Status: completed

Milestone: M04 - Semantic Twin and Live UI

## Goal

Give a new operator a coherent, browser-verified path through every implemented
FleetIQ workspace. Keep each chapter useful as an ordinary Playwright regression
test, and publish a complete guide only when all chapters pass.

## Scope

- Retain the production console orientation chapter: shell navigation, honest
  unconfigured states, status vocabulary, and appearance preference.
- Add a sample fleet overview and asset-discovery chapter: summary and map
  context, attention and data-quality panels, URL-backed filters, bounded
  catalogue pages, cursor navigation, and return to the unconfigured state.
- Add a sample map chapter: paired list and schematic canvas, selection,
  filters, position evidence, browser history, and table or narrow-screen use.
- Add a sample asset-inspector chapter: selected identity, modeled topology,
  signal evidence and provenance, timeline, and finite playback with its
  freshness and recovery states.
- Add a sample registry chapter: directed structure, exact signal mappings,
  source attribution, unresolved evidence, and effective/known-time review.
- Add a sample Alerts chapter: priority queue, filters and URL selection,
  evidence quality and freshness, trend/table, timeline, and asset navigation.
- Generate Markdown and static HTML from tagged Playwright journeys with
  screenshots and video. Label the production and sample sections distinctly,
  reject failed or missing chapters, and keep generated media out of Git.
- Update CI and contributor/testing documentation for the two-suite guide.

## Design decisions

The guide is partitioned by data mode. Only the shell and unconfigured states
are production behavior. Every functional fleet walkthrough uses deterministic,
development-only synthetic data and must say so in the chapter and generated
book. A generated guide must never imply operational acknowledgement,
resolution, real positioning, a live stream, or authorized backend access.

Page objects own semantic locators and reusable actions. Scenarios own
assertions and narrative sequence; the same tagged scenarios run without media
recording in the ordinary development E2E suite. Guide mode runs serially with
longer timeouts for recording, without adding timing sleeps to test mode.

## Acceptance criteria

- All six chapters have substantial verified steps and cover the listed UI
  panels and user actions without misleading production claims.
- `pnpm check`, both `pnpm e2e` suites, and `pnpm guide:generate` pass.
- The generated index distinguishes production orientation from development
  samples; each sample chapter visibly identifies its synthetic source.
- Failed or missing guide scenarios leave no publishable partial book.
- The guide workflow builds both suites and publishes only a complete book.
- Documentation names the chapter contents and the production limitations.

## Out of scope

Backend browser identity, live data access, geodetic maps, real alert
evaluation or lifecycle, native mobile, customer procedures, and API expansion.

## Acceptance evidence

- `pnpm check` passed: Biome, TypeScript, dependency boundaries, view-size policy, docs, design tokens, pinned contract, 3 pure tests, 89 Solid component tests, 3 guide-assembly tests, and the production build.
- `pnpm e2e` passed: 12 production and 24 development Playwright scenarios, including the six guide-producing journeys in ordinary test mode.
- `pnpm guide:generate` passed: one production orientation and five development-sample chapters, 96 annotated steps, six videos, and complete Markdown/HTML books.
- The generated home and sample chapter pages distinguish synthetic previews from production behavior; failure tests reject missing or wrongly labelled chapters.
- The guide workflow publishes only after the web quality gate; GitHub Pages must be configured to use GitHub Actions before first deployment.
