# Testing and executable user guides

## TL;DR

`pnpm check` verifies types, architecture, view size, styling, documentation,
pure rules, Solid component behavior, and a production build. `pnpm e2e`
runs production-preview and development-server Playwright suites. Both gates
are required in CI. Selected production journeys can generate a user guide;
ordinary e2e scenarios do not.

## Test ownership

- Pure TypeScript rules use Node's test runner under `apps/web/tests`.
- Rendered Solid interactions use Vitest, jsdom, and Solid Testing Library in
  `*.test.tsx`. Exercise accessible names, actions, and reactive updates
  rather than duplicating static markup assertions.
- Browser journeys use `apps/web-e2e/e2e` for production behavior and
  `apps/web-e2e/e2e-dev` for development-only sample overview, catalogue,
  map, inspector signal playback, registry, and alert triage.
  Page objects in `apps/web-e2e/pages` own semantic locators and cohesive
  actions. Scenarios own policy assertions, route expectations, and narrative
  sequence. Prefer roles, labels, and retrying assertions over implementation
  selectors and arbitrary waits.

Run `pnpm view:check`, `pnpm test:unit`, `pnpm test:component`, or `pnpm e2e`
from the repository root. `pnpm e2e` runs `e2e:production` then
`e2e:development`: the first builds and serves the production Vite preview
on 127.0.0.1:4173, while the second serves the development app on
127.0.0.1:5173. Production scenarios prove that the overview and
`/assets?preview=sample` stay unconfigured; development scenarios exercise
the disclosed overview, URL-backed discovery, map/inspector selection, registry
cutoffs and attribution, alert filters/selection/evidence and URL recovery,
narrow layout, catalogue cursor traversal, browser history,
invalid-cursor recovery, signal-stream lifecycle, and production
sample isolation.
Each Playwright config refuses to reuse an existing server, so a busy port
does not silently test an unrelated process. Set `FLEETIQ_E2E_PREVIEW_PORT`
and/or `FLEETIQ_E2E_DEV_PORT` to free ports when needed. CI uses 4173 and
5173. Install Chromium once with `pnpm exec playwright install chromium`.
`pnpm check` does not run a browser; the separate CI browser job runs both
suites and retains failure traces and screenshots. Run both commands before
handing off a browser change.

## Guide-producing scenarios

A guide is a coherent operator journey, not a screenshot for each control.
Tag a scenario `@user-guide` only when it has enough verified steps to teach
a real task. The same scenario runs assertion-first in ordinary E2E mode.
An optional narrator on page objects adds step prose, annotations,
screenshots, and a Playwright video only in guide mode. An untagged scenario
is only an E2E test. Guide prose is maintained with the scenario and page
object actions.

Run `pnpm guide:generate` to build the app, execute only tagged scenarios,
and assemble `dist/user-guide` as Markdown and a static HTML book. Run
`pnpm guide:preview` to inspect it locally. The generator rejects missing
or failed guide scenarios and discards partial output. Generated media is
ignored by Git; source scenarios and their prose are reviewed with code.
The User guide workflow runs after the Web quality gate succeeds for a push
to main, or through a main-branch manual run. It publishes the generated
book to GitHub Pages. Repository administrators must select GitHub Actions
as the Pages source before first deployment.

The initial guide teaches the available shell: navigation, honest unconfigured
production data states, status vocabulary, and appearance. Guide generation
runs the production suite only; the development sample overview and catalogue
are not production operator journeys. The guide must not imply that fleet
assets, telemetry, or backend workflows are already connected. As contracts
and features arrive, add deterministic fixtures and guide only browser-proven
outcomes. Do not record secrets or one-time links.
