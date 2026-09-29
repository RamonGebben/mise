---
"@pindakaasman/typescript-plugin": minor
"@pindakaasman/architecture-plugin": minor
"@pindakaasman/react-plugin": minor
"@pindakaasman/testing-plugin": minor
---

Add each concern plugin's own `setup` skill, so `/init:setup` (and
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
