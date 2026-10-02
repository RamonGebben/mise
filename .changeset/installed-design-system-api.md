---
'@pindakaasman/architecture-plugin': patch
---

`design-system` skill: for API details beyond the skill's docs, read the project's installed `node_modules/@pindakaasman/design-system/dist/*.d.ts` and README instead of the mise repo's source, so the reference always matches the version the project uses. `architecture:setup` now points at the theme template relative to the plugin instead of the mise repo root, so it resolves for installed plugins.
