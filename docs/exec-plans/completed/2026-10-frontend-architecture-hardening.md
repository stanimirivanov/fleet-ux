# Frontend architecture hardening

Status: completed on 6 October 2026
Milestone: M02 - Product Foundation

## Goal

Keep route pages small, preserve Solid reactivity, keep async workflows and
categorized failures behind feature boundaries, and prevent preview copy
from reaching future live views.

## Scope

- Decompose the asset catalogue and app shell into orchestration, feature
  presentation, and lifecycle owners. Deduplicate repeated page headers,
  connection notices, links, asset cards, status rows, and pagination.
- Keep sample opt-in and copy within the development boundary. Preserve
  normal and production behavior.
- Preserve categorized catalogue failures and cancel obsolete fixture reads;
  avoid silent catch-all states and stale in-flight requests.
- Centralize route and preview URL decisions, and keep layout placement in
  parent containers.
- Harden Biome, dependency-cruiser, the page/view size gate, and engineering
  guidance. Add focused tests for behavior and policy. Permit strict
  Playwright server ownership on configurable local ports.

## Design decisions

- Keep the current feature/model/api/ui structure. Extract components around
  semantics and lifecycle, not one component per markup fragment.
- A 150 production-line page/root-view limit is a review trigger, with a
  specific documented exception for cohesive cases. It does not replace
  review of shorter files with multiple responsibilities.
- Solid-specific lint rules and dependency-cruiser enforce what they can
  observe reliably. Presentation review covers repeated JSX, state scope,
  page composition, and outer layout placement.
- The fixture reader keeps its `Promise` and `AbortSignal` port with safe
  failure normalization. Effect v4 Schema validates data now; a future live
  HTTP adapter will map generated Effect errors through a managed runtime
  when browser-safe identity is available.
- The official Effect v4 Solid Atom binding is introduced with a real
  granular shared-state need; an unused provider adds no value.

## Acceptance criteria

- App shell and route pages delegate distinct sections; the catalogue view
  delegates loading/error, list/card, and pagination concerns.
- Fixture preview copy does not appear in a live-ready catalogue view.
- Reactive props remain tracked; derivations are pure and side effects
  dispose resources.
- Current request, contract, and unavailable failure categories retain
  their meaning through the read boundary and render accessible outcomes.
- Architecture, lint, view-size, unit/component, production and development
  browser gates pass.

## Acceptance evidence

- `pnpm check` passed: clean Biome, typecheck, import architecture,
  view-size policy, documentation, design and contract checks, 25 component
  tests, and production build.
- `pnpm e2e` passed: 7 production and 3 development Chromium scenarios on
  local ports 4181 and 5181. An unrelated fixture server occupied default
  port 4173; strict ownership correctly refused to reuse it.
- Temporary violating fixtures confirmed that the Solid lint, Effect import,
  and cross-feature import rules fire; the fixtures were removed.
- The production bundle contains no sample asset identifiers, fixture copy, or preview activation label.
- Remote CI remains pending until this branch is pushed.

## Out of scope

Live browser authentication, protected HTTP reads, telemetry, maps, mobile
clients, and a general-purpose component library.
