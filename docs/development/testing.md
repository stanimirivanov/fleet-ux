# Testing and executable user guides

## TL;DR

`pnpm check` verifies types, architecture, styling, documentation, the pure
rules, Solid component behavior, and a production build. `pnpm e2e` separately
runs Playwright against that build. Both are required CI jobs. Selected long
browser scenarios also generate a user guide; ordinary e2e scenarios do not.

## Test ownership

- Pure TypeScript rules use Node's test runner under `apps/web/tests`. They do
  not need a DOM or a browser.
- Rendered Solid interactions use Vitest, jsdom, and Solid Testing Library in
  `*.test.tsx` files. Exercise user-visible behavior such as accessible names,
  actions, and reactive updates; do not duplicate static markup assertions.
- Browser journeys use Playwright in `apps/web-e2e/e2e`. Page objects in
  `apps/web-e2e/pages` own semantic locators and cohesive actions. Scenarios
  own policy assertions, route expectations, and the narrative sequence.
  Prefer roles, labels, and retrying assertions over implementation selectors
  and arbitrary waits.

Run `pnpm test:unit`, `pnpm test:component`, or `pnpm e2e` from the repository
root. `pnpm e2e` builds the web app, starts its production Vite preview on
127.0.0.1:4173, and runs Chromium. Install its browser once with
`pnpm exec playwright install chromium`. A busy preview port is an error, not
permission to test an unrelated server. `pnpm check` does not install or run
a browser; the separate `browser` CI job runs `pnpm e2e` and retains failure
traces/screenshots. Run both commands before handing off a browser change.

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
data states, status vocabulary, and appearance. It must not imply that fleet
assets, telemetry, or backend workflows are already connected. As contracts
and features arrive, add deterministic fixtures and guide only outcomes that
can be proved in the browser. Do not record secrets or one-time links.