# @pindakaasman/init-plugin

## 0.5.0

### Minor Changes

- 92b2068: New `accessibility` plugin: WCAG 2.2 AA plus 44px touch targets. `accessibility:conventions` covers what the design system, lint and Storybook enforce, and the judgment calls they can't make (targets, focus, color pairs, reflow, keyboard, forced colors, reduced motion). `accessibility:setup` wires up jsx-a11y, `@storybook/addon-a11y` with failing tests, and the design-system token audit, and audits existing code against every convention. `init:setup` runs it after `testing`.

## 0.4.0

### Minor Changes

- 6cf7013: `verification:setup`'s `lint-staged.config.mjs` assigns its config to a variable before exporting it, so Next.js projects no longer get an `import/no-anonymous-default-export` warning. `init:setup` now runs the project's format/lint/typecheck/test checks after applying, and treats warnings as something to fix before reporting done.

## 0.3.0

### Minor Changes

- c2fd16d: Add the `verification` plugin: when to run which checks (related tests while developing, the full pre-commit gate before every commit, e2e/Storybook when a change touches them) and how to handle a failing check, plus a `setup` skill that installs husky + lint-staged and the standard `format`/`lint`/`typecheck`/`test` scripts. `init:setup` runs it last, and `mise-place` installs it.
