# Settings & Help Overlay

## Overview

Add persistent floating action icons (settings cog + help) to the bottom-right corner of the game screen. The settings cog opens a popover with a light/dark theme toggle. The help icon opens a modal with game rules.

## Scope

- Only rendered on the game route (`/`) inside `App.vue`
- Legal pages (`/terms`, `/privacy`) are unaffected

## New Component: `FloatingActions.vue`

- Position: `fixed`, bottom-right corner
- Two small circular icon buttons stacked vertically with a small gap
- Icons: settings cog and help question mark (Unicode or inline SVG)
- Glass effect: `--glass-bg-solid` background + `--glass-backdrop`
- Opacity: 40% at rest, full opacity on hover
- Uses design tokens from `tokens.css` throughout

## Settings Popover

- Small glass-styled popover anchored above the cog icon
- Contains a single "Dark / Light" toggle
- Toggle persists to `localStorage` key `yaag-theme`
- Sets `data-theme="light"` attribute on `<html>` element (dark = no attribute / `data-theme="dark"`)
- Clicking outside the popover or clicking the cog again closes it

## Help Modal

- Centered glass-styled modal with subtle backdrop dim
- Title: "How to Play" (Orbitron font)
- Body text:
  > Each round, players get a random acronym. Type a phrase where each word starts with the matching letter. After submissions close, vote for your favorite. Votes = points. Acronyms get longer as rounds progress.
- Close via X button in top-right corner or clicking the backdrop

## Light Mode Implementation

- Add a `[data-theme="light"]` selector block in `tokens.css` that overrides:
  - `--bg-primary` (black -> white)
  - `--text-primary`, `--text-secondary`, `--text-muted`, `--text-subtle`, `--text-faint`, `--text-ghost` (white variants -> dark variants)
  - `--glass-bg-*` tokens (white overlays -> dark overlays)
  - `--bg-surface` (dark -> light surface)
- Default theme: dark
- On app mount, read `localStorage('yaag-theme')` and apply `data-theme` attribute if set

## Out of Scope

- No settings beyond theme toggle
- No animation on icon appearance
- No keyboard shortcuts for opening panels
- No changes to legal pages
