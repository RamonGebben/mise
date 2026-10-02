---
name: setup
description: Scaffold and migrate the current project onto the atomic folder structure and the design-system theme, and audit existing code against the functional-style, state, module-boundary and data-flow conventions
---

# architecture:setup

Applies [[folder-structure]], [[design-system]] and [[styling]] to the
current project - scaffolding what's missing and migrating what's misplaced.
[[functional-style]], [[state-management]], [[module-boundaries]] and
[[data-flow]] have no setup action of their own - nothing to install for
them specifically - but existing code is audited against every rule in them
in step 3.

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
- **Styled-component definitions inside a component file** (including files
  this setup itself writes while migrating, e.g. a Tailwind page rewritten
  to styled-components) - every `styled.*`/`styled(...)` const in a
  component's `index.tsx` other than its own export gets split into its own
  folder, per [[folder-structure]]'s "Styled components are components":
  generic primitives (a `Button` with variants, a `Code` chip, a link) go to
  the matching atomic tier, owner-specific pieces nest under the owner's
  `components/` - grouped into a sub-component with its own `components/`
  where they form a unit, not a flat list. Each new folder's `index.tsx` is
  the styled export itself, plus an `index.stories.tsx`. If one genuinely
  can't be split, move it below the main component and list it in the plan
  as still open.
- A component-specific hook found outside a `hooks/<hookName>/index.ts`
  shape (a loose `useThing.ts`) gets the same folder migration, per
  [[folder-structure]]'s hook-extraction section - and flag (don't
  auto-write) a missing colocated `index.test.ts`, since generating the test
  body isn't this skill's job.
- A util/helper/formatter living as a loose `<name>.ts` (in `src/utils/` or
  elsewhere, e.g. a `src/lib/` or `src/helpers/`) moves to
  `src/utils/<name>/index.ts`, with import fixups, per [[folder-structure]].
- An app-level provider/manager (wires a cross-cutting concern into the
  tree, renders no feature UI) goes to `src/providers/<Name>/index.tsx`, not
  into an atomic tier - and gets no story. Conversely, presentational UI
  sitting in `providers/` moves into the right tier.

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

## 3. Code conventions - audit

[[functional-style]], [[state-management]], [[module-boundaries]] and
[[data-flow]] have no install or scaffold of their own. While scanning
existing code for steps 1-2, also flag violations of each rule below for the
plan, with the proposed fix. Apply only what's approved.

**[[functional-style]]** (arrow functions are lint-enforced and migrated by
`typescript:setup` - not repeated here):

- An imperative `for`/`while` loop building up a result → propose the
  `map`/`filter`/`reduce`/`find` equivalent. Leave loops that genuinely need
  early `break` over a large or lazy sequence, or `await` in sequence, and
  say why in the plan rather than forcing a rewrite.
- Nested `if`/`else` pyramids → propose guard-clause early returns.
- A function that mutates its input object, or does several unrelated jobs
  in one body → propose small composed functions returning a new object.
- A hand-rolled helper that duplicates a `ramda` function (`path`, `pick`,
  `omit`, `groupBy`, `pipe`, ...) → propose the `ramda` call, adding `ramda`
  as a dependency only as part of such a finding.

**[[state-management]]:**

- Server data copied into local state ("never duplicate server state") -
  propose reading the query directly instead.
- An atom/store used by only one component tree but living in a global
  folder → propose moving it into that component's `state/` folder. One
  genuinely shared app-wide but living inside a component → propose
  `src/store/` (or `src/state/` for Jotai).
- Jotai vs Zustand is explicitly a judgment call, not a rule - don't flag an
  existing Zustand store just for being Zustand.

**[[module-boundaries]]:**

- A component reaching into another's private `components/`, `hooks/`, or
  `state/` subfolder, or an atomic tier importing upward - propose the fix
  (import the public surface instead, or lift the shared piece).
- In a monorepo, a deep import into another workspace package's internals
  instead of its `index.ts` exports - propose exporting what's needed from
  that package's `index.ts`.

**[[data-flow]]:**

- A component relying on Suspense/an error boundary for loading/error state
  instead of explicit props - flag it; don't invent the prop wiring without
  seeing the actual data source, since threading `isLoading`/`error` through
  correctly needs to trace back to wherever the fetch happens.
- Client-server reads or writes going through Server Actions or REST route
  handlers alongside tRPC → propose moving them to tRPC procedures. If the
  project has no tRPC at all, don't propose introducing it as a routine
  finding - ask first, the same way a wholesale styling swap is asked about
  in step 2. Route handlers serving something other than the app's own
  client (webhooks, OAuth callbacks, public APIs) aren't violations.
- A Context whose value changes over time (holds state, a setter, or is
  backed by `useState`/`useReducer` in its provider) → propose moving that
  state into Jotai (or Zustand, per [[state-management]]), keeping Context
  only for values set once at the root.

If Jotai is genuinely missing and the audit turns up state that should move
out of `useState`/Context into it, propose installing `jotai` as part of
that specific fix - not as a standalone always-on install independent of an
actual finding.

## 4. Plan and apply

Present one combined plan covering steps 1-3 (structure moves,
design-system scaffold/migration, flagged violations with proposed fixes).
Apply only after approval. Re-running on a project already in compliance
must produce an empty plan.
