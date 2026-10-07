# Execution plans

FleetIQ UX follows the existing numbered milestones. Scaffold, visual-language
foundation, shell, testing, contract, and architectural hardening work belong
to **M02 - Product Foundation**. The first complete visual workspace belongs
to **M04 - Semantic Twin and Live UI**.

- [Active plans](exec-plans/active/README.md)
- [Completed plans](exec-plans/completed/README.md)
- [Technical debt](exec-plans/tech-debt-tracker.md)
- [Visual language decision](design-docs/0001-operational-visual-language.md)
- [Shell and theme decision](design-docs/0002-persistent-shell-theme.md)
- [Asset contract decision](design-docs/0003-pinned-asset-catalogue-contract.md)

Each plan records its status, goal, scope, decisions, acceptance criteria, and
evidence. Move a plan to completed only after required checks pass or material
limitations are explicitly recorded.

The [completed schematic map workbench slice](exec-plans/completed/2026-10-map-workbench.md)
pairs a filtered asset list with an illustrative site canvas and in-place
asset context. Positions remain development-only sample evidence until the
backend publishes browser-safe, geodetic location reads with timestamps and
quality.

The [completed asset inspector slice](exec-plans/completed/2026-10-asset-inspector.md)
extends asset discovery into a topology-and-evidence workspace. Its readings,
history, and provenance are development-only sample projections until the
backend publishes browser-safe detail and signal read models.

The [completed fleet overview and asset discovery slice](exec-plans/completed/2026-10-fleet-overview-asset-discovery.md)
uses clearly labelled synthetic operational data for local design review. The
published backend contract currently provides bounded asset identity pages;
live protected reads wait for browser-safe identity, and location, status,
alerts, and signal views wait for backend-owned read models. Existing
[cursor navigation](exec-plans/completed/2026-10-asset-catalogue-cursor-navigation.md)
keeps sample pages reachable without inventing a fleet total or server-side
search.
