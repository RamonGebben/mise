# @pindakaasman/init-plugin

## 0.4.0

### Minor Changes

- 6cf7013: `verification:setup`'s `lint-staged.config.mjs` assigns its config to a variable before exporting it, so Next.js projects no longer get an `import/no-anonymous-default-export` warning. `init:setup` now runs the project's format/lint/typecheck/test checks after applying, and treats warnings as something to fix before reporting done.

## 0.3.0

### Minor Changes

- c2fd16d: Add the `verification` plugin: when to run which checks (related tests while developing, the full pre-commit gate before every commit, e2e/Storybook when a change touches them) and how to handle a failing check, plus a `setup` skill that installs husky + lint-staged and the standard `format`/`lint`/`typecheck`/`test` scripts. `init:setup` runs it last, and `mise-place` installs it.
