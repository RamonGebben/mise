# @pindakaasman/architecture-plugin

## 0.13.0

### Minor Changes

- 92b2068: One modular scale, scaled by the root font size.
  
  `@pindakaasman/design-system`: **breaking.** Font sizes and spacing are no longer px tables per breakpoint. Every step is `ratio^step` rem off one `type.ratio` (set by the token author), spacing follows the same ratio as type, and only the root font size changes per breakpoint (`type.base`, as a percentage of the user's setting). `type.floor` keeps font sizes legible. `type.sizes`, `type.baseFontSize` and `spacing` are removed. `SystemSize` splits into `SystemFontSize` (`s`…`xl`) and `SystemSpacing` (`xxs`…`xl`). Breakpoints are now the width each one starts at, and the smallest is `'0px'`. `rootCss()` replaces `breakpointCss()`. `spacingBetween()` no longer needs CSS `abs()`. `remToPx()`/`remToPxRaw()` take an optional breakpoint. `focus` joins `BaseColor`. `mq` is built in instead of coming from `styled-media-query`: `lessThan(bp)` is now `(width < bp)`, `greaterThan(bp)` `(width >= bp)` and `between(a, b)` `(a <= width < b)`, so `lessThan` no longer overlaps the width its breakpoint starts at. The `styled-components` peer is now `>=6`. New: `minTarget()` (24px, or 44px with a touch input), and `auditTokens()`/`contrastRatio()` for WCAG AA contrast and scale checks in CI.
  
  `architecture` plugin: the `design-system` skill documents the one-scale model, its trade-off and the accessibility the tokens bake in, and the template uses a 1.333 ratio and WCAG-passing colors. `architecture:setup` migrates a project below `^4` by deriving the ratio and bases from its existing sizes, showing what moves.

## 0.12.0

### Minor Changes

- a4dbcef: Add typed `fontFamily()`/`ff()`, `borderRadius()`, `borderWidth()` and `zIndex()` accessors (`z()` stays as its alias), so font families, borders and z-indexes no longer need `getTokens()`.
  
  Breaking: `type.fontFamily` is now keyed by `SystemFontFamily` (`base`, `heading`, `mono`) instead of any string, and `border` is required. Projects must rename their font-family keys and define `border` if they hadn't. `architecture:setup` audits and migrates both, and flags `getTokens()`/`get()` reads that a typed accessor now covers.

## 0.11.0

### Minor Changes

- 2f9bda4: Resolve responsive values in CSS instead of guessing them in JS.
  
  `@pindakaasman/design-system`: **breaking.** `fontSize()`, `spacing()` and `spacingBetween()` used to call `getCurrentBreakpoint()` internally, which measures `window.matchMedia()` when there's a viewport and otherwise falls back to the `ssrBreakpoint` option - a guess that disagrees with the client's real viewport whenever that viewport isn't the one `ssrBreakpoint` assumes, causing a React hydration mismatch in every consumer calling these from a styled-components interpolation. They now return CSS variables (`var(--ds-font-size-l)`, `var(--ds-spacing-base)`) instead of a computed rem string, and `spacingBetween()` returns a `calc(abs(...))` expression over the same variables (requires the CSS `abs()` math function - supported in all major browsers, but only since Safari 18.2, Dec 2024). New: `breakpointCss()`, the global CSS defining those variables per breakpoint via real `@media (min-width: …)` rules, so the browser resolves the current value directly - the same fix shape `colorModeCss()` already applied to color modes. `ssrBreakpoint` and `getCurrentBreakpoint()` are unchanged but no longer affect these three accessors; JS math on their result (`parseFloat()`, `remToPx()`) no longer works.
  
  `architecture` plugin: the `design-system` skill documents the CSS-variable accessors and their `BreakpointStyle` wiring in the `ThemeProvider` (parallel to `ColorModeStyle`), and warns against using `getCurrentBreakpoint()` for rendered output. `architecture:setup` audits for the pre-2.0 accessor contract, missing `BreakpointStyle` wiring, JS math on accessor output, and `getCurrentBreakpoint()` driving server/client-sensitive output.

## 0.10.0

### Minor Changes

- 40b5325: Light and dark color modes.
  
  `@pindakaasman/design-system`: **breaking.** Color-bearing tokens (`colorPalette`, `gradient`, `boxShadow`) move from `colors`/the top level into `modes.light`, with an optional `modes.dark`. The `darker` color variant is renamed `emphasis`. `color()`, `gradient()` and `boxShadow()` now return CSS variables instead of literal values. New: `colorModeCss()` (the global CSS defining those variables per mode, following `prefers-color-scheme` unless overridden), `rawColor()` for a literal value in one mode, `hasDarkMode()`, and the standalone `setColorMode()`, `getColorMode()` and `colorModeScript()` (a pre-paint inline script that applies a saved override). The override is a `<meta name="ds-color-mode">` tag in `<head>` rather than an attribute on `<html>`, so it never causes a hydration mismatch and needs no `suppressHydrationWarning`.
  
  `architecture` plugin: the `design-system` skill documents color modes and their wiring (`ColorModeStyle` in the `ThemeProvider`, `colorModeScript()` in the root layout), seeds `modes.dark` from a project's existing dark styles, and the template ships a dark palette. `architecture:setup` audits for the pre-1.0 tokens shape, missing wiring, mode-specific CSS outside the theme, JS color math on accessor output, and `suppressHydrationWarning`.

### Patch Changes

- 8f088d6: `design-system` skill: for API details beyond the skill's docs, read the project's installed `node_modules/@pindakaasman/design-system/dist/*.d.ts` and README instead of the mise repo's source, so the reference always matches the version the project uses. `architecture:setup` now points at the theme template relative to the plugin instead of the mise repo root, so it resolves for installed plugins.

## 0.9.0

### Minor Changes

- 056aef0: Every styled-component definition is now its own component with its own folder (generic ones in an atomic tier, owner-specific ones nested under `components/`), with the styled export as its `index.tsx` and a story. In-file styled definitions are only a flagged fallback, placed below the main component. `architecture:setup` audits and migrates existing code against the rule.
  
  The scaffolded theme no longer carries a "placeholder" comment: it's scaffolded as the project's final theme, seeded from the colors, fonts, sizes, spacing, shadows and breakpoints the project already uses (or an existing theme's values), with defaults only where the project has none, so moving onto it doesn't change how the app looks. The dev changes values in place.

## 0.8.0

### Minor Changes

- ea4ee9a: Setup skills now audit existing code against every rule in their plugin. `typescript:setup` migrates violations of the newly adopted ESLint config (`any`, `enum`, `function` declarations, `T[]`) and the `interface`/`type` and `satisfies` conventions. `architecture:setup` adds the utils/providers folder shapes, functional-style, and the remaining state-management, module-boundaries and data-flow rules to its audit. `verification:setup` treats errors from newly adopted configs as migration, not pre-existing failures.

## 0.7.2

### Patch Changes

- 13a1167: `design-system` skill: document the `ssrBreakpoint` option for choosing which breakpoint tokens resolve to during SSR.

## 0.7.1

### Patch Changes

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

## 0.7.0

### Minor Changes

- 8f460e4: Add each concern plugin's own `setup` skill, so `/init:setup` (and
  `npx @pindakaasman/mise-place`) can plan and apply real changes instead of
  reporting "no setup skill yet" for every plugin:
  
  - `typescript:setup` - installs and wires up `@pindakaasman/tsconfig`,
    `@pindakaasman/eslint-config`, and `@pindakaasman/prettier-config`.
  - `architecture:setup` - scaffolds/migrates the atomic folder structure and
    the design-system theme, and audits state-management/module-boundaries/
    data-flow conventions.
  - `react:setup` - audits and migrates existing components against
    `component-patterns`.
  - `testing:setup` - installs Vitest always, Storybook/Playwright when the
    project's environment warrants them, and migrates misplaced tests.
