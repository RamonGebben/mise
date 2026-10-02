# @pindakaasman/architecture-plugin

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
