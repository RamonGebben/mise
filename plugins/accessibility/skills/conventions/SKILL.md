---
name: conventions
description: WCAG 2.2 AA plus 44px touch targets - what the design system, jsx-a11y and Storybook's a11y addon already enforce, and the judgment calls they can't make (focus, color, reflow, keyboard, forced colors, motion)
---

# Accessibility conventions

The target is **WCAG 2.2 AA**, plus 44px touch targets from 2.5.5 (AAA).
Accessibility is baked in, not bolted on after the fact: most of it is
enforced before a human looks at the code, and the rest are the rules
below.

| Where                                        | What it enforces                                                                                          |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `@pindakaasman/design-system`                | Root size in `%` (1.4.4), `minTarget()` (2.5.8 / 2.5.5), a `focus` color, unitless line-heights (1.4.12). |
| `auditTokens()` test in CI                   | Token contrast: `text` on `base`/`emphasis` 4.5:1 (1.4.3), element `base` on the page 3:1 (1.4.11).       |
| `@pindakaasman/eslint-config/next`           | `jsx-a11y`'s recommended rules, as errors: alt text, labels, valid ARIA, no positive `tabIndex`, …        |
| `@storybook/addon-a11y` (`a11y.test: error`) | axe on every story - a violation fails the story's component test like any other assertion.               |

When one of those flags something, fix it - don't disable the rule or the
story's a11y check. A genuine false positive gets disabled for that one
line or story, with a comment saying why.

## Targets are at least `minTarget()`

Every interactive element - button, link in a list or menu, input,
checkbox, icon button - is at least `theme.minTarget()` in both directions:
24px for a mouse, 44px wherever there's a touch input. Enforce it in the
atom, so consumers can't forget it.

**Why:** a fingertip covers 8-10mm and a thumb on the move is imprecise; a
target the root scaling shrinks is hardest to hit exactly where precision
is worst. The value is keyed on the input device (`any-pointer: coarse`),
not the viewport width - an iPad with a trackpad and a touchscreen laptop
are both real.

It's a floor, not a size - text that grows with the user's settings still
grows the control:

```ts
// bad - fixed, and shrinks with the root
const IconButton = styled.button`
  height: 1.5rem;
  width: 1.5rem;
`;
```

```ts
// good
const IconButton = styled.button`
  min-block-size: max(${({ theme }) => theme.minTarget()}, 1.5rem);
  min-inline-size: max(${({ theme }) => theme.minTarget()}, 1.5rem);
`;
```

A control that must _look_ small (a 16px close icon in a dense row) keeps
its visual size and extends its hit area instead:

```ts
const Close = styled.button`
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: 50% auto auto 50%;
    translate: -50% -50%;
    block-size: ${({ theme }) => theme.minTarget()};
    inline-size: ${({ theme }) => theme.minTarget()};
  }
`;
```

Inline links inside a sentence are exempt (2.5.8's inline exception) - the
line height already decides their size.

## Focus is always visible

Every focusable element shows a focus ring on keyboard focus: an `outline`
in `color('focus')`, at least `borderWidth('base')` thick, with an offset.
Style `:focus-visible`, not `:focus`, so mouse clicks don't show it.

**Why:** a keyboard user with no visible focus has no idea where they are
(2.4.7). `outline` rather than `box-shadow` because forced-colors mode
removes shadows but keeps outlines.

```ts
// bad - removes focus for everyone, replaces it with nothing
const Button = styled.button`
  outline: none;
`;
```

```ts
// good
const Button = styled.button`
  &:focus-visible {
    outline: ${({ theme }) => theme.borderWidth('base')} solid
      ${({ theme }) => theme.color('focus')};
    outline-offset: 2px;
  }
`;
```

A focused element is never hidden behind a sticky header or footer
(2.4.11) - give scroll containers a `scroll-padding` matching the sticky
element.

## Colors come in their designed pairs

`auditTokens()` only checks the pairs the palette defines: a color's `text`
on its own `base` or `emphasis`, and a color's `base` as an element on the
page. Use them that way. Any other combination - `color('primary')` as text
color on `background`, `secondary.text` on `primary.base` - isn't checked,
so check it yourself against 4.5:1 for text, or pick a pair that is.

**Why:** a contrast guarantee is only as good as the pairs it covers.

- **Inputs need a visible boundary.** `formBackground` sits too close to
  `background` to carry one, so the audit exempts it - the border has to
  reach 3:1 against the background instead (1.4.11).
- **Never color alone** (1.4.1). An error, a required field, a selected tab
  or a link in body text also gets a second cue: text, an icon, an
  underline, a weight change.

## Text and layout scale with the user

- **Inputs are at least `fontSize('base')`.** Below 16px iOS Safari zooms
  the page on focus; `auditTokens()` guards the root, this guards the input
  itself.
- **Never disable zoom.** No `maximum-scale` or `user-scalable=no` in the
  viewport meta (1.4.4).
- **Reflow at 320px** (1.4.10). Content works at 320 CSS px wide without
  scrolling in two directions - no fixed px widths on content containers;
  `max-inline-size` instead of `inline-size`. Data tables, maps and code
  blocks may scroll on their own.
- **No fixed heights on text** (1.4.12). A container holding text grows
  with it - `min-block-size`, never `block-size` - so user stylesheets that
  raise line or letter spacing don't clip it.

## Structure and keyboard

- **Native elements first.** A `<button>` for actions, an `<a href>` for
  navigation, a `<label>` for every input. ARIA only where no native element
  exists - and then the complete pattern, keyboard handling included.
- **One `<h1>` per page, no skipped heading levels**, and landmarks
  (`<header>`, `<nav>`, `<main>`, `<footer>`) so screen-reader users can
  jump around.
- **`<html lang>`** is set in the root layout (3.1.1).
- **Everything works by keyboard,** in a tab order matching the visual
  order. Dialogs and menus trap focus while open, close on `Escape`, and
  return focus to whatever opened them.

## Forced colors and motion

- **Forced colors** (Windows High Contrast) replaces your colors with the
  user's. Anything that's only a background or shadow - a card edge, a
  toggle's state - disappears. Give it a `border` or `outline` (a
  `transparent` one is enough: forced colors paints it).
- **Reduced motion.** Until the design system has motion tokens (on its
  roadmap), wrap any animation or transition that moves things in
  `@media (prefers-reduced-motion: no-preference)`. Color and opacity
  fades can stay.
