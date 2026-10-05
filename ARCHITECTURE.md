# Architecture

## TL;DR

FleetIQ UX is a SolidJS web-only operator console. The scaffold has no backend
requests or product screens yet. The app layer composes routes and providers;
features own their model, transport adapter, and UI. Effect v4 is the async and
granular-state foundation. Design and map choices are documented separately
before implementation.

## Structure

- `apps/web`: Vite application, Solid router, Effect Atom registry, Tailwind.
- `apps/web/src/app`: application composition and route-owned pages.
- `apps/web/src/features/<capability>`: capability code, added as features
  arrive. Prefer `model`, `api`, and `ui` only when each has a real purpose.
- `apps/web/src/shared`: reusable web code without feature imports.
- `packages`: future stable contract or design-token packages. This directory
  is deliberately empty in the scaffold.
- `tools`: deterministic repository checks.

The dependency direction is app composition → feature UI → feature model and
API boundary. Models must not import UI, transport, browser globals, or map
SDKs. External API payloads become trusted client values only after runtime
validation. The backend remains the authority for tenant and permission checks.

The import gate enforces cycles and basic inward direction. It cannot prove
that a capability is correctly modelled; reviewers must still examine behavior
and trust boundaries.

## State and effects

Solid signals, memos, and stores own local and derived view state. The URL
owns shareable navigation and selection. Effect v4 owns complex async work,
including future telemetry connection lifetimes and retry policy. The official
`@effect/atom-solid` binding connects Effect atoms to Solid at the app boundary.
The first API feature will decide snapshot caching and mock transport using a
concrete contract, avoiding duplicate caches.

## Intentional limits

The scaffold does not define a dashboard layout, visual tokens, backend
endpoint, map style, tile service, or mobile application. See
[FRONTEND.md](docs/FRONTEND.md) for the current stack and
[PLANS.md](docs/PLANS.md) for sequencing.
