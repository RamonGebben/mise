---
name: conventions
description: Type declaration style, enums, any/unknown and Array<T> - stated TypeScript preferences, split between what ESLint enforces and what needs judgment
---

# TypeScript conventions

Where a rule below is machine-checkable, `@pindakaasman/eslint-config`
enforces it (see `configs/eslint/rules.js`) - don't rely on remembering it.
What can't be expressed as a lint rule stays here as judgment, with the
reasoning and an example.

## `Array<T>` over `T[]`

Enforced by `@typescript-eslint/array-type` (`{ default: 'generic' }`).

**Why:** `Array<T>` reads as an array first - the `Array<…>` wrapper is
harder to miss than a trailing `[]`, especially on a long or generic inner
type (`Array<Record<string, User>>` vs. `Record<string, User>[]`).

```ts
// bad
const getNames = (users: User[]): string[] => { ... };
```

```ts
// good
const getNames = (users: Array<User>): Array<string> => { ... };
```

## `interface` for object shapes, `type` for everything else

Not lint-enforced - `@typescript-eslint/consistent-type-definitions` only
supports one global choice (always `interface` or always `type`), and can't
express this split.

Use `interface` when declaring the shape of an object, especially one that
might get extended. Use `type` for unions, tuples, and mapped/utility types
- anything that isn't a plain object shape.

```ts
// bad - type for a plain object shape
type User = {
  id: string;
  name: string;
};
```

```ts
// good
interface User {
  id: string;
  name: string;
}

// type for what interface can't express
type Status = 'idle' | 'loading' | 'error';
type UserId = User['id'];
```

## No `any` - narrow `unknown` at the boundary

Enforced by `@typescript-eslint/no-explicit-any`.

`any` turns off type checking for everything it touches, including code far
from where it was introduced. `unknown` forces a narrowing check before use,
right at the boundary where untyped data enters (an API response,
`JSON.parse`, a third-party callback).

```ts
// bad - any silently propagates past the boundary
const parseConfig = (raw: any) => {
  return raw.settings.theme; // no error, even if raw has no `settings`
};
```

```ts
// good - unknown forces a check before use
const parseConfig = (raw: unknown) => {
  if (!isConfig(raw)) throw new Error('invalid config');
  return raw.settings.theme; // now typed
};
```

## Union literals over `enum`

Enforced via `no-restricted-syntax` banning `TSEnumDeclaration`.

**Why:** a TypeScript `enum` compiles to a runtime object (unless
`const enum`, which has its own cross-module pitfalls) and doesn't match the
plain string a server response or JSON payload actually contains -
comparing against it needs an explicit cast. A string-literal union is
erased at compile time and is the same shape the data already has.

```ts
// bad
enum Status {
  Idle = 'idle',
  Loading = 'loading',
}
```

```ts
// good
type Status = 'idle' | 'loading';
```

## `satisfies` for const config objects

Not lint-enforced. When declaring a constant object that should be checked
against a type but keep its literal (narrowed) type - e.g. a router map, or
the tokens object passed to `new DesignSystem(tokens)` (see
[[design-system]]) - use `satisfies` instead of a type annotation. An
annotation widens the value to the annotated type; `satisfies` checks it
against that type but keeps the inferred literal type, so property access
downstream stays precise.

```ts
// bad - annotation widens; tokens.breakpoints.mobile is just `string`
const tokens: SystemTokens = {
  breakpoints: { mobile: '375px', tablet: '768px' },
};
```

```ts
// good - checked against SystemTokens, breakpoints keeps its literal shape
const tokens = {
  breakpoints: { mobile: '375px', tablet: '768px' },
} satisfies SystemTokens;
```
