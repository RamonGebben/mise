# mise

_Mise en place_: everything in its place before you start cooking.

My personal coding conventions, reused across every project I write: the
enforceable rules live in shared configs, judgment calls live in Claude Code
plugin skills, and stable runtime code lives in versioned packages.

## Quick start

```bash
npx @pindakaasman/mise-place
```

Adds the `mise` marketplace, installs every plugin, and hands off into a
Claude Code session that sets up the current project. Safe to re-run in an
existing project or a fresh one. See [its README](packages/mise-place) for
options.

## What's in here

### `plugins/` - Claude Code plugins

Judgment calls: principles, patterns and the reasons behind them, one plugin
per concern, distributed through the marketplace.

| Plugin         | What it covers                                                             |
| -------------- | -------------------------------------------------------------------------- |
| `architecture` | Folder structure, styling and general code-style conventions               |
| `typescript`   | TypeScript language conventions - type declarations, enums, narrowing      |
| `react`        | React-specific component patterns and judgment calls                       |
| `testing`      | How I test: harness, structure and what to test                            |
| `init`         | Combines each installed plugin's setup skill into one plan-then-apply flow |

```bash
claude plugin marketplace add RamonGebben/mise
claude plugin install testing@mise
```

### `configs/` - shareable config packages

The enforceable part: if a tool can check a rule, it lives here, not in a
skill.

| Package                                             | For             |
| --------------------------------------------------- | --------------- |
| [`@pindakaasman/eslint-config`](configs/eslint)     | ESLint          |
| [`@pindakaasman/prettier-config`](configs/prettier) | Prettier        |
| [`@pindakaasman/tsconfig`](configs/typescript)      | `tsconfig.json` |

```bash
npm install -D @pindakaasman/eslint-config @pindakaasman/prettier-config @pindakaasman/tsconfig
```

### `packages/` - versioned runtime packages

Real library code a project installs as a dependency instead of
copy-scaffolding in. Only the generic, stable shape lives here; anything
project-specific stays scaffolded per-project.

| Package                                                 | What it is                                         |
| ------------------------------------------------------- | -------------------------------------------------- |
| [`@pindakaasman/design-system`](packages/design-system) | Typed, breakpoint-aware accessor over theme tokens |
| [`@pindakaasman/mise-place`](packages/mise-place)       | The bootstrap CLI used in Quick start above        |

## How this is built, and how it releases

See [`CLAUDE.md`](CLAUDE.md) for the full process: how each convention gets
interviewed and placed, and how versioning and publishing (Changesets + npm
trusted publishing) works.

## License

[MIT](LICENSE)
