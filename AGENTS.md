# Repository working agreement

## TL;DR

Build one reviewable SolidJS web slice at a time. Keep product features
independent, parse external data at the boundary, and run `pnpm check` before
handoff. Mobile development is deferred and will use native platforms.

[CONTRIBUTING.md](CONTRIBUTING.md) owns the contribution workflow. The
[documentation map](docs/README.md) routes work to the relevant guide.

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
- Use Solid signals, stores, and memos for local view state. Use Effect v4 and
  its official Solid Atom binding for granular shared state and complex async
  work where they add value. Do not introduce v3 APIs.
- Keep shareable filter and selection state in the URL. Keep server-owned data
  behind a validated API boundary; the backend remains authoritative for
  tenancy and permissions.
- Treat browser telemetry and HTTP responses as untrusted. Show loading,
  empty, stale, offline, unauthorized, and error states where relevant.
- Keep map SDK calls in a map adapter rather than scattering them through
  product features.

## Evidence

Run focused checks during development and `pnpm check` before handoff. A
skipped check is not a pass. Document the repository, milestone, copy-ready
issue, and exact pass/fail/not-run status per [CONTRIBUTING.md](CONTRIBUTING.md).
