---
'@pindakaasman/accessibility-plugin': minor
'@pindakaasman/init-plugin': minor
---

New `accessibility` plugin: WCAG 2.2 AA plus 44px touch targets. `accessibility:conventions` covers what the design system, lint and Storybook enforce, and the judgment calls they can't make (targets, focus, color pairs, reflow, keyboard, forced colors, reduced motion). `accessibility:setup` wires up jsx-a11y, `@storybook/addon-a11y` with failing tests, and the design-system token audit, and audits existing code against every convention. `init:setup` runs it after `testing`.
