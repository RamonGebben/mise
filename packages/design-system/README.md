# @pindakaasman/design-system

The `DesignSystem` class and its type contract: a typed, breakpoint-aware
accessor over theme tokens, published so it can be versioned and upgraded
across projects without copy-pasting.

This package ships the **class and the shape** (`SystemTokens` and the
`SystemSize`/`SystemBreakpoint`/etc. key-unions) - not concrete token
*values*. Every project provides its own colors, breakpoints, and spacing
scale, scaffolded in and satisfying `SystemTokens`. See the `architecture`
plugin's `design-system` skill for that scaffolding and full usage docs
(theming conventions, the `ThemeProvider` setup, examples).

## Install

```bash
npm install @pindakaasman/design-system styled-media-query
```

## Usage

```ts
// src/theme/index.ts (scaffolded per-project)
import DesignSystem, { type SystemTokens } from '@pindakaasman/design-system';

const tokens: SystemTokens = {
  breakpoints: { mobile: '375px', tablet: '768px', tabletLandscape: '1024px', desktop: '1440px' },
  // ... the rest of your real design tokens
};

const theme = new DesignSystem(tokens);
export default theme;
```

## Build

```bash
npm run build
```

Compiles `src/` to `dist/` (JS + declarations) via
`@pindakaasman/tsconfig/library.json`.
