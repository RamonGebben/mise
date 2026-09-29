---
"@pindakaasman/design-system": minor
"@pindakaasman/eslint-config": minor
"@pindakaasman/mise-place": patch
"@pindakaasman/architecture-plugin": patch
---

Wire this repo's own `configs/*` into its own root (`eslint.config.mjs`,
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
