# Contributing

## TL;DR

Make one PR-sized change with a clear outcome. Update its docs and run
`pnpm check`. Report checks that could not run.

Start with [AGENTS.md](AGENTS.md), then use the [documentation map](docs/README.md).
Create a plan in `docs/exec-plans/active` for multi-step changes; move it to
`completed` when verified. Record durable design decisions in
`docs/design-docs`.

Use strict TypeScript and explicit boundaries. Keep Solid components small
around one interaction, place pure rules in a feature model, and keep Effect
programs behind named service or adapter interfaces. Prefer established
libraries when a real requirement appears. Avoid global state for local UI
interactions and avoid app-wide abstractions for one feature.

The required gate is `pnpm check`, which runs formatting/lint, type checking,
import architecture, documentation checks, and a production build. Add focused
behavioral tests when implementing behavior; do not add tests that merely
repeat static markup or configuration.

For handoff, include the repository name, milestone, GitHub issue title and
copy-ready issue body with Goal, Scope, Design decisions, Acceptance criteria,
and Out of scope. State exactly which checks passed, failed, or were not run.
