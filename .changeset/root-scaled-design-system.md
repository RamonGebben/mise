---
'@pindakaasman/design-system': major
'@pindakaasman/architecture-plugin': minor
---

One modular scale, scaled by the root font size.

`@pindakaasman/design-system`: **breaking.** Font sizes and spacing are no longer px tables per breakpoint. Every step is `ratio^step` rem off one `type.ratio` (set by the token author), spacing follows the same ratio as type, and only the root font size changes per breakpoint (`type.base`, as a percentage of the user's setting). `type.floor` keeps font sizes legible. `type.sizes`, `type.baseFontSize` and `spacing` are removed. `SystemSize` splits into `SystemFontSize` (`s`…`xl`) and `SystemSpacing` (`xxs`…`xl`). Breakpoints are now the width each one starts at, and the smallest is `'0px'`. `rootCss()` replaces `breakpointCss()`. `spacingBetween()` no longer needs CSS `abs()`. `remToPx()`/`remToPxRaw()` take an optional breakpoint. `focus` joins `BaseColor`. New: `minTarget()` (24px, or 44px with a touch input), and `auditTokens()`/`contrastRatio()` for WCAG AA contrast and scale checks in CI.

`architecture` plugin: the `design-system` skill documents the one-scale model, its trade-off and the accessibility the tokens bake in, and the template uses a 1.333 ratio and WCAG-passing colors. `architecture:setup` migrates a project below `^4` by deriving the ratio and bases from its existing sizes, showing what moves.
