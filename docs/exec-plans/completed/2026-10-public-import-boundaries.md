# Public import boundaries

Status: completed on 6 October 2026
Milestone: M02 - Product Foundation

## Goal

Make shared UI and asset feature imports concise while keeping cross-module
dependencies explicit and enforceable.

## Scope

- Add named public entries for shared UI primitives and the assets feature.
- Route external consumers through those entries and a package import map.
- Extend dependency-cruiser and the contributor harness so deep and unresolved
  package imports fail the architecture check.
- Verify the rules with deliberate temporary violations, then run the
  repository quality and browser gates.

## Design decisions

- A barrel declares a public surface; the package import map removes relative
  path depth and publishes only explicit entry names.
- Internal imports remain direct to avoid self-barrel cycles.
- A feature entry exports only app-facing route and status decisions. Other
  directories do not receive barrels without real cross-boundary callers.

## Acceptance criteria

- App and feature consumers import shared primitives from `#shared/ui`.
- App composition imports the assets feature from `#features/assets`.
- TypeScript, Vite, and dependency-cruiser resolve package imports consistently.
- Deliberate deep imports and unresolved `#` imports fail `pnpm architecture`.
- `pnpm check` and browser journeys pass with no product behavior change.

## Acceptance evidence

- `pnpm check` passed: formatting, typecheck, dependency boundaries, view
  size, documentation, design tokens, pinned contract, pure/component tests
  (3 + 25), and production build.
- `pnpm e2e` passed: 7 production and 3 development Chromium journeys on
  dedicated ports 4182 and 5182.
- A temporary source probe confirmed deep shared UI imports, deep feature
  imports, and unresolved package imports each fail `pnpm architecture`.
  The probe was removed.
- Remote CI remains pending until this branch is pushed.

## Out of scope

New UI components, product behavior, generated transport exports, and
blanket barrels for internal folders.
