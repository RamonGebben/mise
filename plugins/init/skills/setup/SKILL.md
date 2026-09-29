---
name: setup
description: Combine every installed mise plugin's own setup skill into one plan-then-apply flow for the current project
---

# init:setup

This skill holds no setup knowledge of its own - it only orders and combines
the setup skills that already live in each concern plugin
(`plugins/<concern>/skills/setup/SKILL.md`). If a rule needs to change for a
concern, change that concern's own setup skill, not this one.

## Steps

Walk these concern plugins **in this order** - TypeScript conventions before
component patterns that assume them, architecture before what plugs into it:

1. `typescript`
2. `architecture`
3. `react`
4. `testing`

For each plugin in the list:

1. **Check it's installed.** Run `claude plugin list --json` and look for an
   entry whose `id` is `<plugin>@mise`. If it's missing, note the install
   command (`claude plugin install <plugin>@mise`) and move to the next
   plugin - don't install it yourself.
2. **Check it has a setup skill.** Look for
   `skills/setup/SKILL.md` inside that plugin's installed path (from the
   `installPath` field in the same JSON). If it doesn't exist yet, note "no
   setup skill yet" for that plugin and move on - this is expected while the
   conventions for that concern are still being written, not an error.
3. **Otherwise, follow that plugin's setup skill to build its plan**, exactly
   as it would if invoked directly (e.g. `/architecture:setup`). Collect what
   it would do - files it would create, move, or edit; installs it would run -
   without applying anything yet.

## Combine and apply

Once every plugin has been walked:

- Present one combined plan, in the same order as above, covering only the
  plugins that had a setup skill to run. List the plugins that were skipped
  (not installed, or no setup skill yet) separately, so it's clear what
  wasn't covered and why.
- Apply the combined plan only after the user approves it, running each
  plugin's steps in the order above.
- Re-running this skill on a project it already set up must be a no-op, the
  same way each individual setup skill is safe to re-run.

## Keep CLAUDE.md up to date

Run this after the combine-and-apply step above, regardless of whether that
step found anything to apply - it's independent of per-plugin setup skills
and covers every skill each installed plugin already has today, not just
setup skills.

**Apply this step directly, without asking first** - unlike the
combine-and-apply plan above (which involves real judgment: installs, file
moves, choices worth a human's sign-off), this one is mechanical and always
safe to redo: it only ever replaces the content of one marker-delimited
block with a freshly generated rendering of installed plugins and skills.
Report what you did (created vs. updated the section) after the fact,
alongside the combine-and-apply summary - don't hold it behind a separate
approval prompt.

1. Get the mise marketplace's on-disk location: `claude plugin marketplace
   list --json`, find the entry named `mise`, read its `installLocation`.
2. For each plugin from the walk above that's installed (regardless of
   whether it had a setup skill), list its skill directories under
   `<installPath>/skills/*/SKILL.md` and read each one's frontmatter `name`
   and `description`.
3. For each skill, search its SKILL.md **frontmatter `description` field
   only** for the literal substring `@pindakaasman/`. This is a strict
   string match, not a judgment call about what the skill discusses -
   `module-boundaries`, for example, talks about "package import
   boundaries" in general and must NOT get a link, because that literal
   substring isn't present in its description. Only `design-system`
   currently contains it (`@pindakaasman/design-system`). If the substring
   is found, take the `<name>` immediately after `@pindakaasman/` up to the
   next space or non-identifier character, and if
   `<mise installLocation>/packages/<name>/README.md` exists, note that
   resolved path against the skill. This is what surfaces the
   `design-system` skill's package README today, generically, with no
   plugin-specific knowledge hardcoded here - it will pick up any future
   skill the same way, and only that way.
4. Render this exact template, substituting the real plugin/skill data
   (never `init` itself - it's infrastructure, not a convention plugin):

   ```markdown
   ## Conventions (via mise)
   <!-- mise:plugins:start -->
   This project uses mise's coding conventions, installed as Claude Code
   plugins. Invoke a skill as `/<plugin>:<skill>`, or let Claude reach for it
   automatically.

   - **<plugin>**
     - `<skill>` — <description>
     - `<skill>` — <description, plus "- see <resolved README path>" when step 3 found one>

   Re-run `/init:setup` after installing or updating a mise plugin to refresh
   this section.
   <!-- mise:plugins:end -->
   ```

   Formatting rules, exactly:
   - Plugins appear in the walk order from the Steps section above
     (`typescript`, `architecture`, `react`, `testing`), skills within each
     plugin sorted alphabetically by skill name.
   - No blank line between one plugin's bullet group and the next - the
     block is one continuous list, plugin bullets and skill sub-bullets
     back to back, only a blank line before the closing "Re-run..." line.

5. **No `CLAUDE.md` in the current directory:** create one containing an
   `<!-- Add project-specific facts here. -->` placeholder line above the
   rendered section.
6. **`CLAUDE.md` already exists:** search it for the
   `<!-- mise:plugins:start -->` / `<!-- mise:plugins:end -->` marker pair.
   - Found: replace only the content between the markers (inclusive) with
     the freshly rendered block. Leave every other line in the file
     untouched.
   - Not found: append the rendered section (with a blank line before it) to
     the end of the file. Never duplicate the section.
7. This step is always safe to re-run: the marker block is fully replaced
   each time, never accumulated.
