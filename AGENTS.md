# Repository working agreement

## TL;DR

Build one reviewable SolidJS web slice at a time. Keep product features
independent, parse external data at the boundary, and run `pnpm check` before
handoff. Mobile development is deferred and will use native platforms.

[CONTRIBUTING.md](CONTRIBUTING.md) owns the contribution workflow. The
[documentation map](docs/README.md) routes work to the relevant guide. The
[frontend structure guide](docs/development/frontend-structure.md) defines
component, reactivity, and presentation review criteria.

## Before changing code

1. Inspect the branch and working tree; preserve unrelated changes.
2. Read the documentation map and only the guides relevant to the task.
3. Check [ARCHITECTURE.md](ARCHITECTURE.md) before adding a dependency or
   crossing a feature boundary.
4. Keep the [execution plan](docs/PLANS.md) current for the reviewable slice.

## Architecture rules

- `apps/web/src/app` composes routes and providers. A feature never imports
  app composition or another feature's private files.
- `features/<name>/model` is pure TypeScript. Transport adapters and Solid
  components depend on it, never the other way around.
- `shared` contains small, product-neutral web utilities and components. It
  must not import features. Create a package only for a real stable boundary.
- Cross-boundary imports use explicit public entries such as `#shared/ui` and
  `#features/assets`; within an owner, import sibling files directly. The
  package import map shortens paths but never bypasses dependency direction.
- Use Solid signals, stores, and memos for local view state. Use Effect v4
  for complex async work where it adds value. Introduce Atom-backed shared
  state and its Solid binding with an actual use. Do not introduce v3 APIs.
- Pin backend-owned contracts at an exact revision. Validate unknown payloads
  before constructing feature models; never use the platform workload bearer
  secret in the browser.
- Keep shareable filter and selection state in the URL. Keep server-owned data
  behind a validated API boundary; the backend remains authoritative for
  tenancy and permissions.
- Treat browser telemetry and HTTP responses as untrusted. Show loading,
  empty, stale, offline, unauthorized, and error states where relevant.
- Keep map SDK calls in a map adapter rather than scattering them through
  product features.
- Pages compose named sections. Keep low-level interaction state with its
  component; parent layouts own outer spacing and width. Apply the
  [frontend review guide](docs/development/frontend-structure.md).
- Presentation TSX never imports Effect runtime modules. Feature services
  own execution, typed failures, and cancellation.

## Evidence

Run focused checks during development, then `pnpm check` and `pnpm e2e`
for browser changes before handoff. A skipped check is not a pass. Document
the repository, milestone, copy-ready
issue, and exact pass/fail/not-run status per [CONTRIBUTING.md](CONTRIBUTING.md).
