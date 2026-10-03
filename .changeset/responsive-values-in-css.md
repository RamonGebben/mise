---
'@pindakaasman/design-system': major
'@pindakaasman/architecture-plugin': minor
---

Resolve responsive values in CSS instead of guessing them in JS.

`@pindakaasman/design-system`: **breaking.** `fontSize()`, `spacing()` and `spacingBetween()` used to call `getCurrentBreakpoint()` internally, which measures `window.matchMedia()` when there's a viewport and otherwise falls back to the `ssrBreakpoint` option - a guess that disagrees with the client's real viewport whenever that viewport isn't the one `ssrBreakpoint` assumes, causing a React hydration mismatch in every consumer calling these from a styled-components interpolation. They now return CSS variables (`var(--ds-font-size-l)`, `var(--ds-spacing-base)`) instead of a computed rem string, and `spacingBetween()` returns a `calc(abs(...))` expression over the same variables (requires the CSS `abs()` math function - supported in all major browsers, but only since Safari 18.2, Dec 2024). New: `breakpointCss()`, the global CSS defining those variables per breakpoint via real `@media (min-width: …)` rules, so the browser resolves the current value directly - the same fix shape `colorModeCss()` already applied to color modes. `ssrBreakpoint` and `getCurrentBreakpoint()` are unchanged but no longer affect these three accessors; JS math on their result (`parseFloat()`, `remToPx()`) no longer works.

`architecture` plugin: the `design-system` skill documents the CSS-variable accessors and their `BreakpointStyle` wiring in the `ThemeProvider` (parallel to `ColorModeStyle`), and warns against using `getCurrentBreakpoint()` for rendered output. `architecture:setup` audits for the pre-2.0 accessor contract, missing `BreakpointStyle` wiring, JS math on accessor output, and `getCurrentBreakpoint()` driving server/client-sensitive output.
