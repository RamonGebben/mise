---
name: state-management
description: Jotai vs Zustand, where client state lives relative to [[folder-structure]], and keeping server-cache data out of it
---

# State management

Client state is Jotai by default, Zustand when it fits better, and React
Query/tRPC owns anything that comes from the server. Three jobs, three
tools - don't let one creep into another's job.

## Jotai vs Zustand

No hard threshold - it's a judgment call, not a rule to automate:

- **Default to Jotai.** It's the closest atomic model to Recoil (the prior
  favorite, since discontinued) - state as small, independently-subscribed
  units rather than one shared store object.
- **Reach for Zustand when** a dependency already pulls it in (e.g.
  `react-flow` ships its own Zustand store internally - use that instance
  rather than layering Jotai on top), or the state genuinely fits a single
  co-located store better than a set of atoms.

## Where state lives

Mirrors [[folder-structure]]'s hook-extraction pattern - state is scoped to
where it's used, not dumped in one folder by default:

- **Feature-local** - an atom/store used only by one component tree lives
  inside that component's own folder, in `state/` (parallel to `hooks/`):

  ```
  ComponentName/
    index.tsx
    state/
      someAtom.ts
    hooks/
      useThing/
        index.ts
  ```

- **Global** - state genuinely shared app-wide lives in `src/store/` (or
  `src/atoms/` for Jotai) at the top level, parallel to `src/theme/` -
  outside the atomic hierarchy, same reasoning as [[design-system]]'s theme
  folder: it's a cross-cutting concern, not owned by any one component.

## Never duplicate server state

React Query/tRPC is the only source of truth for anything that comes from
the server. Never copy a query result into a Jotai atom or Zustand store -
read it directly with `useQuery` / `trpc.x.useQuery` wherever it's needed.

**Why:** the moment server data gets copied into client state, there are two
sources of truth that can silently drift. The query cache keeps
revalidating in the background; the copy sitting in an atom/store won't,
unless something remembers to sync it back.

```ts
// bad - copies query data into local state; the copy can go stale
const [user, setUser] = useState<User>();
const { data } = trpc.user.get.useQuery();
useEffect(() => {
  if (data) setUser(data);
}, [data]);
```

```ts
// good - read directly from the query, one source of truth
const { data: user } = trpc.user.get.useQuery();
```
