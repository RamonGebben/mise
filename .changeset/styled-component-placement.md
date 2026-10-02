---
'@pindakaasman/architecture-plugin': minor
---

Every styled-component definition is now its own component with its own folder (generic ones in an atomic tier, owner-specific ones nested under `components/`), with the styled export as its `index.tsx` and a story. In-file styled definitions are only a flagged fallback, placed below the main component. `architecture:setup` audits and migrates existing code against the rule.

The scaffolded theme no longer carries a "placeholder" comment: it's scaffolded as the project's final theme, seeded from the colors, fonts, sizes, spacing, shadows and breakpoints the project already uses (or an existing theme's values), with defaults only where the project has none, so moving onto it doesn't change how the app looks. The dev changes values in place.
