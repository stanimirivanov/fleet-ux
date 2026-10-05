# FleetIQ UX

FleetIQ's SolidJS operator web application. The current slice turns the
approved visual direction into a reviewable light/dark design foundation.
Product screens, API contracts, and live data follow as separate PR-sized
changes.

## Start

Use Node.js 24 or newer and pnpm 12.5.1.

```powershell
pnpm install --frozen-lockfile
pnpm dev
```

Open the URL printed by Vite. The root route is a design specimen with
synthetic status examples. It makes no backend requests and reports the
connection as unconfigured. Run pnpm check before proposing a change.

## Documentation

Start with [AGENTS.md](AGENTS.md) for the working agreement and
[docs/README.md](docs/README.md) for the documentation map. The
[architecture](ARCHITECTURE.md) explains the boundaries, the
[visual language decision](docs/design-docs/0001-operational-visual-language.md)
records the design rules, and [docs/PLANS.md](docs/PLANS.md) tracks sequencing.
