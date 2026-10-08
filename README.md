# FleetIQ UX

## TL;DR

This SolidJS operator console has a stable shell, Light/Dark/System theme, and
development-only sample workspaces for fleet overview, assets, asset inspection,
a schematic map, and read-only registry mapping. The inspector includes a
finite, synthetic signal playback for trying stream and freshness behavior.
Production routes disclose that fleet data is not connected. The map has no
geodetic location API, map SDK, or tile service yet.

## Start

Use Node.js 24 or newer and pnpm 12.5.1.

```powershell
pnpm install --frozen-lockfile
pnpm dev
```

Open the URL printed by Vite. Development navigation opens labelled sample
workspaces; direct URLs also allow inspection:

- `/` — sample fleet overview in development; unconfigured in production
- `/map?preview=sample` — illustrative site layout and paired asset list
- `/assets?preview=sample` — contract-shaped sample asset catalogue
- `/assets/:assetId?preview=sample` — sample topology and evidence for
  supported example assets, with optional signal playback in the Overview tab
- `/assets/registry/review?preview=sample` — read-only relationship and
  signal-mapping review at effective and known times
- `/design-system` — synthetic light/dark design specimen

The ordinary `/map`, `/assets`, registry, and asset-detail routes remain
unconfigured without browser-safe backend access. A production build does not activate
sample previews even when the query parameter is present. The schematic map
uses local percentage coordinates, not real geography or live tracking. The
inspector playback is a deterministic development example; it is not a fleet
signal subscription.

The theme icon in the top bar cycles Light → Dark → System and saves the
preference when browser storage is available. The
[backend asset-catalogue contract](contracts/http/README.md) is pinned and
validated at the UI boundary; additional location and telemetry read models
are still needed for connected operator views.

## Verify

Run `pnpm check` for static and Solid component checks. Install Chromium once
with `pnpm exec playwright install chromium`, then run `pnpm e2e` for both
production and development browser suites. `pnpm guide:generate` records the
tagged operator journey and creates an ignored static guide under
`dist/user-guide`. See the [testing guide](docs/development/testing.md) for
the separate CI gates and guide publication behavior.

## Documentation

Start with [AGENTS.md](AGENTS.md) for the working agreement and
[docs/README.md](docs/README.md) for the documentation map. The
[architecture](ARCHITECTURE.md) explains the boundaries, the
[visual-language decision](docs/design-docs/0001-operational-visual-language.md)
and [shell decision](docs/design-docs/0002-persistent-shell-theme.md) record
the design rules, and [docs/PLANS.md](docs/PLANS.md) tracks sequencing.
