# Execution plans

FleetIQ UX follows the existing numbered milestone convention. The scaffold,
visual-language foundation, persistent shell, testing harness, pinned
asset-catalogue contract, development sample preview, and cursor
navigation belong to
**M02 - Product Foundation**.

- [Active plans](exec-plans/active/README.md)
- [Completed plans](exec-plans/completed/README.md)
- [Technical debt](exec-plans/tech-debt-tracker.md)
- [Visual language decision](design-docs/0001-operational-visual-language.md)
- [Shell and theme decision](design-docs/0002-persistent-shell-theme.md)
- [Asset contract decision](design-docs/0003-pinned-asset-catalogue-contract.md)

Each plan records its status, goal, scope, acceptance evidence, and decisions.
Move a plan to completed only after its required checks pass or limitations
are explicitly recorded. The completed slice adds an explicitly labelled
[development asset catalogue preview](exec-plans/completed/2026-10-development-asset-catalogue-preview.md)
with loading, empty, and error states. Live protected reads wait for
browser-safe identity. Location and signal read models wait for backend-owned
contract revisions.

The completed [cursor-navigation slice](exec-plans/completed/2026-10-asset-catalogue-cursor-navigation.md)
makes bounded sample pages reachable through URL state while live reads remain
blocked on browser-safe identity.
