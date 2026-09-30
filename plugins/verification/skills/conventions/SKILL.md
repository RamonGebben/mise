---
name: conventions
description: What to run to verify a change and when - related tests while developing, the pre-commit gate before every commit, e2e/Storybook when a change touches them, and how to handle a failing check
---

# Verification conventions

Broken code never gets committed. The pre-commit hook (installed by
[[setup]]) enforces most of that mechanically. This skill covers the parts a
hook can't decide: what to run while working, when the slower browser tests
are worth running, and what to do when something fails.

The commands below use the standard script names [[setup]] adds to every
project (`format`, `lint`, `typecheck`, `test`, `test:e2e`,
`test:storybook`). Run them through the project's package manager.

## While developing - fast feedback on what changed

After each meaningful edit, run the checks scoped to what you touched:

- `vitest related --run <changed files>` - only the tests that import the
  changed code.
- `typecheck` - TypeScript has no "related" mode worth trusting; a change
  in one file breaks types in another.

**Why related, not the full suite:** the full suite is the commit gate's
job. Running it after every edit slows the loop down without catching
anything the gate won't.

## Before every commit - the full gate

The pre-commit hook runs, in order:

1. Prettier `--write` on every staged file (all file types it can parse).
2. ESLint `--fix` on staged JS/TS files.
3. `typecheck` on the whole project.
4. `test` - the **full** Vitest suite.

Unstaged changes and untracked files are hidden while it runs, so it checks
exactly what the commit will contain. Stage everything the change needs -
a new file you forgot to `git add` fails the hook even though it's on disk.

Don't run these by hand first just to "check" - commit, and let the hook do
it. If the hook fails, the commit didn't happen: fix the cause and commit
again.

**Never bypass the hook** (`git commit --no-verify`, `HUSKY=0`, deleting
`.husky/`). A bypassed hook is exactly how broken code gets committed.

## When relevant - browser tests

Playwright and Storybook interaction tests need a browser (and for e2e, a
running app), so they're too slow for the commit hook. Run them yourself
when the change warrants it:

- **Playwright (`test:e2e`)** - when the change touches a route, a page, a
  form, navigation, or anything else on a user task's path. Run the specs
  for the affected tasks (`e2e/<domain>/...`, see the `testing` plugin's
  conventions), not the whole suite.
- **Storybook (`test:storybook`)** - when the change touches a component or
  something it renders (props, styles, a hook it uses). Run the affected
  components' stories.

```
// bad - changed the checkout form's validation, committed on green unit tests
git commit -m "Tighten checkout validation"

// good - the change is on a user task's path, so its e2e spec runs first
test:e2e e2e/checkout/pay-with-saved-card.spec.ts
git commit -m "Tighten checkout validation"
```

A pure-logic change with no UI surface (a util, a reducer, a server-only
module) doesn't need either.

## When a check fails

First decide whether **your change** caused it. Check on a clean copy of
the base (`git stash`, or a throwaway worktree of `HEAD`): if it fails
there too, it's pre-existing.

### Caused by your change

Fix it. Don't commit around it, don't skip or `.only` the test, don't add
an `eslint-disable` or `@ts-expect-error` to get past the gate unless
that's genuinely the right fix - and then say why in the commit message.

### Pre-existing failure

It still blocks the commit, but it isn't part of the current task - don't
quietly fold a fix into unrelated work. Instead:

1. **Stop and tell the user** what fails, and that it fails on the base
   too.
2. **Offer to fix it in a separate worktree**, on its own branch off the
   base branch. Don't start without a yes.
3. In the worktree, fix it and commit - the hook applies there too.
4. **Get it reviewed:** run `/code-review` on the fix, then show the user
   the diff and the review result. Merge only once they approve.
5. **Merge locally** into the base branch - no PR for a small fix like
   this. Open a PR instead only if the fix turned out substantial (touches
   many files, changes behavior, needs discussion).
6. Bring the fix into the original work (rebase or merge the base branch)
   and continue where you left off.

**Why a separate worktree:** it keeps the fix reviewable on its own and
keeps the original change's diff about one thing, without stashing or
losing in-progress work.
