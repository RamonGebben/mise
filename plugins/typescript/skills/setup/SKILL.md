---
name: setup
description: Install and wire up @pindakaasman/tsconfig, @pindakaasman/eslint-config and @pindakaasman/prettier-config in the current project, and migrate existing code onto the TypeScript conventions
---

# typescript:setup

Sets up the shared TypeScript, ESLint and Prettier config packages that
[[conventions]]'s lint-enforced rules (`Array<T>`, no `any`, no `enum`) ride
on - the install/usage steps from each package's own README, applied to
whatever's already in the project - then migrates existing code onto every
rule in [[conventions]], lint-enforced or not.

Follows the repo-wide contract in the mise `CLAUDE.md`'s "Project setup"
section: plan, then apply only after approval; safe to re-run on a project
that already complies.

## 1. Detect project flavor

Read `package.json`. If `next` is a dependency (or devDependency), this is a
Next.js project - use the `nextjs.json` tsconfig and the `/next` ESLint
export. Otherwise, use the `app.json` tsconfig and the base ESLint export,
**unless** the project is a package meant to be compiled directly by `tsc`
(no bundler - e.g. has a `build` script that runs `tsc` and emits to
`dist/`), in which case use `library.json` instead. When it's ambiguous, ask
rather than guess - this determines which tsconfig file gets extended.

## 2. Check current state

For each of the three packages, check whether it's already installed and
wired up:

- **TypeScript** - `typescript` and `@pindakaasman/tsconfig` in
  `devDependencies`; `tsconfig.json` exists and its `"extends"` points at
  `@pindakaasman/tsconfig/<flavor>.json`.
- **ESLint** - `eslint` and `@pindakaasman/eslint-config` in
  `devDependencies` (plus `eslint-config-next` if using `/next`); an
  `eslint.config.mjs` (or `.js`) exists and imports from
  `@pindakaasman/eslint-config` (base or `/next`).
- **Prettier** - `prettier` and `@pindakaasman/prettier-config` in
  `devDependencies`; either `package.json`'s `"prettier"` field or a
  `prettier.config.js` points at `@pindakaasman/prettier-config`.

A package already wired up exactly as the README describes is left alone -
that plugin's part of the plan is empty. A tsconfig/eslint/prettier config
that exists but points somewhere else (e.g. `create-next-app`'s own
generated `eslint.config.mjs`, or an unrelated tsconfig) is **not**
overwritten silently - it goes in the plan as a migration (swap the
dependency, rewrite the config to extend the mise package), same as a
from-scratch install, so the user approves the diff either way.

## 3. Build the plan

For each of the three that isn't already wired up, following each package's
own README exactly (`configs/typescript/README.md`,
`configs/eslint/README.md`, `configs/prettier/README.md` in the mise repo -
read them fresh rather than relying on a paraphrase here, in case they've
changed):

- The `npm install --save-dev ...` command (or the project's actual package
  manager - detect from the lockfile present: `pnpm-lock.yaml` →
  `pnpm add -D`, `yarn.lock` → `yarn add -D`, otherwise `npm install
--save-dev`).
- The exact file content for `tsconfig.json` / `eslint.config.mjs` /
  the prettier field, adapted to the detected flavor. Preserve anything
  project-specific already in these files (e.g. `paths`, `include`,
  `globalIgnores` entries, an overridden Prettier rule) rather than
  clobbering it - only change what points at the old/missing config.

## 4. Migrate existing code

Wiring up the configs is only half of it - existing code has to comply too.
Violations the newly adopted ESLint config reports are part of this
migration, not "pre-existing failures" in the `verification` plugin's sense: the
code wasn't failing anything before the config arrived.

- **Lint-enforced rules.** If `@pindakaasman/eslint-config` is already
  wired up, run `eslint .` and use its output. If not, scan the source for
  what the config will report once installed - the stated rules in
  `configs/eslint/rules.js` (read it fresh; it's the list, not this skill)
  plus anything obvious from `eslint:recommended`/`typescript-eslint`'s
  recommended set. Auto-fixable violations (e.g. `Array<T>`, arrow
  callbacks) go in the plan as one `eslint --fix` pass. The rest each get a
  proposed rewrite: `any` narrowed from `unknown` at the boundary, `enum`
  replaced by a union of string literals (and its usages updated),
  `function` declarations rewritten as arrow `const`s - except a function
  that genuinely needs its own `this`, which stays a `function` expression.
  When the right narrowing for an `any` isn't clear from the surrounding
  code, list it as needing a human call rather than guessing a type.
- **Judgment rules** from [[conventions]] that no lint rule checks:
  - A `type` alias declaring a plain object shape → propose an `interface`.
    Leave unions, tuples, mapped/utility types and intersections as `type`.
  - A const config object with a type annotation whose literal values are
    read downstream (e.g. a tokens object, a router map) → propose
    `satisfies` instead. Don't flag annotations where nothing depends on the
    narrowed type.

## 5. Apply

Present the combined plan (config installs/migrations from step 3, code
migrations from step 4) and apply only after approval. Run the installs,
write the config files, then apply the code migrations. Afterward, run
`eslint .` and `tsc --noEmit` (or `tsc -b --noEmit` for a solution-style
root tsconfig): anything still failing goes back to the user as a list,
not silently left for the pre-commit hook to trip over.

Re-running this skill afterward must detect everything as already wired up
and compliant, and produce an empty plan.
