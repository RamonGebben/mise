---
'@pindakaasman/design-system': major
'@pindakaasman/architecture-plugin': minor
---

Add typed `fontFamily()`/`ff()`, `borderRadius()`, `borderWidth()` and `zIndex()` accessors (`z()` stays as its alias), so font families, borders and z-indexes no longer need `getTokens()`.

Breaking: `type.fontFamily` is now keyed by `SystemFontFamily` (`base`, `heading`, `mono`) instead of any string, and `border` is required. Projects must rename their font-family keys and define `border` if they hadn't. `architecture:setup` audits and migrates both, and flags `getTokens()`/`get()` reads that a typed accessor now covers.
