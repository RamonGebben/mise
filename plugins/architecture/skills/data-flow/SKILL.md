---
name: data-flow
description: Reads and writes both through tRPC, loading/error state threaded explicitly through props, and Context reserved for values that never change
---

# Data flow

## Reads and writes both go through tRPC

Queries and mutations both go through tRPC procedures - one typed layer for
all client-server communication, rather than splitting reads through
tRPC/React Query and writes through Server Actions or REST route handlers.

**Why:** one layer means one place types flow from (the router's
input/output types), one client (`trpc.x.useQuery`/`useMutation`), and one
thing to mock in tests - not two systems with their own conventions for the
same client-server boundary.

```ts
// bad - query through tRPC, mutation through a Server Action
const { data } = trpc.cosplan.get.useQuery({ id });
async function updateCosplan(formData: FormData) {
  'use server';
  // ...
}
```

```ts
// good - both through tRPC
const { data } = trpc.cosplan.get.useQuery({ id });
const updateCosplan = trpc.cosplan.update.useMutation();
```

## Loading/error state is explicit, not implicit via Suspense

A component that needs to render differently while data loads or fails
receives `isLoading`/`error` explicitly as props from whichever ancestor
owns the fetch - not by relying on `<Suspense>`/`loading.tsx`/an error
boundary to swap it out from outside.

**Why:** explicit props keep the presentational components in
[[folder-structure]] fully drivable from a Storybook story - a story can set
`isLoading: true` or `error: someError` directly in args/controls, which
isn't possible for a component that instead expects to be unmounted and
replaced by a Suspense fallback.

```tsx
// bad - relies on being wrapped in Suspense to show a loading state
export function CosplanDetails({ id }: { id: string }) {
  const { data } = trpc.cosplan.get.useQuery({ id }); // suspends
  return <div>{data.name}</div>;
}
```

```tsx
// good - loading/error are explicit props, drivable from a story
export function CosplanDetails({
  cosplan,
  isLoading,
  error,
}: {
  cosplan?: Cosplan;
  isLoading: boolean;
  error?: Error;
}) {
  if (isLoading) return <Spinner />;
  if (error) return <ErrorState error={error} />;
  return <div>{cosplan.name}</div>;
}
```

## React Context - only for genuinely static values

`createContext`/`useContext` is reserved for values set once at the root and
never updated afterward (e.g. a config object). Anything that changes over
time goes through Jotai/Zustand instead (see [[state-management]]).

**Why:** a Context value that updates triggers a re-render of every consumer
regardless of which part of the value they actually read; Jotai atoms and
Zustand's selector-based subscriptions don't have that problem. Reserving
Context for values that never change sidesteps the issue entirely instead of
working around it.

```tsx
// bad - Context used for state that changes; every consumer re-renders
const ThemeModeContext = createContext<{
  mode: string;
  setMode: (m: string) => void;
}>(defaultValue);
```

```tsx
// good - Context for a value fixed at startup; state that changes uses an atom
const FeatureConfigContext = createContext<FeatureConfig>(defaultConfig); // set once at root, never updated

const modeAtom = atom<'light' | 'dark'>('light'); // changes over time → Jotai
```
