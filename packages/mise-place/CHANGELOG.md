# @pindakaasman/mise-place

## 0.3.0

### Minor Changes

- 966e557: Default the marketplace source to the `RamonGebben/mise` GitHub repo instead of `~/Projects/mise`, so `npx @pindakaasman/mise-place` works on any machine. Pass `--marketplace` or set `MISE_MARKETPLACE` to use a local clone.
- 7660574: Update the `mise` marketplace and every already-installed plugin on each run, instead of skipping them, so `npx @pindakaasman/mise-place` always starts `/init:setup` on the latest released plugin versions.

## 0.2.0

### Minor Changes

- c2fd16d: Add the `verification` plugin: when to run which checks (related tests while developing, the full pre-commit gate before every commit, e2e/Storybook when a change touches them) and how to handle a failing check, plus a `setup` skill that installs husky + lint-staged and the standard `format`/`lint`/`typecheck`/`test` scripts. `init:setup` runs it last, and `mise-place` installs it.

## 0.1.2

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

## 0.1.1

### Patch Changes

- a8e389d: Add `license` (MIT), `author`, `bugs`, and `homepage` fields so the npm registry page for each package is complete.
