# FleetIQ UX

FleetIQ's SolidJS operator web application. The persistent shell now provides
stable navigation and a Light/Dark/System theme control. Fleet data is not
connected yet; the overview and asset routes state that explicitly.

## Start

Use Node.js 24 or newer and pnpm 12.5.1.

```powershell
pnpm install --frozen-lockfile
pnpm dev
```

Open the URL printed by Vite. The available routes are:

- / — unconfigured fleet overview
- /assets — unconfigured asset workspace
- /design-system — synthetic light/dark design specimen

The theme icon in the top bar cycles Light → Dark → System and saves the
preference when browser storage is available. No tenant or fleet data is
fabricated. Run pnpm check before proposing a change.

## Documentation

Start with [AGENTS.md](AGENTS.md) for the working agreement and
[docs/README.md](docs/README.md) for the documentation map. The
[architecture](ARCHITECTURE.md) explains the boundaries, the
[visual-language decision](docs/design-docs/0001-operational-visual-language.md)
and [shell decision](docs/design-docs/0002-persistent-shell-theme.md) record
the design rules, and [docs/PLANS.md](docs/PLANS.md) tracks sequencing.
