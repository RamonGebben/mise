---
name: styling
description: styled-components conventions - theme tokens, SSR registry, and the Server/Client Component boundary
---

# Styling

Styling is styled-components.

## Theme tokens, never hard-coded colors

Always style from `props.theme` tokens (`theme.color.*`, `theme.shadow.*`,
`theme.gradient.*`) - never hard-code a color, shadow, or gradient value,
even though there's currently only one palette.

**Why:** tokens still resolve through CSS custom properties, which keeps
every color change to one file, and lets non-CSS contexts (e.g. `manifest.ts`,
`viewport.themeColor`) import the same raw value map instead of duplicating
hex values in a second place.

```ts
// bad - hard-coded, and duplicated the moment another file needs the same color
const Card = styled.div`
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
`;
```

```ts
// good - resolves through the token, one source of truth
const Card = styled.div`
  background: ${({ theme }) => theme.color.background};
  box-shadow: ${({ theme }) => theme.shadow.card};
`;
```

### File layout

```
src/theme/
  colors.ts       raw color values
  shadows.ts      raw shadow values
  gradients.ts    raw gradient values
  index.ts        assembles the theme shape from the above, exports the theme + its type
```

## Server/Client boundary

styled-components needs a `'use client'` boundary - it cannot be used
directly in a Server Component. Wrap your styled components' consumers in a
Client Component, and apply the SSR style registry described below at the
root of the app so styles inserted on the server end up in the initial HTML.

> **Note:** no canonical registry implementation exists in this codebase yet -
> the snippet below is the standard documented pattern for styled-components
> + Next.js App Router, given here as a starting point. Confirm or adjust it
> once it's actually wired up, then replace this note.

```tsx
// src/providers/StyledComponentsRegistry/index.tsx
'use client';

import { useState, type ReactNode } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { ServerStyleSheet, StyleSheetManager } from 'styled-components';

export function StyledComponentsRegistry({ children }: { children: ReactNode }) {
  const [sheet] = useState(() => new ServerStyleSheet());

  useServerInsertedHTML(() => {
    const styles = sheet.getStyleElement();
    sheet.instance.clearTag();
    return <>{styles}</>;
  });

  if (typeof window !== 'undefined') return <>{children}</>;

  return <StyleSheetManager sheet={sheet.instance}>{children}</StyleSheetManager>;
}
```
