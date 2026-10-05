# 0002 - Persistent shell and theme preference

## TL;DR

Use Solid Router's root layout for one stable top bar, navigation region, and
content origin. The only linked routes have honest content states. One icon
button cycles Light, Dark, and System; the choice persists when storage works,
defaults to Light, and follows OS changes in System mode.

Status: accepted on 5 October 2026.

## Context

The first design slice established semantic light and dark tokens and a
synthetic specimen. FleetIQ now needs a consistent frame that future asset,
map, and alert workspaces can enter without moving navigation or the content
origin. The backend read model is not connected, so the frame must not imply
that it knows a tenant, fleet count, alert count, or current location.

## Decision

The router root layout owns the top bar, a desktop left navigation, a
narrow-screen horizontal navigation, a skip link, and the main landmark.
Route content changes inside this frame. The current routes are an
unconfigured fleet overview, an unconfigured asset workspace, the synthetic
design-system specimen, and a not-found page. Navigation lists only these
working destinations. New product areas are added as their contracts and
content states arrive.

The application stores a preference value of light, dark, or system under a
versioned key. A missing or invalid value starts in Light. System resolves
through prefers-color-scheme and updates when that media query changes. A
single icon button cycles Light → Dark → System → Light; its accessible name
states the current preference and next action. Browser storage failures leave
the button usable for the current session.

A short script in the document head applies the saved resolved theme before
the Solid application loads, reducing a light flash on dark-theme reloads.
The app-level theme hook owns the ongoing signal and media-query lifecycle.
This small interface state does not require an Effect Atom. The design
specimen declares its light card explicitly so it remains light while the
surrounding application is dark.

The main region retains its geometry across routes. Navigation moves keyboard
focus to the newly titled main landmark, while the skip link provides a direct
keyboard path. Route filters and future asset selection will live in the URL.

## Consequences and alternatives

A separate shell per route would remount the frame and risk the layout jumps
previously observed. A disabled full navigation menu would suggest product
features that do not exist. The narrow-screen navigation is a horizontal row
for the three current destinations; a drawer can be considered when the
working navigation actually grows.

The inline early-theme script repeats the storage key used by the typed theme
module. Keep them synchronized when changing its version; a later server
rendering path may provide a different early-theme mechanism. The design
specimen and unconfigured pages are temporary product-foundation states,
clearly labeled until backend-backed features replace them.

The layout follows [Solid Router's root-layout guidance](https://docs.solidjs.com/solid-router/concepts/layouts)
and its [active-link behavior](https://docs.solidjs.com/solid-router/reference/components/a).
