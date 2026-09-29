---
name: setup
description: Install Vitest always, Storybook and Playwright only when the project actually has a UI or pages to exercise, and migrate misplaced tests
---

# testing:setup

Installs and wires up the tools named in [[conventions]] - Vitest always,
Storybook and Playwright only when the project actually has something for
them to exercise - and migrates existing tests that don't match the
convention.

Follows the repo-wide contract in the mise `CLAUDE.md`'s "Project setup"
section: plan, then apply only after approval; safe to re-run; handles a
blank starter, an existing project's test suite needing migration, and a
re-run that pulls in updated conventions, with the same skill.

## 1. Detect what applies

- **Vitest** - always. Every project gets unit tests eventually, and the
  `unit` project (no DOM) config is cheap to have in place from the start.
- **Storybook** - only if the project has component folders (React
  components anywhere - `atoms/molecules/organisms/templates` from
  [[folder-structure]], or any `.tsx` component if that structure isn't in
  place yet). Skip for a Node-only project (a CLI, a backend service, a
  library with no UI) - there's nothing to story.
- **Playwright** - only if the project is a web app with actual pages/routes
  to click through (a Next.js `app/` router, an `index.html` + dev server,
  etc.). Skip for a pure library or a Node-only backend - there's no browser
  flow to test end to end.

When it's genuinely unclear whether a project has a UI (e.g. a package that
exports both components and plain utilities), ask rather than guess.

## 2. Check current state and build the plan

For each tool that applies:

- **Vitest.** Check for `vitest` installed and a config defining a `unit`
  project running in Node (no `jsdom`/`happy-dom` environment). If missing
  or misconfigured (e.g. an existing Vitest config running everything in
  `jsdom`), propose installing it and/or adding the `unit` project alongside
  whatever other projects already exist - don't remove an existing
  DOM-based project outright without asking, in case something legitimately
  depends on it; flag it against [[conventions]]'s "if a test needs jsdom,
  it's not a unit test" instead.
- **Storybook.** Check for `@storybook/*` installed and a `.storybook/`
  config. If missing, propose installing (`npx storybook@latest init` is the
  standard bootstrap - use it rather than hand-assembling the config) and
  flag any component under `atoms/molecules/organisms/templates` missing its
  `index.stories.tsx`.
- **Playwright.** Check for `@playwright/test` installed and a config. If
  missing, propose installing and scaffolding an empty `e2e/` folder (no
  subfolders yet - those get added per-domain as real tasks are written, per
  [[conventions]]). Flag any existing e2e suite organized by page rather
  than by user task (e.g. `cosplan-page.spec.ts`) as a migration candidate,
  without inventing the reorganization yourself - proposing a new folder
  structure needs to know the actual user tasks involved, not just the
  current filenames.

## 3. Migrate existing tests

While scanning, flag (don't auto-move) any test that's in the wrong place
per [[conventions]]:

- A Vitest test using a DOM/renderer that belongs in Storybook instead, or
  vice versa.
- A unit test not colocated (`src/utils/<name>/index.test.ts`,
  `hooks/<hookName>/index.test.ts`) per [[folder-structure]].

## 4. Plan and apply

Present the combined plan (installs, config, scaffolds, flagged migrations)
grouped by tool, noting which tools were skipped and why (no UI → no
Storybook, no pages → no Playwright). Apply only after approval. Re-running
on a project already in compliance must produce an empty plan.
