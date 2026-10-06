# Backend HTTP contract snapshot

## TL;DR

This directory pins the backend-owned OpenAPI UI baseline from
`fleetiq-platform` commit `4ba2528c5de068e1f1305e97b5130b8f35d1af53`.
Its exact source path and SHA-256 are in [source.json](source.json). Run
`pnpm contract:check` after updating it. This is a partial `/api/v1` contract,
not a complete description of the backend.

The current protected route uses a server-side workload bearer credential. It
is not a browser authentication flow. Do not copy that secret into the web app,
fixtures, logs, or test media.

## Updating the snapshot

1. Review and select a specific merged `fleetiq-platform` commit.
2. Copy its `contracts/http/fleetiq-v1-ui-baseline.openapi.json` here without
   editing the response shapes, examples, or security declarations. The pinned
   JSON is exempt from Biome formatting so its bytes match the source.
3. Update `source.json` with that commit and this file's SHA-256.
4. Run `pnpm contract:generate` to regenerate the Effect v4 transport schema
   and HTTP client in `apps/web/src/generated/fleetiq-api.ts`.
5. Reconcile `tools/check-asset-contract.mjs`, the asset feature boundary,
   and fixtures with any changed version or response shape. Generated schemas
   validate wire fields; request-specific tenant, page-size, and cursor checks
   remain in maintained feature code.
6. Run `pnpm contract:check`, `pnpm check`, and browser checks for affected UI.
   The contract check also rejects generated-output drift.

The baseline currently supports version discovery and a bounded, tenant-scoped
asset catalogue. It does not describe location or signal snapshots. Unknown
additive response fields should remain compatible, but required fields and
cross-tenant responses must fail validation before reaching the UI. The
generated HTTP client is not connected to the browser while the backend
requires a workload bearer secret.
