---
name: module-boundaries
description: What's public vs. private - component/package import boundaries and the one-way atomic tier dependency direction
---

# Module boundaries

A folder's `index` file (`index.tsx` for a component, `index.ts` for a
package) is its only public surface. Everything else inside it is free to
move, rename or restructure, because nothing outside imports it directly.

## Components

Never import from another component's `components/`, `hooks/`, or `state/`
subfolders - only from its `index.tsx` (see [[folder-structure]]).

**Why:** those subfolders exist because [[folder-structure]] scopes a
sub-component/hook/atom to the one component that owns it. Reaching past
`index.tsx` to grab something from inside breaks that scoping - the owning
component can no longer refactor its internals without checking who else
now depends on them.

```ts
// bad - reaches into UserCard's private hooks/ folder
import { useUserCardState } from '~/organisms/UserCard/hooks/useUserCardState';
```

```ts
// good - only the public surface
import { UserCard } from '~/organisms/UserCard';
```

If another component genuinely needs what's inside, that's a signal to lift
it - move the sub-component/hook/atom somewhere both can import from (up a
level, or into `src/utils/`) - rather than reaching into the folder that
owns it.

## Packages

Same rule at the `packages/*` boundary - e.g. `packages/design-system`
publishes only what `src/index.ts` exports (see [[design-system]]).
`packages/design-system/src/tokens.ts` is never imported directly from a
consuming project; if a project needs `SystemTokens`, that's added to
`index.ts`'s exports instead of reaching for the file directly.

## Atomic tier direction

Within `atoms → molecules → organisms → templates`, imports only go one way

- a tier can use its own tier or anything below it, never above:

```
templates   → can import organisms, molecules, atoms
organisms   → can import molecules, atoms
molecules   → can import atoms
atoms       → nothing (only src/utils/, src/theme/)
```

**Why:** the atomic naming is meaningless as a complexity signal unless the
dependency direction is enforced - an atom importing an organism would mean
"atom" no longer tells you it's the smallest, most reusable building block.
One-way is also what makes an atom's Storybook story (see
[[folder-structure]]) safe to render in total isolation.

```tsx
// bad - atom depends on an organism
// atoms/Icon/index.tsx
import { UserCard } from '~/organisms/UserCard';
```
