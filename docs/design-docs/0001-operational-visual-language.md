# 0001 - Operational visual language

## TL;DR

FleetIQ uses a calm, light-first industrial console with an equivalent dark
theme. Semantic tokens and explicit state labels carry the design. A condition,
a gateway connection, and the age of telemetry remain independent. Screens
progress from fleet overview to asset and signal evidence; the map is one
workspace within that hierarchy.

Status: accepted on 5 October 2026.

## Context

FleetIQ is intended for mixed heavy assets and their monitored subsystems.
Locomotives are a useful example, not the only asset type. A tracker, asset,
component, endpoint, and attributed signal have separate identities. The UI
must make those relationships understandable without implying that a last
reading is current or that a disconnected gateway means the machine failed.

The approved concept images in private offline design material establish the
direction, not exact data, controls, or pixels. This record is the tracked
decision for implementation. The web application has no live backend
connection; local development uses disclosed sample data for layout review.

## Decision

The visual character is precise, quiet, and trustworthy. Use a pale neutral
canvas, restrained surfaces and borders, generous spacing, clear typography,
and a small semantic palette. Strong color draws attention to a meaningful
state; it does not decorate every metric. Use a familiar system sans-serif and
tabular numerals for measured values. Readings pair a value with a unit, time,
quality, and source as soon as the contract supplies them.

Light is the initial application theme. A dark theme uses the same hierarchy,
content, and interactions with adjusted contrast. The application shell provides
one accessible icon button that cycles Light, Dark, and System. The design
specimen still exposes both palettes for review.

The shell has a stable top bar, left navigation, and content origin.
Moving from an asset list to an asset detail must preserve that frame. A map
pairs with an equivalent list. An alert links to evidence and a deliberate
action. Any task-adaptive layout must be predictable and user-controlled.

## State vocabulary

- **Asset condition** is a statement about the monitored physical asset. It is
  nominal, attention, critical, or unknown only when the underlying rule and
  evidence support that label.
- **Device connectivity** describes a gateway or tracker connection. It is
  independent of asset condition.
- **Telemetry freshness** describes how old a particular observation is under
  a signal-specific policy. An unavailable or stale observation cannot be
  rendered as a current healthy value.
- **Alert severity** describes a defined alert, not an asset's entire health.
  Acknowledgment means that an authorized person has seen it; resolution has
  a separate meaning.
- **Unknown, unsupported, ambiguous, and unattributed** data remain visible
  states. Missing numbers never become zero.

Every status has a visible text label; color is supplemental. Normal operating
bands and thresholds must come from validated metadata or calculations, not
from screen defaults. Historic observations preserve event time separately
from receipt time so late arrivals cannot look live. Source and attribution
must be inspectable where a reading could drive an operational decision.

## Implementation contract

The [semantic token sheet](../../apps/web/src/design-system/tokens.css) is the
source for surface, text, interaction, focus, and status colors. Feature code
uses semantic roles rather than raw hexadecimal colors. The shared status
badge accepts a tone and a required label; it does not decide domain status.
The token contrast checker runs in the normal quality gate. It verifies
selected WCAG AA text pairs and non-text focus/control pairs, but rendered
components, charts, and maps still need visual and assistive-technology review.

Use a 4 px spacing base and low-elevation panels. Prefer trends with a shared
time window and normal band to decorative gauges. Avoid flashing or continuous
motion; honor reduced-motion preferences when motion is later introduced.
Empty, loading, stale, disconnected, forbidden, and error states belong in
each product feature, not in a generic success-looking placeholder. In local
design previews, every synthetic panel displays a small "Sample data" label
and a quiet border/tint. That source cue is textual as well as visual and
belongs to the panel wrapper, so a real read model can replace the sample
without changing its presentation hierarchy. Production cannot display
synthetic operational values as if they were connected observations.

## Alternatives and consequences

A dark, map-dominant command-center style and decorative 3D machinery were
considered. The light-first evidence hierarchy better supports long operator
sessions, mixed workspaces, and explicit data quality. Dark remains a full
theme, not a different product. The visual rules require discipline: future
screens cannot use bright color as an arbitrary category marker, invent a
freshness state, or hide missing data for aesthetic simplicity.

This direction is informed by the [ISA-hosted high-performance HMI paper](https://www.isa.org/getmedia/06130a38-f7af-4b35-8c9c-2c34f25c1977/The-High-Performance-HMI-Overview-v2-01.pdf)
and [WCAG 2.2 guidance on color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html),
[text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html),
and [non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).
FleetIQ does not claim formal HMI or accessibility conformance from this
decision alone.
