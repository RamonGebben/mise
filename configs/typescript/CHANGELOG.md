# @pindakaasman/tsconfig

## 0.2.0

### Minor Changes

- 66f59e3: Breaking: `library.json` no longer sets `rootDir`/`outDir`. They resolved relative to this package, not yours, so set them in your own `tsconfig.json` (`"rootDir": "src", "outDir": "dist"`). Also sets `incremental: false`, so a clean rebuild after deleting `dist/` always emits.
