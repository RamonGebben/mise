---
name: setup
description: Wire up jsx-a11y, Storybook's a11y addon and the design-system token audit, and audit existing code against every accessibility convention
---

# accessibility:setup

Wires up the checks named in [[conventions]] - lint, axe in Storybook, the
token contrast test - and audits existing code against every rule in it.

Follows the repo-wide contract in the mise `CLAUDE.md`'s "Project setup"
section: plan, then apply only after approval; safe to re-run; handles a
blank starter, an existing project needing migration, and a re-run that
pulls in updated conventions, with the same skill.

Only applies when the project renders UI (a `react` dependency, or any
HTML it serves). If it doesn't, report that and stop. Each step below also
applies only when the tool it builds on is there - Storybook from
`testing:setup`, the theme from `architecture:setup` - so run this after
both.

## 1. Lint

- **Uses `@pindakaasman/eslint-config/next`:** check it's at a version
  that includes `jsx-a11y`'s recommended rules (`^0.4`). Below that,
  propose bumping it.
- **React without the `/next` export** (the plain base config, or a config
  of its own): propose adding `eslint-plugin-jsx-a11y`'s
  `flatConfigs.recommended` to the project's `eslint.config.mjs`.
- **Existing violations:** run the linter and list every `jsx-a11y` error.
  Fix the mechanical ones in the plan (a missing `alt` on an image that's
  clearly decorative becomes `alt=""`, a `<div onClick>` acting as a button
  becomes a `<button>`). Anything needing context - what an image's `alt`
  should say, what a control's label is - is a case needing a human call.
  Never propose an `eslint-disable` to get to zero.

## 2. Storybook

- Check for `@storybook/addon-a11y` installed and listed in
  `.storybook/main`'s `addons`. If missing, propose `npx storybook add
@storybook/addon-a11y` rather than hand-editing the config.
- Check `.storybook/preview` sets `parameters.a11y.test` to `'error'`, so
  an axe violation fails the story's component test instead of only
  showing in the panel. If not, propose it.
- A story that turns the check off (`a11y: { disable: true }`, `test:
'off'` or `'todo'`) without a comment saying why → flag it.
- **Existing violations:** run the Storybook component tests and list each
  failing story with its axe rule, and fix what's mechanical (missing
  labels, invalid ARIA attributes) in the plan. Contrast failures in a
  component that uses the theme's colors point at a pair [[conventions]]'s
  "Colors come in their designed pairs" rules out - fix the pairing, not
  the token.

## 3. Token audit

When the project has a `src/theme/index.ts` constructing a `DesignSystem`:

- Check for a colocated `src/theme/index.test.ts` running the audit. If
  missing, propose it:

  ```ts
  // src/theme/index.test.ts
  import { auditTokens } from '@pindakaasman/design-system';
  import { describe, expect, it } from 'vitest';
  import theme from '.';

  describe('theme', () => {
    it('meets WCAG AA contrast and the scale rules', () => {
      expect(auditTokens(theme.getTokens())).toEqual([]);
    });
  });
  ```

  `@pindakaasman/design-system` below `^4` has no `auditTokens` -
  `architecture:setup`'s migration to `^4` comes first.

- **Existing findings:** run the audit and list every finding. For a
  contrast failure, propose the nearest shade of the same hue that passes
  (darken or lighten until it reaches the ratio). Brand colors are a case
  needing a human call - the dev may prefer changing the pairing over the
  color. Don't write the test before the tokens pass, or the plan leaves
  the build red.

## 4. Code audit

While scanning components, flag every violation of [[conventions]] with
the proposed fix. Apply only what's approved.

- **Targets:** an interactive atom (button, icon button, input, checkbox,
  menu or list link) without a `minTarget()` floor on both axes → propose
  `min-block-size`/`min-inline-size: max(theme.minTarget(), …)`. A fixed
  `height`/`width` on one → propose the floor instead. A visually small
  one → propose the `::before` hit area.
- **Focus:** `outline: none`/`outline: 0` without a `:focus-visible`
  replacement → propose the ring from [[conventions]]. A focus style done
  with `box-shadow` only → propose an `outline`. Focus colors not from
  `color('focus')` → propose the accessor.
- **Colors:** text colored with a hue's `base` on `background`, or any pair
  the palette doesn't define → check its contrast, and list it if it fails.
  Input borders under 3:1 against `background` → propose a stronger color.
  Status shown by color alone (a red border as the only error cue) → a
  case needing a human call: the second cue's wording is the dev's.
- **Scaling:** inputs with a font size below `fontSize('base')`;
  `maximum-scale`/`user-scalable=no` in the viewport meta; fixed px
  `width`s on content containers wider than 320px; fixed `height`s on
  containers holding text → propose the fix from [[conventions]].
- **Structure:** a missing `<html lang>`; pages with no or several `<h1>`s
  or skipped heading levels; no `<main>` landmark → propose the fix. A
  dialog or menu without focus trapping, `Escape` and focus return → flag
  it; the fix depends on the component.
- **Forced colors and motion:** a component whose edge or state is only a
  background or shadow → propose a `transparent` border or outline.
  Moving animations or transitions without a `prefers-reduced-motion:
no-preference` guard → propose the guard.

## 5. Plan and apply

Present one plan grouped by step (lint, Storybook, token audit, code
audit), noting which steps were skipped and why (no Storybook, no theme).
Apply only after approval. Re-running on a project already in compliance
must produce an empty plan.
