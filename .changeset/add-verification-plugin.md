---
'@pindakaasman/verification-plugin': minor
'@pindakaasman/init-plugin': minor
'@pindakaasman/mise-place': minor
---

Add the `verification` plugin: when to run which checks (related tests while developing, the full pre-commit gate before every commit, e2e/Storybook when a change touches them) and how to handle a failing check, plus a `setup` skill that installs husky + lint-staged and the standard `format`/`lint`/`typecheck`/`test` scripts. `init:setup` runs it last, and `mise-place` installs it.
