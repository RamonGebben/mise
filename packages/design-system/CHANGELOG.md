# @pindakaasman/design-system

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
