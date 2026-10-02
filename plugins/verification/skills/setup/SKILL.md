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
| `typecheck`      | `tsc --noEmit` \*\*            | TypeScript installed        |
| `test`           | `vitest run`                   | Vitest installed            |
| `test:e2e`       | `playwright test`              | Playwright installed        |
| `test:storybook` | the runner Storybook set up \* | Storybook tests configured  |
| `prepare`        | `husky`                        | always (installs the hooks) |

\* `vitest --project=storybook --run` with Storybook's Vitest addon, or
`test-storybook` with the older test runner - use whichever the Storybook
install actually configured.

\*\* If the root `tsconfig.json` is a solution file (`"files": []` plus
`references`, as Vite's templates set up), plain `tsc --noEmit` checks
nothing and always passes - use `tsc -b --noEmit` instead.

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
(`dist/`, `CHANGELOG.md`), and make sure `pnpm-lock.yaml` is ignored -
Prettier does **not** skip lockfiles, and reformatting the one pnpm
writes fails `format` and churns on every install.

The first run of `format:write` after this will likely reformat files that
were previously ignored - make that a **separate commit** in the plan
("Format all files with Prettier"), so it doesn't bury real changes.

## 4. Pre-commit hook

Install `husky` and `lint-staged` as devDependencies, then:

`lint-staged.config.mjs` (a JS file, not a `package.json` key - the
whole-project checks need function tasks, which JSON can't express). The
example uses pnpm; swap `pnpm run` for the detected package manager's
equivalent (`npm run`, `yarn`):

```js
const config = {
  '*': 'prettier --write --ignore-unknown',
  '*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}': 'eslint --fix',
  // Functions, so lint-staged doesn't append the staged file names -
  // these check the whole project.
  '**': () => ['pnpm run typecheck', 'pnpm run test'],
};

export default config;
```

The object is assigned to a variable before it's exported, not exported
anonymously: `eslint-config-next` (pulled in by the `/next` config) warns on
an anonymous default export (`import/no-anonymous-default-export`), and a
fresh setup must lint clean.

`.husky/pre-commit` (using the detected package manager):

```sh
pnpm exec lint-staged --concurrent false --hide-all
```

Both flags matter:

- `--hide-all` makes every check see exactly what gets committed. It hides
  unstaged changes **and** untracked files while the tasks run, and
  restores them afterwards, pass or fail. That's also why `typecheck` and
  `test` run inside lint-staged instead of as extra hook lines after it: a
  check run after lint-staged sees the whole working tree, so a staged file
  that uses something only an unstaged or untracked file adds would pass,
  and the commit would be broken on its own.
- `--concurrent false` runs the tasks in order. A JS/TS file matches both
  the Prettier and ESLint globs, and in parallel one tool's write can
  clobber the other's; `typecheck` and `test` must also run after the fixes
  are applied.

Leave `typecheck` / `test` out of the `**` task when that script doesn't
exist. An existing `lint-staged` key in `package.json` or other config file
moves into `lint-staged.config.mjs` (in the plan).

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
after approval. Then run `format`, `lint`, `typecheck` and `test` once
(the hook itself does nothing with no files staged) so any existing
failures surface now; report them per [[conventions]]'s "pre-existing
failure" steps rather than fixing them as part of setup.

Lint or type errors that only exist because the project just adopted mise's
configs aren't pre-existing failures - they're migration, and
`typescript:setup` (which runs first) already planned and applied their
fixes. If any still show up here, that step missed them: report them as
unfinished migration and hand them back to `typescript:setup`, not to the
pre-existing failure flow.

Re-running on a project that already complies must produce an empty plan.
