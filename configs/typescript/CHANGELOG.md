# @pindakaasman/tsconfig

## 0.2.2

### Patch Changes

- feb58e9: Accept TypeScript 6 and 7 as peers (`^5.0.0 || ^6.0.0 || ^7.0.0`), so projects on newer TypeScript - such as Expo SDK 58 on TS 6 - can install it without a peer-dependency conflict.

## 0.2.1

### Patch Changes

- a8e389d: Add `license` (MIT), `author`, `bugs`, and `homepage` fields so the npm registry page for each package is complete.

## 0.2.0

### Minor Changes

- 66f59e3: Breaking: `library.json` no longer sets `rootDir`/`outDir`. They resolved relative to this package, not yours, so set them in your own `tsconfig.json` (`"rootDir": "src", "outDir": "dist"`). Also sets `incremental: false`, so a clean rebuild after deleting `dist/` always emits.
