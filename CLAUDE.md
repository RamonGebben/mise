# mise

This repo is the single source of truth for how I write code. It is reused across all my projects. Project-specific facts belong in each project's own CLAUDE.md, never here.

## Two halves

1. **`configs/`** holds shareable config packages (Prettier, ESLint, TypeScript). This is the *enforceable* part: if a tool can check a rule, the rule goes here, not in prose.
2. **`plugins/`** holds Claude Code plugins, one per concern (e.g. `testing`). They are distributed through the marketplace in `.claude-plugin/marketplace.json`. This is the *judgment* part: principles, patterns and the reasons behind them, written as skills.

Plugins are split by concern, not by stack. Stack-specific guidance (React, Next.js, …) lives inside the plugin for the concern it's about, as its own skill where needed.

## How we work in this repo

We build this up by talking it through. I'll describe my preferences and paste in my existing configs. Your job:

- Interview me one area at a time. Ask about the *why* behind each preference, not just the *what*.
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
plugins/<concern>/
  .claude-plugin/plugin.json       plugin manifest (bump version on changes)
  skills/setup/SKILL.md            set up this concern in a project
  skills/<skill>/SKILL.md          principles and patterns
configs/
  prettier/                        @pindakaasman/prettier-config
  eslint/                          @pindakaasman/eslint-config
  typescript/                      @pindakaasman/tsconfig
```

## Checks

- Run `claude plugin validate .` after editing the marketplace or any plugin.
- Test locally from another project: `claude plugin marketplace add <path-to-this-repo>`, then `claude plugin install <plugin>@mise`.
