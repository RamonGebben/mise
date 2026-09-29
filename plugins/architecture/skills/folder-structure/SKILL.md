---
name: folder-structure
description: Where things live - atomic design layout, component/hook/util folder shapes, and app-level providers
---

# Folder structure

## Top-level layout

```
src/
  atoms/          presentational, smallest building blocks
  molecules/      presentational, composed of atoms
  organisms/      presentational, composed of molecules/atoms
  templates/      presentational, page-level layout
  app/            Next.js App Router - pages fetch/enrich data, pass it to templates
  providers/      app-level providers/managers, outside the atomic hierarchy
  theme/          theme shape + token values
  utils/          pure helpers, formatters
```

**Why the app/templates split matters:** `atoms` through `templates` are
presentational only - every input can be mocked or stubbed, which is what
makes them testable through Vitest and Storybook without a network or a
database. Data fetching happens one layer up, in `src/app/`, and gets handed
down as props. A template that reaches out and fetches its own data can no
longer be driven by a Storybook story with fixed inputs.

```tsx
// bad - template fetches its own data, can't be driven by fixed story inputs
// src/templates/Dashboard/index.tsx
export const Dashboard = () => {
  const { data } = useDashboardQuery();
  return <DashboardView data={data} />;
};
```

```tsx
// good - page (src/app/dashboard/page.tsx) fetches, template stays pure
const DashboardPage = async () => {
  const data = await getDashboardData();
  return <Dashboard data={data} />;
};

export default DashboardPage;

// src/templates/Dashboard/index.tsx
export const Dashboard = ({ data }: { data: DashboardData }) => {
  return <DashboardView data={data} />;
};
```

## `src/providers/`

For app-level providers/managers that sit *outside* the atomic hierarchy -
client wrappers that wire cross-cutting concerns into the tree, rather than
render feature UI (e.g. `InstallPromptManager`, `ServiceWorkerRegistrar`,
`MarketingUserMenu`). Presentational UI belongs in `atoms`/`molecules`/`organisms`;
put a component here only when it's a provider/manager of this kind.

Providers use a lighter folder shape than presentational components - just
`index.tsx` (plus `hooks/` if genuinely needed). No `index.stories.tsx`:
they're not presentational, so there's nothing meaningful to drive through
Storybook controls.

```
providers/
  ServiceWorkerRegistrar/
    index.tsx
```

## Component folder shape

Applies to every component under `atoms/`, `molecules/`, `organisms/`,
`templates/` (components are `.tsx`; pure logic is `.ts`):

```
ComponentName/
  index.tsx            # the component (the import root)
  index.stories.tsx     # Storybook story; feed inputs via args/controls
  components/          # sub-components used ONLY by this component
    SubComponent/ …     # same shape, recursive (soft cap ~3 levels deep)
  hooks/                # hooks used ONLY by this component
    useThing/
      index.ts          # the hook (the import root)
      index.test.ts      # colocated unit test (required)
```

**Why a folder per component instead of flat files:** it gives every
component a stable import root (`import { Button } from './Button'`, not
`'./Button/Button'`) and a place to grow into - a sub-component or hook
doesn't force a rename or a restructure, it just adds a folder.

## Component-specific hooks

Live in that component's `hooks/<hookName>/index.ts` - a folder, never a
loose `useThing.ts` next to `index.tsx` - and **must** ship a colocated
`index.test.ts`.

Keep the hook itself a thin wrapper, and push the testable logic into a pure
exported helper (or a `src/utils/` module), so the unit test doesn't need a
React renderer - the Vitest `unit` project runs in Node, with no DOM.

```ts
// bad - logic buried inside the hook; testing it needs a DOM renderer
// hooks/useCountdown/index.ts
export const useCountdown = (target: Date) => {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      const diff = target.getTime() - Date.now();
      setRemaining(diff > 0 ? diff : 0);
    }, 1000);
    return () => clearInterval(id);
  }, [target]);
  return remaining;
};
```

```ts
// good - pure logic extracted, hook is a thin wrapper around it
// hooks/useCountdown/getRemainingMs.ts
export const getRemainingMs = (target: Date, now: Date) => {
  const diff = target.getTime() - now.getTime();
  return diff > 0 ? diff : 0;
};

// hooks/useCountdown/index.ts
export const useCountdown = (target: Date) => {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setRemaining(getRemainingMs(target, new Date())), 1000);
    return () => clearInterval(id);
  }, [target]);
  return remaining;
};

// hooks/useCountdown/getRemainingMs.test.ts
// tests getRemainingMs directly - no renderer needed
```

## Utils / helpers / formatters

Live in `src/utils/<name>/{index.ts, index.test.ts}` - always a `<name>/`
folder with an `index.ts`, never a loose `<name>.ts`. Same reasoning as
component folders: a folder gives the util room to grow (a second helper, a
shared type) without a restructure later.

## Storybook stories

Every component gets a Storybook story; drive all inputs through
args/controls (not the legacy addon-knobs - that's been replaced by the
args/controls system).
