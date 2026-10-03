# @pindakaasman/design-system

The `DesignSystem` class and its type contract: a typed, breakpoint-aware
accessor over theme tokens, published so it can be versioned and upgraded
across projects without copy-pasting.

This package ships the **class and the shape** (`SystemTokens` and the
`SystemSize`/`SystemBreakpoint`/etc. key-unions) - not concrete token
_values_. Every project provides its own colors, breakpoints, and spacing
scale, scaffolded in and satisfying `SystemTokens`. See the `architecture`
plugin's `design-system` skill for that scaffolding and full usage docs
(theming conventions, the `ThemeProvider` setup, examples).

## Install

```bash
npm install @pindakaasman/design-system styled-components
```

## Usage

```ts
// src/theme/index.ts (scaffolded per-project)
import DesignSystem, { type SystemTokens } from '@pindakaasman/design-system';

const tokens: SystemTokens = {
  breakpoints: {
    mobile: '375px',
    tablet: '768px',
    tabletLandscape: '1024px',
    desktop: '1440px',
  },
  modes: {
    light: {
      colorPalette: {/* … */},
      gradient: {/* … */},
      boxShadow: {/* … */},
    },
    dark: {
      colorPalette: {/* … */},
      gradient: {/* … */},
      boxShadow: {/* … */},
    }, // optional
  },
  // ... the rest of your real design tokens
};

const theme = new DesignSystem(tokens);
export default theme;
```

### Responsive values and SSR

`fontSize()`, `spacing()` and `spacingBetween()` return CSS variables
(`var(--ds-font-size-l)`), not literal values - the same way `color()` does
for color modes. `breakpointCss()` defines those variables per breakpoint, via
real `@media (min-width: …)` rules, so the browser picks the right value: no
theme swap, no re-render, and no hydration mismatch from a server-side guess
disagreeing with the client's real viewport.

```ts
const GlobalStyle = createGlobalStyle`
  ${({ theme }) => theme.breakpointCss()}
`;
```

Since the accessors return variables, JS math on them won't work (e.g.
`parseFloat(theme.fontSize('l'))` is `NaN`). Reach for `getCurrentBreakpoint()`
and the raw tokens (`getTokens()`) instead, for the rare case you need a JS
number rather than a CSS value.

`getCurrentBreakpoint()` itself still resolves from the real viewport in the
browser, or the `ssrBreakpoint` option where there's none (server rendering,
plain Node) - the largest breakpoint by default, or the smallest for a
mobile-first app:

```ts
const theme = new DesignSystem(tokens, { ssrBreakpoint: 'smallest' });
```

It's a one-off synchronous read, not reactive - don't use it to render DOM
that needs to match between server and client, since that reintroduces the
hydration mismatch `fontSize()`/`spacing()`/`spacingBetween()` no longer have.

## Color modes

Every token that holds a color - `colorPalette`, `gradient` and `boxShadow` -
lives under `modes.light`, and optionally `modes.dark`. Everything else is the
same in every mode.

`color()`, `gradient()` and `boxShadow()` return CSS variables
(`var(--ds-color-primary-base)`), not literal values. `colorModeCss()`
defines those variables, so the mode switches in CSS: no theme swap, no
re-render, and no flash of the wrong mode on a server-rendered page.

```ts
const GlobalStyle = createGlobalStyle`
  ${({ theme }) => theme.colorModeCss()}
`;
```

- Light is the default, on `:root`.
- With `modes.dark`, dark applies when the OS prefers it
  (`prefers-color-scheme`), unless the user forced a mode.
- Without `modes.dark` the theme is light-only and ignores the OS preference.

Let users override the OS with `setColorMode('light' | 'dark' | 'system')`.
It saves the choice in `localStorage` and marks it with a
`<meta name="ds-color-mode">` tag in `<head>`, which `colorModeCss()` selects
on (`:root:has(…)`). `getColorMode()` reads the choice back (`'system'` when
nothing's saved). To apply a saved choice before first paint, inline
`colorModeScript()` in `<head>`:

```tsx
<html>
  <head>
    <script dangerouslySetInnerHTML={{ __html: colorModeScript() }} />
  </head>
  …
</html>
```

All three take an optional `{ storageKey }` (default `'ds-color-mode'`).

**Why a meta tag, not an attribute on `<html>`:** the server can't know the
saved choice, so an attribute the script adds to `<html>` would differ from
the server's HTML - a hydration mismatch. React 19 skips tags in `<head>` it
didn't render, so the meta tag hydrates cleanly, with no
`suppressHydrationWarning` needed. Requires `:has()` (every current browser
since 2023).

Since the color accessors return variables, JS color math on them won't work
either. Use `rawColor(hue, variant, mode)` for the literal value of one mode.

## Accessing tokens

Every token goes through a typed method - never a hard-coded value, and
never a raw property-path string (`theme.get(...)` is an escape hatch for
the rare case nothing else covers, not the default way in):

```ts
const Card = styled.div`
  background: ${({ theme }) => theme.color('background')};
  box-shadow: ${({ theme }) => theme.boxShadow('card')};
  padding: ${({ theme }) => theme.spacing('base')};

  ${({ theme }) => theme.mq.greaterThan('tabletLandscape')`
    padding: ${theme.spacing('l')};
  `}
`;
```

## API

| Method                                        | Params                                                                              | Returns            | Description                                                                                                                                                            |
| --------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `color(hue, variant?)`                        | `hue: BaseColor`, `variant: BaseColorVariant = 'base'`                              | `CssVar`           | Color from your palette, following the current mode.                                                                                                                   |
| `rawColor(hue, variant?, mode?)`              | `hue: BaseColor`, `variant: BaseColorVariant = 'base'`, `mode: ColorMode = 'light'` | `ColorString`      | Literal color value in one mode (light without dark tokens) - for JS color math.                                                                                       |
| `gradient(variant?)`                          | `variant: SystemGradient = 'menu'`                                                  | `CssVar`           | Gradient from your gradient palette, following the current mode.                                                                                                       |
| `boxShadow(variant?)`                         | `variant: SystemBoxShadow = 'base'`                                                 | `CssVar`           | Box-shadow value, following the current mode.                                                                                                                          |
| `colorModeCss()`                              | -                                                                                   | `string`           | Global CSS defining the color variables the accessors return, per mode.                                                                                                |
| `hasDarkMode()`                               | -                                                                                   | `boolean`          | Whether the tokens define `modes.dark`.                                                                                                                                |
| `fontSize(size)` / `fs(size)`                 | `size: SystemSize`                                                                  | `CssVar`           | Font size, following the current breakpoint.                                                                                                                           |
| `fontWeight(weight)` / `fw(weight)`           | `weight: SystemFontWeight`                                                          | `number`           | Font weight.                                                                                                                                                           |
| `lineHeight(selector)` / `lh(selector)`       | `selector: SystemLineHeight`                                                        | `number`           | Line height.                                                                                                                                                           |
| `spacing(size)` / `space(size)`               | `size: SystemSize`                                                                  | `CssVar`           | Spacing value, following the current breakpoint.                                                                                                                       |
| `spacingBetween(a, b)` / `spaceBetween(a, b)` | `a: SystemSize, b: SystemSize`                                                      | `string`           | Absolute spacing between two sizes, as a `calc(abs(...))` expression.                                                                                                  |
| `breakpointCss()`                             | -                                                                                   | `string`           | Global CSS defining the `fontSize()`/`spacing()`/`spacingBetween()` variables, per breakpoint.                                                                         |
| `bp(breakpoint)`                              | `breakpoint: SystemBreakpoint`                                                      | `string`           | Raw breakpoint value.                                                                                                                                                  |
| `z(z)`                                        | `z: SystemZIndex`                                                                   | `number`           | Z-index value.                                                                                                                                                         |
| `mq`                                          | -                                                                                   | `MediaGenerator`   | Media-query generator (from `styled-media-query`) built off your breakpoints - e.g. `` theme.mq.greaterThan('tabletLandscape')`...` `` (also `lessThan`, `between`).   |
| `getCurrentBreakpoint()`                      | -                                                                                   | `SystemBreakpoint` | Closest matching breakpoint for the current viewport; the `ssrBreakpoint` option when there's no viewport (SSR, Node). Not reactive - see "Responsive values and SSR". |
| `getTokens()`                                 | -                                                                                   | `SystemTokens`     | The raw tokens object passed to the constructor.                                                                                                                       |
| `remToPx(value)`                              | `value: number \| string`                                                           | `string` (px)      | Convert rem to px, with unit.                                                                                                                                          |
| `remToPxRaw(value)`                           | `value: number \| string`                                                           | `number`           | Convert rem to px, number only.                                                                                                                                        |
| `get(path)`                                   | `path: string`                                                                      | `unknown`          | Raw property-path lookup - escape hatch, not the default way in.                                                                                                       |

`SystemSize` is `'xxs' \| 'xs' \| 's' \| 'base' \| 'm' \| 'l' \| 'xl'`.
`BaseColor`, `SystemBreakpoint`, `SystemZIndex`, `SystemBoxShadow`,
`SystemGradient`, `SystemFontWeight` and `SystemLineHeight` are the other
key-unions each accessor takes - all exported from the package, all part of
the published contract (see [`src/tokens.ts`](src/tokens.ts) and
[`src/colorPalette.ts`](src/colorPalette.ts) for the exact members).

Standalone exports: `colorModeScript(options?)`, `getColorMode(options?)`,
`setColorMode(mode, options?)` and `COLOR_MODE_META` (`'ds-color-mode'`) -
see [Color modes](#color-modes).

For how this gets scaffolded and provided as a `styled-components` theme in
a real project (the `ThemeProvider` wiring, SSR registry, per-project token
values), see the `architecture` plugin's `design-system` skill
(`/architecture:design-system`).

## Build

```bash
npm run build
```

Compiles `src/` to `dist/` (JS + declarations) via
`@pindakaasman/tsconfig/library.json`.
