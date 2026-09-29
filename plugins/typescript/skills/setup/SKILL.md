---
name: setup
description: Install and wire up @pindakaasman/tsconfig, @pindakaasman/eslint-config and @pindakaasman/prettier-config in the current project
---

# typescript:setup

Sets up the mechanical half of the `typescript` plugin's conventions: the
shared TypeScript, ESLint and Prettier config packages that
[[conventions]]'s lint-enforced rules (`Array<T>`, no `any`, no `enum`) ride
on. Nothing here is a judgment call - it's the install/usage steps from each
package's own README, applied to whatever's already in the project.

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

Present the combined plan (all three, or just what's missing/migrating) and
apply only after approval.

## 4. Apply

Run the installs, then write the files exactly as planned. Re-running this
skill afterward must detect everything as already wired up and produce an
empty plan.
