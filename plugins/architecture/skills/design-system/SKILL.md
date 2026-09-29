---
name: design-system
description: The DesignSystem class - a typed, breakpoint-aware accessor over theme tokens - and how it's provided as the styled-components theme
---

# Design system

Theming isn't a plain nested object accessed by property path
(`theme.color.primary.base`). It's an instance of a `DesignSystem` class,
constructed from a raw tokens object, exposing typed accessor methods.

**Why a class instead of a flat object:** `fontSize()` and `spacing()`
resolve differently depending on the current viewport (via
`getCurrentBreakpoint()`), which a plain object can't express - there's no
way for `theme.spacing.base` to mean something different on mobile vs.
desktop. A class also gives every token a typed accessor (`color(hue,
variant)`, `boxShadow(variant)`, …) instead of an arbitrary string path that
only fails at runtime when it's wrong, and bundles the matching `mq` media
query generator (from `styled-media-query`) off the same breakpoints so
queries and token resolution never drift apart.

## File layout

```
src/theme/
  index.ts                      SystemTokens type, the placeholder default tokens, the theme instance
  design-system/
    index.ts                    the DesignSystem class
    types.ts                    ColorString and friends
    tokens/
      index.ts                  SystemBreakpoint, SystemSize, SystemZIndex, SystemBoxShadow, SystemGradient, …
      colorPalette.ts           BaseColor, BaseColorVariant
```

Full implementation: [templates/theme/](templates/theme/). Copy it as a
starting point, then replace the placeholder values in `theme/index.ts`
with real design tokens - the structure is real, the colors/numbers are not.

## Providing the theme

```tsx
// src/providers/ThemeProvider/index.tsx
'use client';

import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import theme from '~/theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <StyledThemeProvider theme={() => theme}>{children}</StyledThemeProvider>;
}
```

`theme={() => theme}` (a function, not the instance directly) rather than
`theme={theme}`: styled-components accepts either a theme object or a
function of the outer theme. Passing a function that ignores its argument
and always returns the same `DesignSystem` instance keeps that instance
stable, and skips styled-components' own merge-with-outer-theme behavior,
which doesn't apply here since there's only one theme instance to begin
with.

Compose with the SSR registry from [[styling]]:

```tsx
<StyledComponentsRegistry>
  <ThemeProvider>{children}</ThemeProvider>
</StyledComponentsRegistry>
```

## Accessing tokens

Always through the typed methods - never a hard-coded value, and never a
raw property-path string (`theme.get('colors.primary.base')` is an escape
hatch for the rare case nothing else covers, not the default way in).

```ts
// bad - hard-coded, bypasses the design system entirely
const Card = styled.div`
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  padding: 16px;
`;
```

```ts
// good - typed, breakpoint-aware, one source of truth
const Card = styled.div`
  background: ${({ theme }) => theme.color('background')};
  box-shadow: ${({ theme }) => theme.boxShadow('card')};
  padding: ${({ theme }) => theme.spacing('base')};

  ${({ theme }) => theme.mq.tabletLandscape`
    padding: ${theme.spacing('l')};
  `}
`;
```

## Known gaps carried over from the pasted source

Two small inconsistencies were in the original code as given - fixed in the
template with a note, flagged here in case the real codebase has since
diverged from what was pasted:

- **`SystemZIndex` naming collision.** The pasted types file defines
  `SystemZIndex` as the *map* interface (`{ [name: string]: number }`), but
  `DesignSystem.z()` imports a type of the same name from `./tokens` and
  uses it as a *key* into that map - which only works if it's actually a
  key-union (`'base' | 'dropdown' | …`), a different shape entirely. The
  template renames the map interface to `SystemZIndexScale` in
  `theme/index.ts` to remove the collision, and keeps `SystemZIndex` as the
  key-union in `tokens/index.ts`, matching what the class actually imports.
- **Missing `boxShadow` and `colors.gradient` fields.** `DesignSystem`
  reads `this.ds.boxShadow` and `this.ds.colors.gradient`, but the pasted
  `System`/`SystemColor` interfaces didn't declare either - only `System`'s
  top-level `[prop: string]: any` kept that from being a type error. The
  template adds both explicitly.

## ramda

`ramda` is used as a general functional-utilities library across the
codebase (see [[functional-style]]), not just for `DesignSystem.get()`'s
`path()` call.
