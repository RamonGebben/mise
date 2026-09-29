---
name: setup
description: Audit existing components against component-patterns and migrate violations - no install, no scaffold
---

# react:setup

Audits existing components against [[component-patterns]] and migrates
violations. No install, no scaffold - the plugin's only skill is judgment,
not tooling, so its setup is purely a compliance pass.

Follows the repo-wide contract in the mise `CLAUDE.md`'s "Project setup"
section: plan, then apply only after approval; safe to re-run; handles a
blank starter (nothing to find, empty plan), an existing project needing
migration, and a re-run that catches drift since [[component-patterns]] was
last updated, with the same skill.

## 1. Find candidates

Scan every component under `atoms/`, `molecules/`, `organisms/`,
`templates/` (or wherever components currently live, if
`architecture:setup`'s [[folder-structure]] migration hasn't run yet - don't
require it as a precondition, but note in the plan if it hasn't, since tier
folders make this scan easier).

## 2. Check each against component-patterns

- **Loading-before-empty, early return.** A component branching on
  `isLoading`/`isPending`/`isFetching` alongside an empty-data check, where
  either (a) the empty check isn't guarded by the loading check, or (b) the
  branching is a ternary chain rather than guard-clause early returns.
  Propose the early-return rewrite, loading checked first, matching the
  "good" shape in [[component-patterns]].
- **Render-body helpers instead of subcomponents.** A local `renderX()`
  function or a `const jsxVar = (...)` defined inside a component body and
  used in more than one branch, or chrome (header/wrapper) duplicated
  literally across branches. Propose extracting it to a real subcomponent in
  that component's `components/` folder with explicit props, per
  [[component-patterns]] - and reuse it in each `return`.

## 3. Plan and apply

For each violation found, show the current code and the proposed rewrite.
A borderline case (e.g. a one-line ternary that's arguably fine, or a
`renderX()` used in exactly one branch with no real duplication) is not
automatically flagged - only file it when it clearly matches one of the two
bad examples in [[component-patterns]]. Apply only after approval, one
component at a time or in bulk as approved. Re-running on a project already
in compliance must produce an empty plan.
