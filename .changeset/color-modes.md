---
'@pindakaasman/design-system': major
'@pindakaasman/architecture-plugin': minor
---

Light and dark color modes.

`@pindakaasman/design-system`: **breaking.** Color-bearing tokens (`colorPalette`, `gradient`, `boxShadow`) move from `colors`/the top level into `modes.light`, with an optional `modes.dark`. The `darker` color variant is renamed `emphasis`. `color()`, `gradient()` and `boxShadow()` now return CSS variables instead of literal values. New: `colorModeCss()` (the global CSS defining those variables per mode, following `prefers-color-scheme` unless overridden), `rawColor()` for a literal value in one mode, `hasDarkMode()`, and the standalone `setColorMode()`, `getColorMode()` and `colorModeScript()` (a pre-paint inline script that applies a saved override).

`architecture` plugin: the `design-system` skill documents color modes and their wiring (`ColorModeStyle` in the `ThemeProvider`, `colorModeScript()` in the root layout), seeds `modes.dark` from a project's existing dark styles, and the template ships a dark palette. `architecture:setup` audits for the pre-1.0 tokens shape, missing wiring, mode-specific CSS outside the theme, and JS color math on accessor output.
