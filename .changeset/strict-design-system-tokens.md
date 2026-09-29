---
"@pindakaasman/design-system": minor
---

Breaking: `SystemTokens` now requires every field `DesignSystem` reads (`type`, `type.sizes`, `type.baseFontSize`, `colors.colorPalette`, `colors.gradient`, `spacing.scale`, `zIndex`, `boxShadow`), with sizes and spacing given for all four breakpoints and every `SystemSize`. Tokens missing any of these used to crash at runtime; they're now a type error.

Declares `styled-components` as a peer dependency (needed by `styled-media-query`), and fixes the build so the package actually compiles.
