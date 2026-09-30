# @pindakaasman/verification-plugin

## 0.1.1

### Patch Changes

- ea4ee9a: Setup skills now audit existing code against every rule in their plugin. `typescript:setup` migrates violations of the newly adopted ESLint config (`any`, `enum`, `function` declarations, `T[]`) and the `interface`/`type` and `satisfies` conventions. `architecture:setup` adds the utils/providers folder shapes, functional-style, and the remaining state-management, module-boundaries and data-flow rules to its audit. `verification:setup` treats errors from newly adopted configs as migration, not pre-existing failures.

## 0.1.0

### Minor Changes

- c2fd16d: Add the `verification` plugin: when to run which checks (related tests while developing, the full pre-commit gate before every commit, e2e/Storybook when a change touches them) and how to handle a failing check, plus a `setup` skill that installs husky + lint-staged and the standard `format`/`lint`/`typecheck`/`test` scripts. `init:setup` runs it last, and `mise-place` installs it.
