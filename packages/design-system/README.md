# @pindakaasman/design-system

The `DesignSystem` class and its type contract: a typed, breakpoint-aware
accessor over theme tokens, published so it can be versioned and upgraded
across projects without copy-pasting.

This package ships the **class and the shape** (`SystemTokens` and the
`SystemFontSize`/`SystemBreakpoint`/etc. key-unions) - not concrete token
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
    mobile: '0px',
    tablet: '768px',
    tabletLandscape: '1024px',
    desktop: '1440px',
  },
  type: {
    ratio: 1.333,
    floor: 0.75,
    base: {
      mobile: '100%',
      tablet: '100%',
      tabletLandscape: '106.25%',
      desktop: '112.5%',
    },
    // fontFamily, fontWeight, lineHeight
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

### One scale, one root

Font sizes and spacing are steps of one modular scale: `base` is `1rem`,
every step up multiplies by `type.ratio` and every step down divides by it.
Spacing follows the type, as in print - there's no separate spacing table.
Only the root font size changes per breakpoint (`type.base`), so everything
in rem grows or shrinks together and keeps its proportions.

- `type.ratio` - set by whoever authors the tokens (1.333, a perfect fourth,
  in the scaffolded template). The same at every breakpoint.
- `type.floor` - the smallest a font size may resolve to, in rem. Spacing has
  no floor.
- `type.base` - the root font size per breakpoint, as a percentage of the
  user's own browser setting. Never px: that would override the setting
  (WCAG 1.4.4).
- `breakpoints` - the width each breakpoint _starts_ at. The smallest is
  `'0px'`.

`SystemFontSize` is `'s' | 'base' | 'm' | 'l' | 'xl'`; `SystemSpacing` adds
`'xxs'` and `'xs'` below them. Type stops at `s` because the floor would
merge anything smaller into it.

`rootCss()` emits the root font size per breakpoint (`@media (min-width: …)`)
and the constant rem variables `fontSize()`, `spacing()`, `spacingBetween()`
and `minTarget()` return, so the browser resolves the current breakpoint
itself - no theme swap, no re-render, and no hydration mismatch from a
server-side guess.

```ts
const RootStyle = createGlobalStyle`
  ${({ theme }) => theme.rootCss()}
`;
```

Since the accessors return variables, JS math on them won't work (e.g.
`parseFloat(theme.fontSize('l'))` is `NaN`). `remToPx(value, breakpoint?)`
converts at a breakpoint's root font size (the smallest by default),
assuming the browser's default 16px.

`getCurrentBreakpoint()` resolves from the real viewport in the browser, or
the `ssrBreakpoint` option where there's none (server rendering, plain Node) -
the largest breakpoint by default, or the smallest for a mobile-first app:

```ts
const theme = new DesignSystem(tokens, { ssrBreakpoint: 'smallest' });
```

It's a one-off synchronous read, not reactive - don't use it to render DOM
that needs to match between server and client.

## Accessibility

- **Target size.** `minTarget()` is 24px (WCAG 2.5.8, AA) for a mouse or
  trackpad and 44px (2.5.5, AAA) wherever a touch input is present
  (`any-pointer: coarse`). It's px on purpose, and meant as a floor:
  `min-block-size: max(${theme.minTarget()}, …)`.
- **Focus.** `focus` is a palette color like any other - `color('focus')` is
  the focus ring.
- **`auditTokens(tokens)`** returns every WCAG AA failure the tokens alone
  decide, plus the scale's own rules - empty when they comply. Run it as a
  test in CI:

  ```ts
  expect(auditTokens(tokens)).toEqual([]);
  ```

  | Rule                | Checks                                                                                  |
  | ------------------- | --------------------------------------------------------------------------------------- |
  | `text-contrast`     | Every color's `text` on its `base` and `emphasis` is at least 4.5:1 (1.4.3).            |
  | `ui-contrast`       | Every color but `background`/`formBackground` has a `base` of 3:1 on the page (1.4.11). |
  | `unparseable-color` | A color the audit can't read - reported rather than silently passed.                    |
  | `floor-raises-step` | The ratio is steep enough that the floor raises `fontSize('s')`.                        |
  | `input-zoom`        | A breakpoint's root is under 100%, so inputs are under 16px and iOS zooms in on focus.  |
  | `breakpoint-origin` | The smallest breakpoint doesn't start at 0.                                             |

  `contrastRatio(foreground, background)` is exported for one-off checks.

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
never a raw property-path string or a dig through the raw tokens
(`theme.get(...)` and `theme.getTokens()` are escape hatches for the rare
case nothing else covers, not the default way in):

```ts
const Card = styled.div`
  background: ${({ theme }) => theme.color('background')};
  box-shadow: ${({ theme }) => theme.boxShadow('card')};
  border-radius: ${({ theme }) => theme.borderRadius('base')};
  padding: ${({ theme }) => theme.spacing('base')};

  ${({ theme }) => theme.mq.greaterThan('tabletLandscape')`
    padding: ${theme.spacing('l')};
  `}
`;
```

## API

| Method                                        | Params                                                                              | Returns            | Description                                                                                                                                                          |
| --------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `color(hue, variant?)`                        | `hue: BaseColor`, `variant: BaseColorVariant = 'base'`                              | `CssVar`           | Color from your palette, following the current mode.                                                                                                                 |
| `rawColor(hue, variant?, mode?)`              | `hue: BaseColor`, `variant: BaseColorVariant = 'base'`, `mode: ColorMode = 'light'` | `ColorString`      | Literal color value in one mode (light without dark tokens) - for JS color math.                                                                                     |
| `gradient(variant?)`                          | `variant: SystemGradient = 'menu'`                                                  | `CssVar`           | Gradient from your gradient palette, following the current mode.                                                                                                     |
| `boxShadow(variant?)`                         | `variant: SystemBoxShadow = 'base'`                                                 | `CssVar`           | Box-shadow value, following the current mode.                                                                                                                        |
| `colorModeCss()`                              | -                                                                                   | `string`           | Global CSS defining the color variables the accessors return, per mode.                                                                                              |
| `hasDarkMode()`                               | -                                                                                   | `boolean`          | Whether the tokens define `modes.dark`.                                                                                                                              |
| `fontSize(size)` / `fs(size)`                 | `size: SystemFontSize`                                                              | `CssVar`           | Step of the type scale, in rem - never below `type.floor`.                                                                                                           |
| `fontFamily(family)` / `ff(family)`           | `family: SystemFontFamily`                                                          | `string`           | Font family.                                                                                                                                                         |
| `fontWeight(weight)` / `fw(weight)`           | `weight: SystemFontWeight`                                                          | `number`           | Font weight.                                                                                                                                                         |
| `lineHeight(selector)` / `lh(selector)`       | `selector: SystemLineHeight`                                                        | `number`           | Line height.                                                                                                                                                         |
| `spacing(size)` / `space(size)`               | `size: SystemSpacing`                                                               | `CssVar`           | Step of the spacing scale (same ratio as type), in rem.                                                                                                              |
| `spacingBetween(a, b)` / `spaceBetween(a, b)` | `a: SystemSpacing, b: SystemSpacing`                                                | `string`           | Difference between two spacing steps, as a `calc()` expression.                                                                                                      |
| `rootCss()`                                   | -                                                                                   | `string`           | Global CSS: the root font size per breakpoint, the scale variables and `minTarget()`.                                                                                |
| `minTarget()`                                 | -                                                                                   | `CssVar`           | Minimum interactive target size - 24px, or 44px with a touch input.                                                                                                  |
| `bp(breakpoint)`                              | `breakpoint: SystemBreakpoint`                                                      | `string`           | Raw breakpoint value.                                                                                                                                                |
| `zIndex(z)` / `z(z)`                          | `z: SystemZIndex`                                                                   | `number`           | Z-index value.                                                                                                                                                       |
| `borderRadius(size)`                          | `size: SystemBorderRadius`                                                          | `string`           | Border radius.                                                                                                                                                       |
| `borderWidth(size)`                           | `size: SystemBorderWidth`                                                           | `string`           | Border width.                                                                                                                                                        |
| `mq`                                          | -                                                                                   | `MediaGenerator`   | Media-query generator (from `styled-media-query`) built off your breakpoints - e.g. `` theme.mq.greaterThan('tabletLandscape')`...` `` (also `lessThan`, `between`). |
| `getCurrentBreakpoint()`                      | -                                                                                   | `SystemBreakpoint` | Widest breakpoint the viewport has reached; the `ssrBreakpoint` option when there's no viewport (SSR, Node). Not reactive.                                           |
| `getTokens()`                                 | -                                                                                   | `SystemTokens`     | The raw tokens object passed to the constructor.                                                                                                                     |
| `remToPx(value, breakpoint?)`                 | `value: number \| string`, `breakpoint: SystemBreakpoint`                           | `string` (px)      | Convert rem to px at a breakpoint's root font size (the smallest by default).                                                                                        |
| `remToPxRaw(value, breakpoint?)`              | `value: number \| string`, `breakpoint: SystemBreakpoint`                           | `number`           | Convert rem to px, number only.                                                                                                                                      |
| `get(path)`                                   | `path: string`                                                                      | `unknown`          | Raw property-path lookup - escape hatch, not the default way in.                                                                                                     |

`SystemFontSize` is `'s' \| 'base' \| 'm' \| 'l' \| 'xl'`, and `SystemSpacing`
adds `'xxs' \| 'xs'`. `BaseColor`, `SystemBreakpoint`, `SystemZIndex`, `SystemBoxShadow`,
`SystemGradient`, `SystemFontFamily`, `SystemFontWeight`, `SystemLineHeight`,
`SystemBorderRadius` and `SystemBorderWidth` are the other
key-unions each accessor takes - all exported from the package, all part of
the published contract (see [`src/tokens.ts`](src/tokens.ts) and
[`src/colorPalette.ts`](src/colorPalette.ts) for the exact members).

Standalone exports: `auditTokens(tokens)`, `contrastRatio(fg, bg)`,
`MIN_TEXT_CONTRAST`, `MIN_UI_CONTRAST` (see [Accessibility](#accessibility)),
`colorModeScript(options?)`, `getColorMode(options?)`,
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
