# FleetIQ UX

FleetIQ's SolidJS operator web application. The first slice establishes the web
runtime and engineering checks; product screens and visual design follow in
separate reviewable changes.

## Start

Use Node.js 24 or newer and pnpm 12.5.1.

```powershell
pnpm install --frozen-lockfile
pnpm dev
```

Open the URL printed by Vite. Run `pnpm check` before proposing a change.

The application currently makes no backend requests. It reports this state
explicitly; there is no implicit mock or production API fallback.

## Documentation

Start with [AGENTS.md](AGENTS.md) for the working agreement and
[docs/README.md](docs/README.md) for the documentation map. The
[architecture](ARCHITECTURE.md) explains the boundaries, and
[docs/PLANS.md](docs/PLANS.md) tracks the next slices.
