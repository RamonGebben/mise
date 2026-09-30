# @pindakaasman/typescript-plugin

## 0.3.0

### Minor Changes

- ea4ee9a: Setup skills now audit existing code against every rule in their plugin. `typescript:setup` migrates violations of the newly adopted ESLint config (`any`, `enum`, `function` declarations, `T[]`) and the `interface`/`type` and `satisfies` conventions. `architecture:setup` adds the utils/providers folder shapes, functional-style, and the remaining state-management, module-boundaries and data-flow rules to its audit. `verification:setup` treats errors from newly adopted configs as migration, not pre-existing failures.

## 0.2.0

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
