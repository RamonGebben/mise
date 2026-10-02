# @pindakaasman/mise-place

One command to get [mise](https://github.com/RamonGebben/mise)'s conventions
into a project - an existing one, a fresh `create-next-app`, or an empty
repo. It doesn't care which.

```sh
npx @pindakaasman/mise-place
```

## What it does

1. **Checks `claude` is on `PATH`.** If it isn't, prints a link to install
   Claude Code and exits - nothing else runs.
2. **Adds the `mise` marketplace**, from the resolved source (see Options
   below), or updates it from its source if it's already added.
3. **Installs every mise plugin** (`typescript`, `architecture`, `react`,
   `testing`, `verification`, `init`) at user scope, or updates any that
   are already installed - so every run picks up the latest released
   versions.
4. **Hands off** into an interactive `claude` session in the current
   directory, already running `/init:setup`.

`/init:setup` (from the `init` plugin) then:

- Walks each concern plugin in order, collecting a combined plan from
  whichever of them has its own `skills/setup/SKILL.md` written yet (see
  each plugin's own setup skill for what it actually does), and applies that
  plan only after you approve it.
- Creates or refreshes a `## Conventions (via mise)` section in the current
  directory's `CLAUDE.md` (creating the file if it doesn't exist yet),
  listing every installed plugin's skills so Claude - and you - know what's
  available without hunting for it. Only that marked section is touched;
  the rest of an existing `CLAUDE.md` is left alone.

## Idempotency

Safe to run more than once, in the same directory or a different one:
anything already added, installed, or already reflected in `CLAUDE.md`'s
mise section is skipped or refreshed in place, never duplicated.

## Options

- `--marketplace <path-or-url>` - use a marketplace source other than the
  default (`RamonGebben/mise`, the GitHub repo). Useful for testing against a
  local clone or a fork.
- `MISE_MARKETPLACE` environment variable - same, for when you don't want to
  pass a flag every time.

## Requirements

- [Claude Code](https://claude.com/claude-code) installed and on `PATH`,
  logged in.
- Node.js (for running `npx` itself).

## Troubleshooting

- **`claude CLI not found on PATH`** - install Claude Code first; this tool
  doesn't attempt to install it for you.
- **Marketplace or plugin install fails** - re-running is safe; anything
  already added or installed is updated rather than added again.
