# Architecture

## TL;DR

FleetIQ UX is a SolidJS web-only operator console. Solid Router's root layout
keeps the shell mounted across routes. The app layer composes routes and
providers; features own their model, transport adapter, and UI. Effect v4 is
the async and granular-state foundation. The current routes contain honest
unconfigured states and a synthetic design specimen; no backend requests
exist yet.

## Structure

- apps/web: Vite application, Solid router, Effect Atom registry, Tailwind.
- apps/web/src/app: router root layout, route-owned pages, and the small theme
  preference lifecycle.
- apps/web/src/design-system: semantic light/dark theme tokens.
- apps/web/src/features/<capability>: capability code, added as features
  arrive. Prefer model, api, and ui only when each has a real purpose.
- apps/web/src/shared: reusable web code without feature imports.
- packages: future stable contract or design-token packages. This directory
  is deliberately empty until a real cross-application boundary exists.
- apps/web-e2e: Playwright page objects, scenario assertions, and optional
  user-guide narration; it depends on the running web app, never the reverse.
- tools: deterministic repository checks and guide assembly.

The dependency direction is app composition → feature UI → feature model and
API boundary. Models must not import UI, transport, browser globals, or map
SDKs. External API payloads become trusted client values only after runtime
validation. The backend remains the authority for tenant and permission checks.

The import gate enforces cycles and basic inward direction. It cannot prove
that a capability is correctly modelled; reviewers must still examine
behavior and trust boundaries.

## State and effects

Solid signals, memos, and stores own local and derived view state. The app
theme uses a signal, a versioned browser preference, and a media-query
listener. The URL owns navigation and future shareable selection/filter state.
Effect v4 owns complex async work, including future telemetry connection
lifetimes and retry policy. The official @effect/atom-solid binding remains at
the app boundary; a theme button does not need an Effect runtime.

The pinned asset-catalogue contract has a validated feature boundary and an
import-only fixture reader. It is not wired into a browser route. The first
live API feature will decide snapshot caching and transport composition,
avoiding duplicate caches.

## Visual foundation and limits

The [operational visual language](docs/design-docs/0001-operational-visual-language.md)
and [shell/theme decision](docs/design-docs/0002-persistent-shell-theme.md)
record the approved direction. Semantic CSS tokens map into Tailwind
utilities, while shared UI primitives remain domain-neutral. The persistent
shell has a stable top bar and desktop left navigation; its main content
changes within one route outlet.

The application has no live backend connection, mock server, map renderer,
tile service, or mobile application. The pinned backend-owned contract is in
[contracts/http](contracts/http/README.md); its current workload bearer secret
is not a browser login mechanism. See [FRONTEND.md](docs/FRONTEND.md) for the
selected stack and [PLANS.md](docs/PLANS.md) for sequencing.
