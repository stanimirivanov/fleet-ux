# Testing and executable user guides

## TL;DR

`pnpm check` verifies types, architecture, the page/root-view size policy,
styling, documentation, the pure rules, Solid component behavior, and a
production build. `pnpm e2e` separately
runs production-preview and development-server Playwright suites. Both gates
are required in CI. Selected production journeys can generate a user guide;
ordinary e2e scenarios do not.

## Test ownership

- Pure TypeScript rules use Node's test runner under `apps/web/tests`. They do
  not need a DOM or a browser.
- Rendered Solid interactions use Vitest, jsdom, and Solid Testing Library in
  `*.test.tsx` files. Exercise user-visible behavior such as accessible names,
  actions, and reactive updates; do not duplicate static markup assertions.
- Browser journeys use Playwright in `apps/web-e2e/e2e` for production
  behavior and `apps/web-e2e/e2e-dev` for the explicit development-only asset
  preview. Page objects in `apps/web-e2e/pages` own semantic locators and
  cohesive actions. Scenarios own policy assertions, route expectations, and
  the narrative sequence. Prefer roles, labels, and retrying assertions over
  implementation selectors and arbitrary waits.

Run `pnpm view:check`, `pnpm test:unit`, `pnpm test:component`, or `pnpm e2e` from the repository
root. `pnpm e2e` runs `e2e:production` then `e2e:development`: the first builds
and serves the production Vite preview on 127.0.0.1:4173, while the second
serves the Vite development app on 127.0.0.1:5173. Production scenarios prove
that `/assets?preview=sample` stays unconfigured; development scenarios
exercise the opt-in fixture catalogue, direct cursor links, forward traversal,
browser history, and invalid-cursor recovery. Each Playwright config refuses to
reuse an existing server, so a busy port is an error rather than permission
to test an unrelated process. For local port collisions, set
`FLEETIQ_E2E_PREVIEW_PORT` and/or `FLEETIQ_E2E_DEV_PORT` to free ports
before running `pnpm e2e`; CI keeps defaults 4173 and 5173. Install Chromium once with
`pnpm exec playwright install chromium`. `pnpm check` does not install or run
a browser; the separate `browser` CI job runs both suites through `pnpm e2e`
and retains failure traces/screenshots. Run both commands before handing off
a browser change.

## Guide-producing scenarios

A guide is a coherent operator journey, not a screenshot for each control.
Tag a scenario `@user-guide` only when it has enough verified steps to teach
a real task. The same scenario runs assertion-first in ordinary e2e mode.
An optional narrator on page objects adds step prose, annotations, screenshots,
and a Playwright video only in guide mode. An untagged scenario is just an e2e
test. Guide prose is maintained with the scenario and page-object actions.

Run `pnpm guide:generate` to build the app, execute only tagged scenarios, and
assemble `dist/user-guide` as Markdown and a static HTML book. Run
`pnpm guide:preview` to inspect it locally. The generator rejects missing or
failed guide scenarios and discards partial output. Generated media is ignored
by Git; source scenarios and their prose are reviewed with code. The separate
User guide workflow runs only after the Web quality gate succeeds for a push
to main, or through a main-branch manual run. It publishes the generated book
to GitHub Pages. Repository administrators must select GitHub Actions as the
Pages source before the first deployment.

The initial guide teaches the available shell: navigation, honest unconfigured
data states, status vocabulary, and appearance. Guide generation runs the
production suite only; the development sample catalogue is not a production
operator journey. The guide must not imply that fleet assets, telemetry, or
backend workflows are already connected. As contracts and features arrive,
add deterministic fixtures and guide only outcomes that can be proved in the
browser. Do not record secrets or one-time links.
