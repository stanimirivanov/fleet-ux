# Frontend engineering

## TL;DR

Use SolidJS for rendering and fine-grained local reactivity, Effect v4 for
complex async work and Atom-backed granular shared state, and the router URL
for shareable state. The design foundation now supplies semantic light/dark
tokens and a status specimen. The scaffold still has no API client, mock
server, product shell, or live data.

## Selected foundation

| Concern | Choice |
| --- | --- |
| Web runtime | SolidJS 1.x, Vite, strict TypeScript |
| Routing | @solidjs/router |
| Local state | Solid signals, memos, stores |
| Shared granular state | Effect v4 Atom with @effect/atom-solid |
| Async workflows | Effect v4 services, streams, scopes when required |
| Styling | Tailwind CSS v4 with semantic light/dark CSS tokens |
| HTTP contract | Contract-first OpenAPI and runtime validation in a later slice |
| Mocking | Explicit development preview adapter in a later slice |
| Map | MapLibre adapter and tile delivery in later slices |

Effect core and its Solid binding are pinned to the same 4.0.1 release. No
Effect v3 compatibility layer is planned. The Atom provider is installed at
the application root. Introduce layers and runtime services with the first
actual transport workflow rather than a demonstration-only service.

The [visual-language decision](design-docs/0001-operational-visual-language.md)
defines hierarchy and status semantics. The semantic token sheet in
apps/web/src/design-system/tokens.css is the styling source of truth.
The design:check script verifies selected token contrast pairs. Component
contrast, focus, charts, map overlays, and screen-reader behavior still
require rendered review. The light and dark specimens are synthetic examples;
they are not a theme-preference control or fleet feature.

The future API layer will keep wire DTOs separate from validated client models.
Mock and live transports must implement the same feature-facing interface.
Mock mode must be explicit in development and unavailable in production.
Server snapshot caching should have one owner; telemetry streams should not
cause whole-screen reactive updates.

Browser performance must be measured with representative asset counts, update
rates, pan/zoom behavior, input latency, and memory before claims are made.
Mobile work is deferred and will be native Android and Apple development.
