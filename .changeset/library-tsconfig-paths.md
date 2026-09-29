---
"@pindakaasman/tsconfig": minor
---

Breaking: `library.json` no longer sets `rootDir`/`outDir`. They resolved relative to this package, not yours, so set them in your own `tsconfig.json` (`"rootDir": "src", "outDir": "dist"`). Also sets `incremental: false`, so a clean rebuild after deleting `dist/` always emits.
