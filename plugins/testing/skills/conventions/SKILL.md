---
name: conventions
description: Which tool tests what - Vitest for pure logic, Storybook for component behavior, Playwright for e2e user tasks
---

# Testing conventions

Three tools, each with a distinct job - don't reach for one to do another's.

## Vitest - pure-logic unit tests

Colocated next to what they test: `src/utils/<name>/index.test.ts`,
`hooks/<hookName>/index.test.ts`.

The `unit` project runs in Node, with **no DOM**. That's deliberate: it keeps
unit tests fast and forces testable logic out of hooks/components into pure,
exported functions (see [[folder-structure]] for the hook-extraction
pattern). If a test needs `jsdom` or a renderer, it's not a unit test - write
it as a Storybook interaction test instead, or extract the pure logic being
tested into its own helper.

## Storybook - component behavior

Prefer Storybook over a DOM-based Vitest test for anything that needs to
render a component and interact with it. Every component ships an
`index.stories.tsx` (see [[folder-structure]]), with inputs driven through
args/controls - that same story is what an interaction test drives.

## Playwright - e2e, organized by user task

Lives in `e2e/<domain>/<task-name>.spec.ts`, grouped into subfolders by
domain/feature as the number of tasks grows.

Organize around **user tasks** - a goal-oriented action the user completes
(e.g. "add a checklist to a cosplan") - not around pages.

**Why tasks, not pages:** a page-oriented e2e suite tends to duplicate setup
across "test the page" specs and drifts from what a user actually does on
it. A task-oriented spec follows one real flow end to end, which is both
what actually breaks in production and what's worth the cost of a full
browser test.

```
// bad - organized by page, drifts from what a user does on it
e2e/
  cosplan-page.spec.ts
  checklist-page.spec.ts
```

```
// good - organized by the task a user completes, may span multiple pages
e2e/
  cosplans/
    add-checklist-to-cosplan.spec.ts
    duplicate-cosplan.spec.ts
```
