---
name: setup
description: Install husky + lint-staged as the pre-commit gate (format, lint, typecheck, full test suite) and add the standard verification scripts
---

# verification:setup

Installs the mechanical half of [[conventions]]: a set of standard script
names every project shares, and a pre-commit hook that runs them so broken
code can't be committed.

Follows the repo-wide contract in the mise `CLAUDE.md`'s "Project setup"
section: plan, then apply only after approval; safe to re-run on a project
that already complies.

Runs **after** the `typescript` and `testing` setups - it only wires up
tools those already installed, it never installs Prettier, ESLint,
TypeScript, Vitest, Storybook or Playwright itself. If one of them is
missing, leave its script out and say so in the plan.

## 1. Detect package manager and tools

- Package manager from the lockfile: `pnpm-lock.yaml` → pnpm, `yarn.lock` →
  yarn, otherwise npm. Use it for installs and inside the hook.
- Which tools are installed (from `package.json`): `prettier`, `eslint`,
  `typescript`, `vitest`, `@playwright/test`, `@storybook/*`.
- Monorepo or not (`pnpm-workspace.yaml`, or `workspaces` in
  `package.json`).

## 2. Scripts

Every project gets the same names, so [[conventions]] (and anyone else) can
rely on them without reading `package.json` first:

| Script           | Command                        | When                        |
| ---------------- | ------------------------------ | --------------------------- |
| `format`         | `prettier --check .`           | Prettier installed          |
| `format:write`   | `prettier --write .`           | Prettier installed          |
| `lint`           | `eslint .`                     | ESLint installed            |
| `typecheck`      | `tsc --noEmit`                 | TypeScript installed        |
| `test`           | `vitest run`                   | Vitest installed            |
| `test:e2e`       | `playwright test`              | Playwright installed        |
| `test:storybook` | the runner Storybook set up \* | Storybook tests configured  |
| `prepare`        | `husky`                        | always (installs the hooks) |

\* `vitest --project=storybook --run` with Storybook's Vitest addon, or
`test-storybook` with the older test runner - use whichever the Storybook
install actually configured.

In a monorepo, the root scripts fan out to packages
(`pnpm -r --if-present run typecheck`, etc.) and each package with its own
`tsconfig.json` gets its own `typecheck`; `format` and `lint` stay at the
root, since their configs do too.

A script that exists under the standard name with a different command is
**not** overwritten silently - put the difference in the plan and ask. A
project-specific script under another name is left alone.

## 3. Prettier covers every file type

Prettier formats every file it can parse, not just JS/TS. If
`.prettierignore` excludes whole file types (`*.json`, `*.yml`, `*.md`),
propose removing those lines. Keep ignores for generated files
(`dist/`, `CHANGELOG.md`, lockfiles - Prettier skips lockfiles by default).

The first run of `format:write` after this will likely reformat files that
were previously ignored - make that a **separate commit** in the plan
("Format all files with Prettier"), so it doesn't bury real changes.

## 4. Pre-commit hook

Install `husky` and `lint-staged` as devDependencies, then:

`lint-staged` config in `package.json`:

```json
{
  "lint-staged": {
    "*": "prettier --write --ignore-unknown",
    "*.{js,jsx,ts,tsx,mjs,cjs}": "eslint --fix"
  }
}
```

`.husky/pre-commit` (using the detected package manager):

```sh
pnpm exec lint-staged
pnpm run typecheck
pnpm run test
```

Leave out the `typecheck` / `test` line when that script doesn't exist.
Playwright and Storybook tests stay **out** of the hook - see
[[conventions]] for when they run instead.

An existing hook setup (a different `.husky/pre-commit`, `simple-git-hooks`,
`lefthook`, a raw `.git/hooks/pre-commit`) goes in the plan as a migration
to this one, never silently replaced.

## 5. CI

If the project has a CI workflow, check it runs `typecheck` alongside
`lint`, `format` and `test`, and propose adding the step if it's missing.
Don't create a CI workflow from scratch here.

## 6. Plan and apply

Present the plan (installs, scripts added or changed, `.prettierignore`
edits, hook files, CI step, the separate formatting commit) and apply only
after approval. Then run the hook once (`pnpm exec lint-staged` isn't
enough - run the full `.husky/pre-commit` sequence) so any existing
failures surface now; report them per [[conventions]]'s "pre-existing
failure" steps rather than fixing them as part of setup.

Re-running on a project that already complies must produce an empty plan.
