---
'@pindakaasman/design-system': minor
---

Don't touch `window` when there's no DOM. `getCurrentBreakpoint()` (and so `fontSize()`, `spacing()` and `spacingBetween()`) used to throw `window is not defined` during server rendering; it now falls back to a breakpoint wherever `window.matchMedia` isn't available. That's the largest breakpoint by default; pass `new DesignSystem(tokens, { ssrBreakpoint: 'smallest' })` for mobile-first apps.
