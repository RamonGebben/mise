---
name: design-system
description: The published @pindakaasman/design-system package - a typed, breakpoint-aware accessor over theme tokens - and how it's scaffolded and provided as the styled-components theme
---

# Design system

Theming isn't a plain nested object accessed by property path
(`theme.color.primary.base`), and it isn't hand-copied into every project
either. It's an instance of the `DesignSystem` class from the published
`@pindakaasman/design-system` package (source: `packages/design-system/` in
this repo), constructed from a tokens object each project provides.

**Why a published package instead of a copy-in template:** the class and its
type contract (`SystemTokens`, the `SystemSize`/`SystemBreakpoint`/etc.
key-unions) are the same across every project - improving `DesignSystem` or
adding a new accessor method should mean bumping a dependency version, not
re-copying a file into each project and reconciling drift. Only the
project-specific piece - actual token *values* - gets scaffolded in.

**Why a class instead of a flat object**, unchanged from the original
reasoning: `fontSize()` and `spacing()` resolve differently depending on the
current viewport (via `getCurrentBreakpoint()`), which a plain object can't
express. A class also gives every token a typed accessor (`color(hue,
variant)`, `boxShadow(variant)`, …) instead of an arbitrary string path that
only fails at runtime when it's wrong, and bundles the matching `mq` media
query generator (from `styled-media-query`) off the same breakpoints so
queries and token resolution never drift apart.

## What's published vs. what's scaffolded

```
packages/design-system/          published as @pindakaasman/design-system
  src/
    DesignSystem.ts               the class
    system.ts                     System/SystemTokens - the shape contract
    tokens.ts                     SystemBreakpoint, SystemSize, SystemZIndex, SystemBoxShadow, SystemGradient, …
    colorPalette.ts               BaseColor, BaseColorVariant
    types.ts                      ColorString and friends
    index.ts                      public exports
```

```
src/theme/index.ts                scaffolded per-project, NOT published
```

The project file only holds concrete values and constructs the instance:

```ts
// src/theme/index.ts
import DesignSystem, { type SystemTokens } from '@pindakaasman/design-system';

const tokens: SystemTokens = {
  breakpoints: { mobile: '375px', tablet: '768px', tabletLandscape: '1024px', desktop: '1440px' },
  // ... the rest of your real design tokens
};

const theme = new DesignSystem(tokens);
export default theme;
```

Full placeholder starting point: [templates/theme/index.ts](templates/theme/index.ts).
Structure is real, the colors/numbers are not - replace them with your
actual brand values.

> **Roadmap note:** when the published package's `SystemTokens` shape
> changes across a version bump, each project's scaffolded tokens file needs
> a matching migration. The plan is to have setup/migration tooling do this
> with AI assistance rather than by hand - not built yet, just the intended
> direction.

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

## Package decisions worth knowing

Two things `packages/design-system` resolves that the earlier pasted source
had inconsistent, now fixed once at the package level rather than something
every project needs to reconcile:

- **`SystemZIndex` naming.** `system.ts`'s map interface is named
  `SystemZIndexScale`; `tokens.ts`'s key-union (what `DesignSystem.z()`
  actually takes as a parameter) is `SystemZIndex`. Same root name
  originally collided across two different shapes - kept distinct here.
- **`boxShadow` and `colors.gradient`.** `DesignSystem` reads
  `this.ds.boxShadow` and `this.ds.colors.gradient` - both are now declared
  explicitly on `System`/`SystemColor` in `system.ts`.

## ramda

`ramda` is used as a general functional-utilities library across the
codebase (see [[functional-style]]), not just for `DesignSystem.get()`'s
`path()` call. It's a regular dependency of `packages/design-system`.
