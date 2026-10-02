# @pindakaasman/testing-plugin

## 0.4.0

### Minor Changes

- 731d7b6: `testing:setup` no longer leaves `e2e/` empty: it adds one spec (the project's most central user task, or `e2e/app/open-the-app.spec.ts` on a blank starter) and a `webServer` in the Playwright config so the suite runs on its own.

### Patch Changes

- 3c9f63d: `testing:setup` names the Vitest config `vitest.config.mts` in CommonJS packages (no `"type": "module"`), and renames an existing `.ts` one, so Vite stops warning that the config is ESM loaded as CommonJS.

## 0.3.0

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
