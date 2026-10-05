# Solid web scaffold

Status: completed

Milestone: M02 - Product Foundation

## Goal

Create a web-only SolidJS foundation in the new repository, with Effect v4
integrated from the start and a repeatable engineering gate.

## Scope

- Add the Vite, Solid router, strict TypeScript, Tailwind, and Effect v4
  application entry point.
- Pin Effect core and its official Solid Atom binding to 4.0.1.
- Add the architecture and contribution harness, CI, Biome, import rules,
  documentation validation, and a lockfile.
- Keep the initial page visually neutral and explicit about its unconfigured
  backend connection.

## Acceptance evidence

- `pnpm install --frozen-lockfile` passed.
- `pnpm check` passed, including formatting, type checking, import boundaries,
  documentation checks, and production build.
- Vite served the application entry page locally with HTTP 200.

## Deferred decisions

The product design language, UI component wrappers, API contract/mock adapter,
map renderer integration, and tile hosting belong to later reviewable slices.
