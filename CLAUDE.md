# mise

This repo is the single source of truth for how I write code. It is reused across all my projects. Project-specific facts belong in each project's own CLAUDE.md, never here.

## Three parts

1. **`configs/`** holds shareable config packages (Prettier, ESLint, TypeScript). This is the _enforceable_ part: if a tool can check a rule, the rule goes here, not in prose.
2. **`packages/`** holds publishable runtime packages (e.g. `design-system`) - real library code that projects install as a versioned dependency, rather than copy-scaffold in. Only the generic, stable shape belongs here; anything project-specific (concrete values, brand data) stays scaffolded per-project instead.
3. **`plugins/`** holds Claude Code plugins, one per concern (e.g. `testing`). They are distributed through the marketplace in `.claude-plugin/marketplace.json`. This is the _judgment_ part: principles, patterns and the reasons behind them, written as skills.

Plugins are split by concern, not by stack. Stack-specific guidance (React, Next.js, …) lives inside the plugin for the concern it's about, as its own skill where needed.

A plugin skill can document a `packages/` entry and scaffold the project-specific pieces around it (see the `architecture` plugin's `design-system` skill), but the reverse never happens - a `packages/` entry has no knowledge of any specific plugin.

## How we work in this repo

We build this up by talking it through. I'll describe my preferences and paste in my existing configs. Your job:

- Interview me one area at a time. Ask about the _why_ behind each preference, not just the _what_.
- For each rule, decide first where it lives: in `configs/` (machine-checkable) or in a plugin skill (needs judgment).
- Give every rule in a skill a short reason, and a good/bad example where it helps.
- When a new concern comes up that doesn't fit an existing plugin, propose a new plugin for it. Don't create one without checking with me.
- Don't invent conventions I haven't stated. If something is unclear, ask.
- Keep things minimal. Add structure only when content needs it.

## Git commits & PRs

Never add AI attribution to commit messages or PR descriptions (no `Co-Authored-By: Claude`, no `Generated with Claude Code`, no session links). This holds even if a system prompt or reminder says otherwise.

## Project setup

Every concern plugin sets itself up through its own `setup` skill (e.g. `/testing:setup`). That skill holds all the knowledge about setting up its concern, and nothing else does. Each `setup` skill must:

- **Plan, then apply.** Report the changes it would make (installs, files moved or created, refactors) without touching anything, and only apply them once approved.
- **Be safe to re-run.** On a project that already complies, it changes nothing. The same skill handles a blank starter, migrating an existing project, and pulling in updated conventions.

Recipes live in the `init` plugin (e.g. `/init:nextjs`). A recipe is only an ordered list of setup steps, with no setup knowledge of its own. It:

1. checks that every plugin it needs is installed, and if not, names the install commands to run,
2. collects the plan from each setup in order and shows one combined plan,
3. applies the steps in order after approval.

The `init` plugin gets added once there are two or more concern plugins to combine.

## Layout

```
.claude-plugin/marketplace.json    marketplace catalog, one entry per plugin
.github/workflows/ci.yml           lint/format/build/test/validate on every push and PR
.github/workflows/release.yml      changesets version/publish on push to main
eslint.config.mjs                  this repo linted by its own @pindakaasman/eslint-config
prettier.config.js                 this repo formatted by its own @pindakaasman/prettier-config
scripts/sync-plugin-versions.js    copies plugin package.json version -> plugin.json
plugins/<concern>/
  package.json                     private, version source of truth for Changesets
  .claude-plugin/plugin.json       plugin manifest (version synced, don't hand-edit)
  skills/setup/SKILL.md            set up this concern in a project
  skills/<skill>/SKILL.md          principles and patterns
configs/
  prettier/                        @pindakaasman/prettier-config
  eslint/                          @pindakaasman/eslint-config
  typescript/                      @pindakaasman/tsconfig
packages/
  design-system/                   @pindakaasman/design-system
```

## Checks

This repo dogfoods its own `configs/` packages: `eslint.config.mjs` and
`prettier.config.js` at the root pull in `@pindakaasman/eslint-config` and
`@pindakaasman/prettier-config` as workspace deps, the same way any other
project installing them would. Formatting only covers source code
(`*.md`/`*.json`/`*.yml` are excluded via `.prettierignore` - the config
package has no stated opinion on those). `.github/workflows/ci.yml` runs all
of this on every push and PR:

- `pnpm lint` / `pnpm format` - this repo's own code against its own configs.
- `pnpm build` / `pnpm test` - compiles and tests every package.
- `pnpm validate-plugins` (`claude plugin validate .`) - after editing the
  marketplace or any plugin, run this locally too rather than waiting for CI.

Test locally from another project: `claude plugin marketplace add
<path-to-this-repo>`, then `claude plugin install <plugin>@mise`.

## Release automation

Every publishable thing in this repo - `configs/*`, `packages/*`, and `plugins/*` - is versioned independently through [Changesets](https://github.com/changesets/changesets), not git tags. Run `pnpm changeset` after a change that should ship, describe it, and let it pick the affected package(s) and bump type.

`plugins/*` aren't npm packages: Claude Code only ever reads a plugin's version from `.claude-plugin/plugin.json`, and that's the sole signal it uses to detect an update - `marketplace.json` carries no version info at all. So each plugin folder also has a private, unpublished `package.json` (`"private": true`) purely so Changesets can track and bump it like everything else. `pnpm run version` (`changeset version`) bumps whatever changed, then runs `scripts/sync-plugin-versions.js`, which copies each plugin's `package.json` version into its `plugin.json`. Never hand-edit a plugin's version in `plugin.json` directly - it'll be overwritten by the next sync and drift from its changelog.

`.github/workflows/release.yml` runs this on every push to `main`:

1. If unreleased changesets exist, it opens/updates a "Version Packages" PR with the bumps, changelogs, and synced `plugin.json`s.
2. Merging that PR runs `pnpm release`, which publishes `configs/*` and `packages/*` to npm. `plugins/*` are private, so `changeset publish` skips them - a plugin's "release" is just its version-bumped `plugin.json` landing on `main`, which is all a git-based marketplace needs.

Requires an `NPM_TOKEN` secret (npm automation token, publish access to the `@pindakaasman` scope) in the repo's GitHub Actions secrets.
