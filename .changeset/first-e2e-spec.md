---
'@pindakaasman/testing-plugin': minor
---

`testing:setup` no longer leaves `e2e/` empty: it adds one spec (the project's most central user task, or `e2e/app/open-the-app.spec.ts` on a blank starter) and a `webServer` in the Playwright config so the suite runs on its own.
