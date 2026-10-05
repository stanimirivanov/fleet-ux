# Persistent application shell and theme preference

Status: completed on 5 October 2026

Milestone: M02 - Product Foundation

## Goal

Keep FleetIQ's frame stable across routes and let an operator choose Light,
Dark, or System with one accessible icon button.

## Scope

- Use a Solid Router root layout for the top bar, desktop side navigation,
  narrow-screen navigation, skip link, and a stable content origin.
- Route only to honest content: an unconfigured overview, an unconfigured
  asset workspace, and the existing synthetic design specimen.
- Cycle Light to Dark to System and back with one button, persist the choice,
  and follow OS changes while System is selected.
- Keep the light/dark design specimen correct under every root theme.
- Update documentation and add focused tests for theme preference rules.

## Design decisions

The router URL owns navigation. The shell uses local Solid state and browser
storage, not a global Effect Atom. Future product routes are added only when
their workspace has real content or an honest readiness state. No tenant is
invented while backend contracts are unavailable.

## Acceptance evidence

- `pnpm check` passes Biome, strict TypeScript, dependency boundaries, docs,
  contrast tokens, three theme tests, and production build.
- Headless Edge verifies direct routes, Back, shell persistence, route focus
  and titles, the Light/Dark/System cycle, storage, OS media changes, and
  the independent light specimen inside dark mode.
- Desktop light/dark and narrow-screen screenshots were visually reviewed.

## Out of scope

Asset read models, mock or live transport, maps, alerts, search, notifications,
user profiles, language preferences, and mobile applications.
