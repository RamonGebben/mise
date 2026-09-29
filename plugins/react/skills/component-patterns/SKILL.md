---
name: component-patterns
description: Loading/empty/loaded branching, and when a render-body helper should be a real subcomponent instead
---

# Component patterns

## Loading state before empty state, and return early

When a component branches on `isLoading`/`isPending`/`isFetching` vs. "is the
data empty" vs. loaded, check the loading flag **first**. The underlying
array/object defaults to `[]`/`undefined` while a query is in flight, so an
empty-check that runs before (or without regard to) the loading check reads
true for the entire load and shows the empty state instead of a loading
skeleton.

Structure the branches as guard-clause early returns, rather than nesting the
check in a ternary chain - even when a ternary already happens to order
loading first, prefer the early-return shape. It's unambiguous at a glance,
and it's what to reach for on new code.

```tsx
// bad - empty check doesn't account for loading; shows "no results" while fetching
const ResultsList = ({ results, isLoading }: Props) => {
  return results.length === 0 ? <EmptyState /> : <List items={results} />;
};
```

```tsx
// bad - loading is handled, but as a ternary chain rather than early returns
const ResultsList = ({ results, isLoading }: Props) => {
  return isLoading ? (
    <Skeleton />
  ) : results.length === 0 ? (
    <EmptyState />
  ) : (
    <List items={results} />
  );
};
```

```tsx
// good - guard-clause early returns, loading checked first
const ResultsList = ({ results, isLoading }: Props) => {
  if (isLoading) return <Skeleton />;
  if (results.length === 0) return <EmptyState />;
  return <List items={results} />;
};
```

## Extract a subcomponent, not a render-body helper

If chrome that must render in every branch (a header, a wrapper) would
otherwise get duplicated across the guards, or a section within one branch
needs its own loading/empty/loaded sub-branching, extract it into a real
named subcomponent - in that component's `components/` folder, with explicit
props - and reuse it in each `return`.

**Not** a local JSX variable (`const header = (…)`) and **not** an inline
`renderX()` helper defined in the render body. Either shape re-evaluates on
every render with no component identity of its own, so React can't reconcile
or memoize it independently - a sign it should have been a component in the
first place.

```tsx
// bad - renderHeader is redefined every render, has no identity React can track
const Dashboard = ({ isLoading, data }: Props) => {
  const renderHeader = () => <Header title="Dashboard" />;

  if (isLoading) return <>{renderHeader()}<Skeleton /></>;
  return <>{renderHeader()}<Content data={data} /></>;
};
```

```tsx
// good - Header is a real component, reused across branches
// components/Header/index.tsx
export const Header = ({ title }: { title: string }) => {
  return <header>{title}</header>;
};

// index.tsx
const Dashboard = ({ isLoading, data }: Props) => {
  if (isLoading) {
    return (
      <>
        <Header title="Dashboard" />
        <Skeleton />
      </>
    );
  }
  return (
    <>
      <Header title="Dashboard" />
      <Content data={data} />
    </>
  );
};
```
