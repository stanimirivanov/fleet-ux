# Frontend engineering

## TL;DR

Use SolidJS for rendering and fine-grained local reactivity, Effect v4 for
complex async work and Atom-backed granular shared state, and the router URL
for shareable state. The root layout supplies stable navigation and the
Light/Dark/System preference. The asset catalogue can be inspected with
`/assets?preview=sample` on the development server; normal and production
routes remain unconfigured without browser-safe backend access.

## Selected foundation

| Concern | Choice |
| --- | --- |
| Web runtime | SolidJS 1.x, Vite, strict TypeScript 7 |
| Routing | @solidjs/router root layout and route links |
| Local state | Solid signals, memos, stores |
| Shared granular state | Effect v4 Atom with @effect/atom-solid |
| Async workflows | Effect v4 services, streams, scopes when required |
| Styling | Tailwind CSS v4 with semantic light/dark CSS tokens |
| Theme choice | One Light → Dark → System button, versioned browser preference |
| HTTP contract | Pinned backend OpenAPI baseline; generated Effect v4 transport schemas |
| Mocking | Deterministic fixture reader behind an explicit development-only preview |
| Map | MapLibre adapter and tile delivery in later slices |
| Testing | Node pure tests, Vitest + Solid Testing Library, Playwright POM browser journeys |

Effect core and its Solid binding are pinned to the same 4.0.1 release. No
Effect v3 compatibility layer is planned. The Atom provider is installed at
the application root. Introduce layers and runtime services with the first
actual transport workflow rather than a demonstration-only service.

The [visual-language decision](design-docs/0001-operational-visual-language.md)
defines hierarchy and status semantics. The [shell decision](design-docs/0002-persistent-shell-theme.md)
defines persistent navigation and preference behavior. The semantic token
sheet in apps/web/src/design-system/tokens.css is the styling source of
truth. The design:check script verifies selected token contrast pairs.
Component contrast, focus, charts, map overlays, and screen-reader behavior
still require rendered review.

The default route shows the honest unconfigured state. Development mode alone
recognizes `/assets?preview=sample`, clearly labels its fixture data, and
renders loading, populated, empty, and error results through the
feature-facing reader. The preview query is a local inspection switch, not a
product data source or a browser authentication mechanism. A production
build must not include fixture payloads or activate preview mode. Neither
route may present sample records as live assets, locations, health, or
telemetry. The asset boundary keeps unknown wire payloads separate from
validated client models. The official Effect v4 OpenAPI generator derives
transport schemas and a client from the pinned contract; the feature boundary
still checks tenant identity and pagination invariants.

Mock and live transports must implement the same feature-facing interface.
The generated HTTP client is not a live browser adapter until a browser-safe
identity flow exists. Server snapshot caching should have one owner; telemetry
streams should not cause whole-screen reactive updates.

The [testing guide](development/testing.md) defines the separate static/component
and browser gates and the guide-producing scenario convention. Production
E2E continues to run against a built Vite preview and checks that the sample
query cannot activate. A separate development-server Playwright suite checks
the explicit sample route and its user-visible states. The production user
guide remains based on verifiable production behavior. Browser performance
must be measured with representative asset counts, update rates, pan/zoom
behavior, input latency, and memory before claims are made. Mobile work is
deferred and will be native Android and Apple development.

The [pinned backend contract](../contracts/http/README.md) is the source for
asset catalogue fields and fixture examples. Its configured bearer credential
is a workload secret, so this application does not use it for browser access.
