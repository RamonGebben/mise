---
'@pindakaasman/testing-plugin': patch
---

`testing:setup` names the Vitest config `vitest.config.mts` in CommonJS packages (no `"type": "module"`), and renames an existing `.ts` one, so Vite stops warning that the config is ESM loaded as CommonJS.
