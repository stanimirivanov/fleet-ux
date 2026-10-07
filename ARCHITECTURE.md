# Architecture

## TL;DR

FleetIQ UX is a SolidJS web-only operator console. Solid Router's root layout
keeps the shell mounted across routes. The app layer composes routes and
providers; features own their model, transport adapter, and UI. Effect v4
supplies boundary schemas now and will own complex async workflows when
needed. Local development renders a labelled sample overview by default and offers
an explicit asset catalogue preview. Production and the ordinary asset route
remain unconfigured because browser-safe backend access does not exist yet.

## Structure

- apps/web: Vite application, Solid router, Tailwind.
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

App composition imports features through their public `index.ts` entry; app
and feature code import shared UI through `#shared/ui`. Named exports keep
those surfaces deliberate. Internal files import siblings directly to avoid
barrel cycles. The package import map in `apps/web/package.json` removes
relative path depth and names each public entry explicitly. TypeScript, Vite,
and dependency-cruiser resolve that same map. The import gate enforces public
entries, unresolved package imports, cycles, same-feature private imports, and
basic inward direction. Biome checks Solid props/list rendering and keeps
Effect imports out of presentation TSX. `pnpm view:check` flags oversized page and
root-view files. These gates cannot prove a component has one responsibility;
reviewers must still examine behavior, composition, layout, and trust boundaries.
See the [frontend structure guide](docs/development/frontend-structure.md).

## State and effects

Solid signals, memos, and stores own local and derived view state. The app
theme uses a signal, a versioned browser preference, and a media-query
listener. The URL owns navigation and future shareable selection/filter state.
Effect v4 defines the validated boundary and will own complex async work,
including future telemetry connection lifetimes and retry policy. Introduce
the official Solid Atom binding only when a real shared granular-state use
requires it; the theme button does not need an Effect runtime.

The pinned asset-catalogue contract has a validated feature boundary and an
import-only fixture reader. Local development's default overview composes
asset identities with a separate sample operational projection keyed by asset
ID; it does not add synthetic fields to the backend model. Each synthetic
panel discloses its source. `/assets?preview=sample` opts into a labelled,
bounded catalogue preview only in Vite development. Contract-shaped pages flow
through the reader and validation boundary. The ordinary `/assets` route and
both production routes remain unconfigured; production output contains no
fixture payload or sample activation path. Loading, empty, and error states
describe the reader result rather than implying a live fleet status.
The preview keeps the reader's opaque exclusive cursor in the URL. A next-page
link follows the returned cursor; a first-page link resets traversal, while
browser history moves between visited pages. It makes no total-count or reverse
pagination claim. Invalid cursor syntax never reaches the reader.
The fixture reader currently keeps a small `Promise` and `AbortSignal` port;
Effect v4 Schema validates boundary payloads and known failures are normalized
before presentation. A live adapter will map generated Effect failures through
a managed runtime and preserve cancellation when browser-safe identity exists.
That first live API feature will decide snapshot caching and transport
composition, avoiding duplicate caches.

## Visual foundation and limits

The [operational visual language](docs/design-docs/0001-operational-visual-language.md)
and [shell/theme decision](docs/design-docs/0002-persistent-shell-theme.md)
record the approved direction. Semantic CSS tokens map into Tailwind
utilities, while shared UI primitives remain domain-neutral. The persistent
shell has a stable top bar and desktop left navigation; its main content
changes within one route outlet.

The application has no live backend connection, map renderer, tile service,
or mobile application. Its static overview map is sample spatial scaffolding,
and its sample catalogue is fixture data, not an observed fleet. The pinned
backend-owned contract is in
[contracts/http](contracts/http/README.md); its current workload bearer secret
is not a browser login mechanism. See [FRONTEND.md](docs/FRONTEND.md) for the
selected stack and [PLANS.md](docs/PLANS.md) for sequencing.
