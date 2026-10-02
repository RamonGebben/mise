# mise

_Mise en place_: everything in its place before you start cooking.

These are my personal coding conventions, the ones I use in every project:
how I structure folders, write TypeScript and React, test, and check a
change before committing it. They used to live in my head and in configs I
copied from one repo to the next. This repo keeps them in one place, so I
can apply them to any project with one command and update them everywhere
when they change.

The conventions are mine, but the setup is reusable. If you want your own
version, see [Make your own](#make-your-own).

## The problem this solves

Coding conventions come in two kinds:

- **Rules a tool can check.** "Use `Array<T>`, not `T[]`." "Format with
  Prettier." These belong in ESLint, Prettier and `tsconfig.json`, where
  they're enforced automatically.
- **Rules that need judgment.** "Put a component in the atomic tier that
  matches what it does." "Don't reach across module boundaries." No linter
  can check these. Normally they live in a style guide that people forget to
  read.

I write most of my code with [Claude Code](https://claude.com/claude-code),
Anthropic's coding agent, which can read written guidance and follow it.
That turns the second kind of rule into something that actually gets
applied: I write it down once, with the reason behind it, and Claude uses it
while it works in any of my projects.

So this repo holds both kinds, kept apart. Anything a tool can check goes
into a shared config package. Everything else goes into a Claude Code
plugin.

## Terms used here

If you haven't used Claude Code's plugin system, these words have a specific
meaning:

- **Skill**: a Markdown file (`SKILL.md`) with instructions for Claude on one
  topic, such as how I structure folders. Claude loads it when it's relevant
  to the task, or you call it directly as a slash command, like
  `/architecture:folder-structure`.
- **Plugin**: a folder of related skills with a small manifest
  (`.claude-plugin/plugin.json`). Here there is one plugin per concern:
  `typescript`, `react`, `testing`, and so on.
- **Marketplace**: a catalog of plugins that Claude Code can install from.
  It's just a `.claude-plugin/marketplace.json` file in a git repo or local
  folder that lists where each plugin lives. Nothing gets bought or sold. This
  repo is a marketplace named `mise`, so a plugin from it is installed as
  `<plugin>@mise`, e.g. `testing@mise`.
- **Config package**: a normal npm package with a shared ESLint, Prettier or
  TypeScript config that a project extends instead of copying.

## What's in here

### `plugins/`: the judgment calls

| Plugin         | What it covers                                                                   |
| -------------- | -------------------------------------------------------------------------------- |
| `architecture` | Folder structure, styling, design system, state management, module boundaries    |
| `typescript`   | TypeScript language conventions: type declarations, enums, `any` vs. `unknown`   |
| `react`        | Component patterns                                                               |
| `testing`      | Test harness, test structure and what to test                                    |
| `verification` | The pre-commit gate, what to run while developing, what to do when a check fails |
| `init`         | Runs every other plugin's setup in one go (see below)                            |

Each skill states a rule, says why, and gives a good and a bad example
where that helps. For example, the `typescript` plugin's
[`conventions` skill](plugins/typescript/skills/conventions/SKILL.md).

### `configs/`: the rules a tool can check

| Package                                             | For             |
| --------------------------------------------------- | --------------- |
| [`@pindakaasman/eslint-config`](configs/eslint)     | ESLint          |
| [`@pindakaasman/prettier-config`](configs/prettier) | Prettier        |
| [`@pindakaasman/tsconfig`](configs/typescript)      | `tsconfig.json` |

These are published to npm and work without Claude Code. When a skill
mentions a rule that ESLint already enforces, it points to the lint rule
and doesn't repeat it as prose.

### `packages/`: shared runtime code

| Package                                                 | What it is                                         |
| ------------------------------------------------------- | -------------------------------------------------- |
| [`@pindakaasman/design-system`](packages/design-system) | Typed, breakpoint-aware accessor over theme tokens |
| [`@pindakaasman/mise-place`](packages/mise-place)       | The bootstrap CLI (see Quick start)                |

Some conventions need real code behind them. If the code is generic and
stable, it's published as a versioned package that projects install as a
dependency, so a fix reaches every project with a version bump. Anything
project-specific, like actual brand colours, is still generated per
project by the skill that documents the package.

## How setting up a project works

```
npx @pindakaasman/mise-place
  │
  ├─ claude plugin marketplace add <mise repo>     register the catalog
  ├─ claude plugin install <plugin>@mise           once per plugin
  └─ claude /init:setup                            start a Claude session
        │
        ├─ /typescript:setup     ┐
        ├─ /architecture:setup   │  each one inspects the project and
        ├─ /react:setup          │  returns a plan, nothing is changed yet
        ├─ /testing:setup        │
        └─ /verification:setup   ┘
        │
        ├─ show one combined plan  →  you approve or adjust it
        ├─ apply it
        └─ write a "Conventions (via mise)" section into CLAUDE.md
```

Every concern plugin has a `setup` skill that knows how to bring a project
in line with that plugin's rules: install and wire up the config packages,
add the pre-commit hook, and check the existing code against every rule.
The checking is the part people tend not to expect. On an existing project,
setup doesn't just install tools. It also finds code that breaks the
conventions, such as components in the wrong folder or a misconfigured test
setup, and plans the migration.

Each setup skill follows two rules:

- **Plan, then apply.** It reports what it would change and waits for your
  approval before it touches anything.
- **Safe to re-run.** On a project that already complies, it changes
  nothing. A blank starter, an old project and a project that needs the
  latest conventions all go through the same skill.

`init:setup` has no setup knowledge of its own. It runs the other setups in
a fixed order (TypeScript first, verification last, because verification
wires up the tools the others installed) and combines their plans. When it
reaches a choice it can't make for you, like whether to move a Tailwind
project to the design system, it asks.

Finally it writes a marked section into the project's `CLAUDE.md` (the file
Claude Code reads at the start of every session) listing the installed
skills. It only ever replaces the text between its own markers, so the rest
of the file is left alone.

## Quick start

You need [Claude Code](https://claude.com/claude-code) installed and logged
in, and Node.js. Then, from the root of the project you want to set up:

```bash
npx @pindakaasman/mise-place --marketplace RamonGebben/mise
```

`RamonGebben/mise` is this GitHub repo. Without `--marketplace` the CLI
looks for a local clone at `~/Projects/mise`, which is where mine lives.
You can also set `MISE_MARKETPLACE` instead of passing the flag. See the
[mise-place README](packages/mise-place) for details.

### Doing it by hand

The CLI is a thin wrapper. The same steps without it:

```bash
claude plugin marketplace add RamonGebben/mise
claude plugin install typescript@mise   # repeat for each plugin you want
claude plugin install init@mise
claude /init:setup
```

You can install a single plugin and run only its setup, e.g.
`/testing:setup`. Or skip Claude Code entirely and just use the config
packages:

```bash
npm install -D @pindakaasman/eslint-config @pindakaasman/prettier-config @pindakaasman/tsconfig
```

### Getting updates

```bash
claude plugin marketplace update mise
claude plugin update <plugin>@mise
```

Then run `/init:setup` again in the project. Because setup is safe to
re-run, it only plans whatever changed since last time.

Claude Code only notices a new plugin version when the `version` in
`plugin.json` changes. That's why every plugin is versioned (see
[Releasing](#releasing)).

## Make your own

This setup works for any set of conventions, not only mine. To build your
own:

1. **Fork or copy the repo** and rename things: the marketplace `name` and
   `owner` in [`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json),
   and the `@pindakaasman` npm scope in every `package.json` (and wherever
   the skills mention those package names).
2. **Replace the conventions.** Edit or delete the skills under
   `plugins/*/skills/`, and the configs under `configs/`. Keep the split:
   if a tool can check a rule, put it in a config. If it needs judgment,
   write a skill with the reason and an example.
3. **Keep each plugin's `setup` skill in sync with its rules.** If you add a
   rule and don't add it to the setup audit, existing projects never get
   checked against it.
4. **Test locally** before publishing. A marketplace can be a local folder:

   ```bash
   claude plugin marketplace add ~/path/to/your/fork
   claude plugin install testing@<your-marketplace-name>
   ```

   A local install is a copy. After editing a skill, either bump the
   plugin's version or reinstall it
   (`claude plugin uninstall … && claude plugin install …`) to pick up the
   change.

5. **Publish.** Push the repo to GitHub and anyone can add it with
   `claude plugin marketplace add <you>/<repo>`. The config packages and
   `packages/*` go to npm through the release workflow below, which needs an
   `NPM_TOKEN` secret in the repo's GitHub Actions settings.

I didn't write these conventions up front. I built them by having Claude
interview me one topic at a time and asking for the reason behind each
preference before deciding where it goes.
[`CLAUDE.md`](CLAUDE.md) describes that process, and since Claude Code
reads it automatically, a fork comes with the process built in.

## Working on this repo

```bash
pnpm install
pnpm build
pnpm test
```

It's a pnpm workspace (`configs/*`, `packages/*`, `plugins/*`), and it uses
its own conventions: the root ESLint and Prettier configs extend the
packages in `configs/`, and the pre-commit hook is the same one the
`verification` plugin installs in other projects. The hook formats and lints
staged files, validates the plugins, and runs the typecheck and full test
suite. CI runs the same checks on every push and pull request.

## Releasing

Everything is versioned independently with
[Changesets](https://github.com/changesets/changesets):

1. After a change that should ship, run `pnpm changeset` and describe it.
2. On `main`, a GitHub Action opens a "Version Packages" pull request with
   the version bumps and changelogs.
3. Merging that PR publishes the `configs/*` and `packages/*` packages to
   npm.

Plugins aren't npm packages. Each one has a private `package.json` only so
that Changesets can bump its version, and a script copies that version into
the plugin's `plugin.json`. For a git-based marketplace, the release is just
that version bump landing on `main`. [`CLAUDE.md`](CLAUDE.md) has the
details.

## License

[MIT](LICENSE)
