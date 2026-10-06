# Navigate bounded asset catalogue pages in the development preview

Status: completed on 6 October 2026

Milestone: M02 - Product Foundation

## Goal

Make every page exposed by the pinned asset catalogue reader reachable in the
explicit development preview, with a shareable forward cursor and honest empty
and invalid-cursor states.

## Scope

- Read and write the opaque `after` cursor in the development preview URL.
- Add next-page and first-page controls without inventing a total count or
  reverse-pagination capability that the backend contract does not provide.
- Use a small fixture page size to exercise the existing reader's cursor path.
- Keep reader requests reactive to URL changes and discard late results from
  superseded requests.
- Cover direct links, browser history, invalid cursors, and production
  isolation in component and browser tests.

## Design decisions

The backend contract offers exclusive forward keyset pagination. A next-page
link uses the validated `nextAfter` value; a first-page link clears the cursor.
Browser history supplies back/forward navigation. URL cursors remain opaque and
are not converted into page numbers or compared with JavaScript collation.
Preview activation and fixture payloads remain development-only.

## Acceptance criteria

- The three fixture assets are reachable over two bounded sample pages.
- A direct valid cursor URL loads the expected page; invalid syntax offers a
  first-page recovery link without retrying a doomed reader request.
- Next and first-page actions preserve the sample flag and browser history.
- Exhausted pages do not claim that a connected fleet is empty.
- Production ignores preview and cursor parameters and excludes fixture data.
- pnpm check and both production and development E2E suites pass.

## Out of scope

Live authentication and HTTP reads, server-side search, fleet totals, reverse
pagination, asset details, telemetry, maps, and native mobile clients.

## Acceptance evidence

- `pnpm check` passed: formatting, typecheck, architecture, documentation, design, contract, unit and component tests, and production build.
- `pnpm e2e` passed: 7 production and 3 development Chromium scenarios, including the full two-page journey, direct later-page link, history, narrow viewport, invalid and exhausted cursors, and production isolation.
- The production bundle contains none of the sample asset identifiers or preview labels.
- Remote CI remains pending until this branch is pushed.
