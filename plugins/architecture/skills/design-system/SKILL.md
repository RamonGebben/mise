---
name: design-system
description: The published @pindakaasman/design-system package - a typed, breakpoint-aware accessor over theme tokens with light/dark color modes - and how it's scaffolded and provided as the styled-components theme
---

# Design system

Theming isn't a plain nested object accessed by property path
(`theme.color.primary.base`), and it isn't hand-copied into every project
either. It's an instance of the `DesignSystem` class from the published
`@pindakaasman/design-system` package (source: `packages/design-system/` in
the mise repo), constructed from a tokens object each project provides.

**Where the exact API comes from:** when you need more than this skill
documents (a method signature, a type's members), read the package the
current project actually has installed -
`node_modules/@pindakaasman/design-system/dist/*.d.ts` and its `README.md` -
not the mise repo's `src/`. The installed `.d.ts` files always match the
version the project resolves; a marketplace checkout of the repo can be
ahead of or behind it. If the package isn't installed yet, this skill is
the reference.

**Why a published package instead of a copy-in template:** the class and its
type contract (`SystemTokens`, the `SystemSize`/`SystemBreakpoint`/etc.
key-unions) are the same across every project - improving `DesignSystem` or
adding a new accessor method should mean bumping a dependency version, not
re-copying a file into each project and reconciling drift. Only the
project-specific piece - actual token _values_ - gets scaffolded in.

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
    colorMode.ts                  ColorMode, setColorMode/getColorMode, colorModeScript
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
  breakpoints: {
    mobile: '375px',
    tablet: '768px',
    tabletLandscape: '1024px',
    desktop: '1440px',
  },
  modes: {
    light: { colorPalette, gradient, boxShadow },
    dark: { colorPalette, gradient, boxShadow }, // optional
  },
  // ... the rest of your real design tokens
};

const theme = new DesignSystem(tokens);
export default theme;
```

Default theme: [templates/theme/index.ts](templates/theme/index.ts). Once
scaffolded it _is_ the project's theme - no comment marking it as a
template or placeholder. The dev changes its values in place whenever they
want to.

**Seeded from what the project already uses.** Before falling back to the
template's defaults, populate the tokens from the values the project
already has - global CSS and CSS variables, font imports (`next/font`,
`@font-face`, Google Fonts links), `font-family`/`font-size`/`font-weight`
declarations, colors, shadows, gradients, radii and spacing in stylesheets
and styled-components literals, and the widths in existing media queries.
Moving onto the theme should look like nothing changed: the app renders the
same, and the dev doesn't have to spend time tuning the theme before it
fits their own design.

- Map a value to the token slot it actually plays (the color on primary
  buttons and links is `primary`, the page background is `background`, the
  body font is `fontFamily.base`). When several near-identical values fill
  one slot, take the most-used one.
- Fill the size and spacing scales from the values in use, sorted onto the
  closest steps. A step with no matching value keeps the template's
  default, and so does any token the project has no value for.
- Only use values that are really in the project - don't invent brand
  colors or a font the project doesn't load.
- Dark styles the project already has (`@media (prefers-color-scheme:
dark)` blocks, a `.dark` class, Tailwind `dark:` variants) seed
  `modes.dark`, slot by slot the same way. An existing project without any
  stays light-only: leave out `modes.dark` rather than taking the
  template's, because a dark palette it never had would change how it
  looks for every user whose OS is set to dark. A blank starter with no
  styling of its own gets the template's dark palette.
- Seeding the theme from these values is what makes the later swap of
  hardcoded values for accessor calls a clean, one-to-one mapping.

**Rendering without a viewport.** `fontSize()`, `spacing()` and
`spacingBetween()` resolve per breakpoint, which needs a viewport. During
SSR there isn't one, so they fall back to the largest breakpoint. A
mobile-first app can switch that to the smallest by passing an option -
leave the default unless the project asks for it:

```ts
const theme = new DesignSystem(tokens, { ssrBreakpoint: 'smallest' });
```

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
import { ColorModeStyle } from './components/ColorModeStyle';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <StyledThemeProvider theme={() => theme}>
      <ColorModeStyle />
      {children}
    </StyledThemeProvider>
  );
};
```

`ColorModeStyle` defines the CSS variables the color accessors return - see
"Color modes" below.

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

## Color modes

Every token that holds a color - `colorPalette`, `gradient` and
`boxShadow` - lives under `modes.light`, and optionally `modes.dark`.
Everything else (type, spacing, breakpoints, z-index) is the same in every
mode.

The mode switches in CSS, not by swapping theme instances. `color()`,
`gradient()` and `boxShadow()` return CSS variables
(`var(--ds-color-primary-base)`), and `theme.colorModeCss()` defines them
per mode. **Why:** the server can't know the user's preference, so swapping
`DesignSystem` instances in the `ThemeProvider` means a flash of the wrong
mode (or a hydration mismatch) on every server-rendered page, and a
re-render of every styled component on each toggle. Variables avoid both,
and a component never has to know which mode it's in.

- **Follows the OS by default** (`prefers-color-scheme`), with
  `setColorMode('light' | 'dark' | 'system')` as the user's override,
  remembered in `localStorage`. **Why:** most users have already told their
  OS what they want; the override is for the ones who want this app to
  differ.
- **`modes.dark` is optional.** Without it the theme is light-only and
  ignores the OS preference, and `setColorMode('dark')` changes nothing
  visible. **Why:** some projects are deliberately single-mode - a brand
  site, a stream overlay - and shouldn't be forced to design a second
  palette.
- **`emphasis`, not `darker`.** A color's stronger shade (hover, pressed,
  borders) is `emphasis`, because in a dark palette it's usually _lighter_
  than `base`. Name variants for their role, never a direction.

### Wiring

The variables come from a global style the `ThemeProvider` renders (see
"Providing the theme" above). It's a styled component specific to the
provider, so it lives in the provider's `components/` (see
[[folder-structure]]'s "Styled components are components"); like the
provider itself it has no story.

```tsx
// src/providers/ThemeProvider/components/ColorModeStyle/index.tsx
'use client';

import { createGlobalStyle } from 'styled-components';

export const ColorModeStyle = createGlobalStyle`
  ${({ theme }) => theme.colorModeCss()}
`;
```

With `modes.dark`, the root layout also inlines `colorModeScript()` in
`<head>`. It applies a saved override before first paint, so a user who
picked a mode never sees the other one flash first:

```tsx
// src/app/layout.tsx
import { colorModeScript } from '@pindakaasman/design-system';

<html lang="en">
  <head>
    <script dangerouslySetInnerHTML={{ __html: colorModeScript() }} />
  </head>
  <body>…</body>
</html>;
```

**No `suppressHydrationWarning`.** Prevent a hydration mismatch rather
than silence it: a suppressed warning hides the next, real mismatch on the
same element too. That's why the override is a `<meta>` tag the script adds
to `<head>`, not an attribute on `<html>` - the server can't know the saved
choice, so an attribute would differ from the server's HTML, while React 19
skips tags in `<head>` it didn't render.

```tsx
// bad - the script changes <html>, so the warning gets silenced instead
<html lang="en" suppressHydrationWarning>
```

```tsx
// good - nothing React rendered changes before hydration
<html lang="en">
```

A toggle is just UI calling `setColorMode()` (and `getColorMode()` for the
current choice) - add one only when the project wants it.

```tsx
// bad - mode logic in a component, outside the theme
const Card = styled.div`
  background: #fff;
  @media (prefers-color-scheme: dark) {
    background: #111;
  }
`;
```

```tsx
// good - the token already follows the mode
const Card = styled.div`
  background: ${({ theme }) => theme.color('background')};
`;
```

The accessors' variables can't go through JS color math (`darken()`,
`transparentize()`, …) - a library can't parse `var(--…)`. Prefer a token
for the shade you need. When math is genuinely unavoidable, use
`theme.rawColor(hue, variant, mode)` for the literal value of one mode, and
do it for every mode the theme has - otherwise that one value stops
following the mode.

## Accessing tokens

Always through the typed methods - never a hard-coded value, and never a
raw property-path string (`theme.get('modes.light.colorPalette.primary.base')` is an escape
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

  ${({ theme }) => theme.mq.greaterThan('tabletLandscape')`
    padding: ${theme.spacing('l')};
  `}
`;
```

## Package decisions worth knowing

Things `packages/design-system` resolves that the earlier pasted source
had inconsistent, now fixed once at the package level rather than something
every project needs to reconcile:

- **`SystemZIndex` naming.** `system.ts`'s map interface is named
  `SystemZIndexScale`; `tokens.ts`'s key-union (what `DesignSystem.z()`
  actually takes as a parameter) is `SystemZIndex`. Same root name
  originally collided across two different shapes - kept distinct here.
- **`boxShadow` and `gradient`.** Both were read by `DesignSystem` without
  being declared on the tokens type. They're now declared explicitly, on
  `SystemModeTokens` in `system.ts`, next to `colorPalette` - shadows and
  gradients hold colors, so they change per mode too.

## ramda

`ramda` is used as a general functional-utilities library across the
codebase (see [[functional-style]]), not just for `DesignSystem.get()`'s
`path()` call. It's a regular dependency of `packages/design-system`.
