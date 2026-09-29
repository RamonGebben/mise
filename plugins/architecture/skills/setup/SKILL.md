---
name: setup
description: Scaffold and migrate the current project onto the atomic folder structure and the design-system theme, and audit state/module/data-flow conventions
---

# architecture:setup

Applies [[folder-structure]], [[design-system]] and [[styling]] to the
current project - scaffolding what's missing and migrating what's misplaced.
[[state-management]], [[module-boundaries]] and [[data-flow]] stay judgment
calls with no setup action of their own: nothing to install for them
specifically, but existing code that violates them is flagged as part of the
audit in step 3.

Follows the repo-wide contract in the mise `CLAUDE.md`'s "Project setup"
section: plan, then apply only after approval; safe to re-run; handles a
blank starter, an existing project needing migration, and a re-run that
pulls in updated conventions, with the same skill.

Only applies when the project is React-based (a `react` dependency, or a
Next.js project). If it isn't, report that and stop - everything this skill
scaffolds assumes atoms/molecules/organisms and (for the app/templates
split) Next's App Router.

## 1. Folder structure

- Check `src/` for `atoms/`, `molecules/`, `organisms/`, `templates/`,
  `app/`, `providers/`, `theme/`, `utils/`. Create only the ones actual
  content will move into - not all eight speculatively empty.
- **Migrate existing components into place.** Scan for components living
  outside this structure (a flat `src/components/`, ad-hoc folders,
  components mixed into route folders). For each, propose:
  - **Which tier.** A component that renders only from its own props and
    imports no other project component is an atom. One that composes only
    atoms is a molecule. One that composes molecules/atoms is an organism.
    Page-level layout composing organisms is a template. A component that
    fetches its own data doesn't fit any tier as-is - per the app/templates
    split in [[folder-structure]], propose splitting it into a page in
    `app/` that fetches and a template that receives the data as props.
    When a component's tier is genuinely ambiguous, ask rather than guess.
  - **Folder shape.** Move to `index.tsx` (+ `index.stories.tsx` if
    missing, `components/` and `hooks/` for anything private to it), per
    [[folder-structure]]'s component folder shape.
  - **Import fixups.** Update every import referencing the old location.
- A component-specific hook found outside a `hooks/<hookName>/index.ts`
  shape (a loose `useThing.ts`) gets the same folder migration, per
  [[folder-structure]]'s hook-extraction section - and flag (don't
  auto-write) a missing colocated `index.test.ts`, since generating the test
  body isn't this skill's job.

## 2. Design system

- Check for `@pindakaasman/design-system` and `styled-components` in
  dependencies, and a `src/theme/index.ts` constructing a `DesignSystem`
  instance.
- **Not present, and no existing theme of any kind:** propose installing
  both packages and scaffolding `src/theme/index.ts` from
  [[design-system]]'s template
  (`plugins/architecture/skills/design-system/templates/theme/index.ts`),
  `src/providers/ThemeProvider/index.tsx`, and
  `src/providers/StyledComponentsRegistry/index.tsx` ([[styling]]), wired at
  the app root. Token values stay the template's placeholders - flag them as
  needing real values, don't invent brand colors.
- **Not present, but the project already has a theme of some kind** (a
  Tailwind config, a plain styled-components `DefaultTheme`, CSS variables,
  etc.): don't silently replace it - present the existing theme's shape
  against `SystemTokens` and propose the migration as a plan (map the
  existing values into the tokens object, using the project's real values
  rather than the template's placeholders), applying only once approved. If
  the existing approach isn't styled-components at all, ask before proposing
  a wholesale swap - that's a bigger call than this skill should make
  unprompted.
- **Already present and wired correctly:** nothing to do.
- **Hardcoded style values.** While scanning components for the folder
  migration in step 1, also collect hardcoded colors/shadows/gradients/
  spacing found in `styled-components` template literals (violations of
  [[styling]] and [[design-system]]'s "always through the theme" rule). For
  each, propose the closest matching token accessor call as part of the
  plan - don't guess silently when a value doesn't cleanly match an existing
  token; list it as a case needing a human call instead of forcing a
  mapping.

## 3. state-management, module-boundaries, data-flow - audit only

These three have no install or scaffold of their own - [[state-management]]
only names a library choice, [[module-boundaries]] and [[data-flow]] are
pure conventions. While scanning existing code for steps 1-2, also flag
violations for the plan, without applying automatically:

- Server data copied into local state ([[state-management]]'s "never
  duplicate server state") - propose reading the query directly instead.
- A component reaching into another's private `components/`, `hooks/`, or
  `state/` subfolder, or an atomic tier importing upward
  ([[module-boundaries]]) - propose the fix (import the public surface
  instead, or lift the shared piece).
- A component relying on Suspense/an error boundary for loading/error state
  instead of explicit props ([[data-flow]]) - flag it; don't invent the prop
  wiring without seeing the actual data source, since threading
  `isLoading`/`error` through correctly needs to trace back to wherever the
  fetch happens.

If Jotai is genuinely missing and the audit turns up state that should move
out of `useState`/Context into it, propose installing `jotai` as part of
that specific fix - not as a standalone always-on install independent of an
actual finding.

## 4. Plan and apply

Present one combined plan covering steps 1-3 (structure moves,
design-system scaffold/migration, flagged violations with proposed fixes).
Apply only after approval. Re-running on a project already in compliance
must produce an empty plan.
