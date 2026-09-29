# conventions

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

## Open questions

- Where the project init/migration skill should live (its own plugin, or split across the concern plugins).

## Layout

```
.claude-plugin/marketplace.json    marketplace catalog, one entry per plugin
plugins/<concern>/
  .claude-plugin/plugin.json       plugin manifest (bump version on changes)
  skills/<skill>/SKILL.md
configs/
  prettier/                        @YOUR_SCOPE/prettier-config
  eslint/                          @YOUR_SCOPE/eslint-config
  typescript/                      @YOUR_SCOPE/tsconfig
```

## Checks

- Run `claude plugin validate .` after editing the marketplace or any plugin.
- Test locally from another project: `claude plugin marketplace add <path-to-this-repo>`, then `claude plugin install <plugin>@conventions`.
