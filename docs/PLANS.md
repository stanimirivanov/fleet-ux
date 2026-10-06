# Execution plans

FleetIQ UX follows the existing numbered milestone convention. The scaffold,
visual-language foundation, persistent shell, testing harness, and pinned
asset-catalogue contract belong to **M02 - Product Foundation**.

- [Active plans](exec-plans/active/README.md)
- [Completed plans](exec-plans/completed/README.md)
- [Technical debt](exec-plans/tech-debt-tracker.md)
- [Visual language decision](design-docs/0001-operational-visual-language.md)
- [Shell and theme decision](design-docs/0002-persistent-shell-theme.md)
- [Asset contract decision](design-docs/0003-pinned-asset-catalogue-contract.md)

Each plan records its status, goal, scope, acceptance evidence, and decisions.
Move a plan to completed only after its required checks pass or limitations
are explicitly recorded. The next PR-sized slice should render an explicitly
labeled development asset catalogue through the fixture reader, with loading,
empty, and error states. Live protected reads wait for browser-safe identity.
Location and signal read models wait for backend-owned contract revisions.
