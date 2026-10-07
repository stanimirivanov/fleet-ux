# Frontend engineering

## TL;DR

Use SolidJS for rendering and fine-grained local reactivity, Effect v4 for
boundary schemas and future complex async work, and the router URL for
shareable state. The root layout supplies stable navigation and the
Light/Dark/System preference. Local development shows a labelled sample fleet
overview by default and offers a schematic map at `/map?preview=sample`,
the contract-shaped catalogue at `/assets?preview=sample`, example asset
inspectors, and read-only registry review at
`/assets/registry/review?preview=sample`. Production routes remain unconfigured
without browser-safe
backend access.

## Selected foundation

| Concern | Choice |
| --- | --- |
| Web runtime | SolidJS 1.x, Vite, strict TypeScript 7 |
| Routing | @solidjs/router root layout and route links |
| Local state | Solid signals, memos, stores |
| Shared granular state | Add Effect v4 Atom and its Solid binding with the first real use |
| Async workflows | Effect v4 services, streams, scopes when required |
| Styling | Tailwind CSS v4 with semantic light/dark CSS tokens |
| Theme choice | One Light → Dark → System button, versioned browser preference |
| HTTP contract | Pinned backend OpenAPI baseline; generated Effect v4 transport schemas |
| Mocking | Deterministic development-only asset reader plus separate sample operational and registry projections |
| Map | Development-only schematic workbench with paired list; MapLibre and tiles wait for a geodetic location contract |
| Testing | Node pure tests, Vitest + Solid Testing Library, Playwright POM browser journeys |

Effect v4 is pinned for generated boundary schemas. No Effect v3
compatibility layer is planned. Introduce the Solid Atom binding, layers, and
runtime services with an actual shared-state or transport workflow rather
than installing an idle provider.

The [visual-language decision](design-docs/0001-operational-visual-language.md)
defines hierarchy and status semantics. The [shell decision](design-docs/0002-persistent-shell-theme.md)
defines persistent navigation and preference behavior. The semantic token
sheet in apps/web/src/design-system/tokens.css is the styling source of
truth. The design:check script verifies selected token contrast pairs.
Component contrast, focus, charts, map overlays, and screen-reader behavior
still require rendered review.

Local development renders the approved overview layout from a deterministic,
development-only sample projection. Each synthetic section carries a visible
"Sample data" label and a quiet border/tint so its source remains evident
without dominating the screen. Sample location, condition, connectivity,
freshness, alerts, and trends live outside the backend-shaped asset identity
model. The overview's static map preview is spatial scaffolding, not observed
positions. The production overview stays unconfigured.

Development navigation also opens `/map?preview=sample`: a schematic site
canvas, filtered asset list, and selected-asset context share URL-backed
selection. Its separate synthetic position evidence carries observation and
receipt times and an availability state; a general telemetry timestamp does
not establish location freshness. Percentage canvas coordinates are not
latitude/longitude. The map has no geodetic SDK, tile service, live location
API, trails, or movement animation. The ordinary `/map` route and every production map route remain unconfigured.
The registry preview projects directed relationships and exact
source-to-property bindings at explicit effective and known times. It remains
read-only: protected metadata routes lack browser-safe identity and are not in
the pinned UI OpenAPI contract.

The ordinary `/assets` route also remains unconfigured. In development,
the sidebar Assets destination opens the labelled sample catalogue so the
sample overview journey stays coherent. Development mode
alone recognizes `/assets?preview=sample` and renders contract-shaped pages
through the feature-facing reader. The preview uses a bounded two-record page
and places the opaque exclusive after cursor in the URL. Next page follows
the reader's returned cursor; First page clears it. Direct links and browser
history work without claiming a total count or reverse pagination. Invalid
cursor syntax offers a first-page recovery before a read is attempted.
Overview search, type, condition, and connectivity filters live in the URL
and apply to the local sample set only;
they do not claim server-side search. The preview query is a local inspection
switch, not a product data source or browser authentication. A production
build must not include fixture payloads or activate sample mode. The asset
boundary keeps unknown wire payloads separate from validated client models.
The official Effect v4 OpenAPI generator derives transport schemas and a
client from the pinned contract; the feature boundary still checks tenant
identity and pagination invariants.

Mock and live transports must implement the same feature-facing interface.
The development fixture reader intentionally uses a `Promise` port with an
`AbortSignal` and normalizes known request, contract, and unavailable failures
for presentation. Effect v4 Schema validates external payloads now. Once
browser-safe identity exists, the live HTTP adapter will map the generated
Effect error channel into feature failures and run under a managed,
interruptible runtime. The generated HTTP client is not a live browser
adapter until that identity flow exists. Server snapshot caching should have one owner; telemetry
streams should not cause whole-screen reactive updates.

The [frontend structure guide](development/frontend-structure.md) defines the
component, reactivity, Effect, and styling review criteria. The
[testing guide](development/testing.md) defines the separate static/component
and browser gates and the guide-producing scenario convention. Production
E2E continues to run against a built Vite preview and checks that sample
routes cannot activate. A separate development-server Playwright suite checks
the default sample overview and explicit asset and map previews, including
narrow layout, local filters, and list/map selection. The production user
guide remains based on verifiable production behavior. Browser performance
must be measured with representative asset counts, update rates, pan/zoom
behavior, input latency, and memory before claims are made. Mobile work is
deferred and will be native Android and Apple development.

The [pinned backend contract](../contracts/http/README.md) is the source for
asset catalogue fields and fixture examples. Its configured bearer credential
is a workload secret, so this application does not use it for browser access.
