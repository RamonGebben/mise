---
'@pindakaasman/typescript-plugin': minor
'@pindakaasman/architecture-plugin': minor
'@pindakaasman/verification-plugin': patch
---

Setup skills now audit existing code against every rule in their plugin. `typescript:setup` migrates violations of the newly adopted ESLint config (`any`, `enum`, `function` declarations, `T[]`) and the `interface`/`type` and `satisfies` conventions. `architecture:setup` adds the utils/providers folder shapes, functional-style, and the remaining state-management, module-boundaries and data-flow rules to its audit. `verification:setup` treats errors from newly adopted configs as migration, not pre-existing failures.
