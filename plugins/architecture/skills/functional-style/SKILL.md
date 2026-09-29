---
name: functional-style
description: General code-style preferences - array methods over loops, composition, early returns
---

# Functional style

Use functional programming patterns where they fit: higher-order functions,
early returns, object and function composition, and array methods in place
of imperative loops.

## Array methods over `for`/`while` loops

Prefer `map`/`filter`/`reduce`/`find`/etc. over imperative loops.

**Why:** each call names the operation it performs (filtering, transforming,
folding), so the intent reads at the call site instead of being reconstructed
from a loop body. It also removes a whole class of off-by-one and mutation
bugs that hand-written loops invite.

```ts
// bad
const activeNames = [];
for (let i = 0; i < users.length; i++) {
  if (users[i].active) {
    activeNames.push(users[i].name);
  }
}
```

```ts
// good
const activeNames = users.filter(user => user.active).map(user => user.name);
```

## Early returns over nested conditionals

Guard clauses that return early keep the "normal path" at the lowest
indentation level, instead of buried inside a pyramid of `if` blocks.

```ts
// bad
function getDiscount(user: User) {
  if (user.isActive) {
    if (user.isPremium) {
      return 0.2;
    } else {
      return 0.1;
    }
  } else {
    return 0;
  }
}
```

```ts
// good
function getDiscount(user: User) {
  if (!user.isActive) return 0;
  if (user.isPremium) return 0.2;
  return 0.1;
}
```

## Function and object composition

Prefer composing small, pure functions over one large function doing several
things, and prefer building new objects (spread/merge) over mutating an
existing one.

```ts
// bad - one function doing parsing, validation and formatting; mutates input
function processOrder(order: Order) {
  order.total = order.items.reduce((sum, item) => sum + item.price, 0);
  order.status = order.total > 0 ? 'valid' : 'empty';
  return order;
}
```

```ts
// good - small functions, composed; no mutation
const getTotal = (order: Order) => order.items.reduce((sum, item) => sum + item.price, 0);
const getStatus = (total: number) => (total > 0 ? 'valid' : 'empty');

function processOrder(order: Order): Order {
  const total = getTotal(order);
  return { ...order, total, status: getStatus(total) };
}
```

## ramda

`ramda` is the general-purpose functional-utilities library across the
codebase - reach for it (`path`, `pick`, `omit`, `groupBy`, `pipe`, etc.)
before hand-rolling the equivalent. `DesignSystem.get()` (see
[[design-system]]) uses `ramda`'s `path()` for exactly this reason - it's
already a dependency, not something added just for that one call.

```ts
// bad - reimplements what ramda already provides
function getNested(obj: Record<string, any>, pathStr: string) {
  return pathStr.split('.').reduce((acc, key) => acc?.[key], obj);
}
```

```ts
// good
import { path } from 'ramda';

const value = path(['a', 'b', 'c'], obj);
```
