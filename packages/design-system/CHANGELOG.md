# @pindakaasman/design-system

## 2.0.0

### Major Changes

- 2f9bda4: Resolve responsive values in CSS instead of guessing them in JS.
  
  `@pindakaasman/design-system`: **breaking.** `fontSize()`, `spacing()` and `spacingBetween()` used to call `getCurrentBreakpoint()` internally, which measures `window.matchMedia()` when there's a viewport and otherwise falls back to the `ssrBreakpoint` option - a guess that disagrees with the client's real viewport whenever that viewport isn't the one `ssrBreakpoint` assumes, causing a React hydration mismatch in every consumer calling these from a styled-components interpolation. They now return CSS variables (`var(--ds-font-size-l)`, `var(--ds-spacing-base)`) instead of a computed rem string, and `spacingBetween()` returns a `calc(abs(...))` expression over the same variables (requires the CSS `abs()` math function - supported in all major browsers, but only since Safari 18.2, Dec 2024). New: `breakpointCss()`, the global CSS defining those variables per breakpoint via real `@media (min-width: …)` rules, so the browser resolves the current value directly - the same fix shape `colorModeCss()` already applied to color modes. `ssrBreakpoint` and `getCurrentBreakpoint()` are unchanged but no longer affect these three accessors; JS math on their result (`parseFloat()`, `remToPx()`) no longer works.
  
  `architecture` plugin: the `design-system` skill documents the CSS-variable accessors and their `BreakpointStyle` wiring in the `ThemeProvider` (parallel to `ColorModeStyle`), and warns against using `getCurrentBreakpoint()` for rendered output. `architecture:setup` audits for the pre-2.0 accessor contract, missing `BreakpointStyle` wiring, JS math on accessor output, and `getCurrentBreakpoint()` driving server/client-sensitive output.

## 1.0.0

### Major Changes

- 40b5325: Light and dark color modes.
  
  `@pindakaasman/design-system`: **breaking.** Color-bearing tokens (`colorPalette`, `gradient`, `boxShadow`) move from `colors`/the top level into `modes.light`, with an optional `modes.dark`. The `darker` color variant is renamed `emphasis`. `color()`, `gradient()` and `boxShadow()` now return CSS variables instead of literal values. New: `colorModeCss()` (the global CSS defining those variables per mode, following `prefers-color-scheme` unless overridden), `rawColor()` for a literal value in one mode, `hasDarkMode()`, and the standalone `setColorMode()`, `getColorMode()` and `colorModeScript()` (a pre-paint inline script that applies a saved override). The override is a `<meta name="ds-color-mode">` tag in `<head>` rather than an attribute on `<html>`, so it never causes a hydration mismatch and needs no `suppressHydrationWarning`.
  
  `architecture` plugin: the `design-system` skill documents color modes and their wiring (`ColorModeStyle` in the `ThemeProvider`, `colorModeScript()` in the root layout), seeds `modes.dark` from a project's existing dark styles, and the template ships a dark palette. `architecture:setup` audits for the pre-1.0 tokens shape, missing wiring, mode-specific CSS outside the theme, JS color math on accessor output, and `suppressHydrationWarning`.

## 0.4.0

### Minor Changes

- 13a1167: Don't touch `window` when there's no DOM. `getCurrentBreakpoint()` (and so `fontSize()`, `spacing()` and `spacingBetween()`) used to throw `window is not defined` during server rendering; it now falls back to a breakpoint wherever `window.matchMedia` isn't available. That's the largest breakpoint by default; pass `new DesignSystem(tokens, { ssrBreakpoint: 'smallest' })` for mobile-first apps.

## 0.3.0

### Minor Changes

- d8af0cf: Wire this repo's own `configs/*` into its own root (`eslint.config.mjs`,
  `prettier.config.js`, a `pnpm lint`/`format`/`test`/`build` CI job) and fix
  what that turned up:
  
  - `design-system` - `get()` no longer returns `any` (now `unknown`, matching
    its own README); `System`'s `[prop: string]: any` catch-all is removed
    (`get()` still works - `ramda`'s `path()` doesn't need it); the unused,
    never-referenced `SystemOptions`/`SystemOptionalKey` exports are dropped.
  - `eslint-config` - the base export now includes Node globals, derived from
    linting this repo's own tooling scripts (the first real non-Next consumer
    of the base config).
  - `mise-place` - `string[]`/`unknown[]` switched to `Array<T>`, per the
    typescript plugin's own stated convention.
  - `architecture` plugin - fixed a missing `=>` in the `data-flow` skill's
    "good" example (was showing invalid syntax for the exact arrow-function
    convention it was demonstrating).

## 0.2.1

### Patch Changes

- a8e389d: Add `license` (MIT), `author`, `bugs`, and `homepage` fields so the npm registry page for each package is complete.

## 0.2.0

### Minor Changes

- 66f59e3: Breaking: `SystemTokens` now requires every field `DesignSystem` reads (`type`, `type.sizes`, `type.baseFontSize`, `colors.colorPalette`, `colors.gradient`, `spacing.scale`, `zIndex`, `boxShadow`), with sizes and spacing given for all four breakpoints and every `SystemSize`. Tokens missing any of these used to crash at runtime; they're now a type error.
  
  Declares `styled-components` as a peer dependency (needed by `styled-media-query`), and fixes the build so the package actually compiles.
