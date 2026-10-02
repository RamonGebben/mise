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

For app-level providers/managers that sit _outside_ the atomic hierarchy -
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

## Styled components are components

Every styled-component definition is a component in its own right and gets
its own folder - in the owning component's `components/` (recursively), or
in an atomic tier when it's generic. A component's `index.tsx` holds its
implementation, not the styling that makes it up: open the file and the
first thing you read should be what it renders.

**Why:** a file that opens with a dozen one-off `styled.div`s buries the
actual implementation below them. Splitting them out keeps every file about
one thing, and gives each styled piece the same folder shape, story and
import root as any other component.

- **The folder's `index.tsx` is the styled export itself** - no React
  wrapper around it unless it actually needs props, logic or its own
  children structure.
- **It gets a story**, like every other component (see "Storybook stories"
  below) - nested ones included.
- **Generic → atomic tier, specific → `components/`.** A UI primitive that
  isn't tied to its owner (a `Button` with variants, a `Code` chip, an
  `InlineLink`) goes to `atoms/`/`molecules/`. Only pieces specific to their
  owner (the owner's own `Title`, `Intro`, `Actions` layout) nest under its
  `components/`. A group of them that forms a meaningful unit (e.g. an
  `Intro` with its `Title` and `Lead`) becomes one sub-component with its
  own `components/`, not a flat list of siblings.

```tsx
// bad - the template's implementation is buried below its styling
// src/templates/Home/index.tsx
const Page = styled.div`…`;
const Main = styled.main`…`;
const Title = styled.h1`…`;
const Lead = styled.p`…`;
const Button = styled.a<{ $variant: 'primary' | 'secondary' }>`…`;

export const Home = () => {
  return (
    <Page>
      <Main>…</Main>
    </Page>
  );
};
```

```
// good - every styled piece is its own component
src/
  atoms/
    Button/            generic - variants, reused anywhere
      index.tsx
      index.stories.tsx
  templates/
    Home/
      index.tsx        only the implementation
      index.stories.tsx
      components/
        Page/          specific to Home
        Main/
        Intro/
          index.tsx
          index.stories.tsx
          components/
            Title/
            Lead/
```

```tsx
// src/templates/Home/components/Intro/components/Title/index.tsx
import styled from 'styled-components';

export const Title = styled.h1`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSize('xl')};
`;
```

**Fallback only:** if a styled definition genuinely can't be split out yet,
it goes **below** the main component, never above it - and it's an open
item to split, not an accepted end state. (Module-level `const`s used inside
the component body are fine below it; only a styled definition that extends
another one, `styled(Other)`, has to come after `Other`.)

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
    const id = setInterval(
      () => setRemaining(getRemainingMs(target, new Date())),
      1000,
    );
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
