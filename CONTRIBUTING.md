# Contributing

## TL;DR

Make one PR-sized change with a clear outcome. Update its docs and run
`pnpm check` and, for browser changes, `pnpm e2e`. Report checks that
could not run.

Start with [AGENTS.md](AGENTS.md), then use the [documentation map](docs/README.md).
Create a plan in `docs/exec-plans/active` for multi-step changes; move it to
`completed` when verified. Record durable design decisions in
`docs/design-docs`.

Use strict TypeScript and explicit boundaries. Keep Solid components small
around one interaction, place pure rules in a feature model, and keep Effect
programs behind named service or adapter interfaces. Prefer established
libraries when a real requirement appears. Avoid global state for local UI
interactions and avoid app-wide abstractions for one feature.

`pnpm check` runs formatting/lint, type checking, import architecture,
documentation checks, pure and Solid component tests, and a production build.
For browser behavior, also run `pnpm e2e`; CI requires both jobs. Add focused
behavioral tests when implementing behavior, without repeating static markup
or configuration. Keep page-object locators/actions separate from scenario
assertions, and tag only coherent, verified journeys for guide generation.
See [testing](docs/development/testing.md) for ownership and commands.

For handoff, include the repository name, milestone, GitHub issue title and
copy-ready issue body with Goal, Scope, Design decisions, Acceptance criteria,
and Out of scope. State exactly which checks passed, failed, or were not run.
