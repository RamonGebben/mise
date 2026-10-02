---
'@pindakaasman/architecture-plugin': minor
---

Every styled-component definition is now its own component with its own folder (generic ones in an atomic tier, owner-specific ones nested under `components/`), with the styled export as its `index.tsx` and a story. In-file styled definitions are only a flagged fallback, placed below the main component. `architecture:setup` audits and migrates existing code against the rule.
