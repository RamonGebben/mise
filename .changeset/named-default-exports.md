---
'@pindakaasman/verification-plugin': patch
'@pindakaasman/init-plugin': minor
---

`verification:setup`'s `lint-staged.config.mjs` assigns its config to a variable before exporting it, so Next.js projects no longer get an `import/no-anonymous-default-export` warning. `init:setup` now runs the project's format/lint/typecheck/test checks after applying, and treats warnings as something to fix before reporting done.
