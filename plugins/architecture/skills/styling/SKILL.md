---
name: styling
description: styled-components conventions - the SSR registry and the Server/Client Component boundary. See [[design-system]] for how theme tokens are structured and accessed.
---

# Styling

Styling is styled-components. Never hard-code a color, shadow, or gradient
value - always go through the theme, via the typed `DesignSystem` accessor
methods documented in [[design-system]] (`theme.color()`, `theme.boxShadow()`,
`theme.gradient()`, …), not a raw property path.

## Server/Client boundary

styled-components needs a `'use client'` boundary - it cannot be used
directly in a Server Component. Wrap your styled components' consumers in a
Client Component, and apply the SSR style registry described below at the
root of the app so styles inserted on the server end up in the initial HTML.

> **Note:** no canonical registry implementation exists in this codebase yet -
> the snippet below is the standard documented pattern for styled-components
>
> - Next.js App Router, given here as a starting point. Confirm or adjust it
>   once it's actually wired up, then replace this note.

```tsx
// src/providers/StyledComponentsRegistry/index.tsx
'use client';

import { useState, type ReactNode } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { ServerStyleSheet, StyleSheetManager } from 'styled-components';

export const StyledComponentsRegistry = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [sheet] = useState(() => new ServerStyleSheet());

  useServerInsertedHTML(() => {
    const styles = sheet.getStyleElement();
    sheet.instance.clearTag();
    return <>{styles}</>;
  });

  if (typeof window !== 'undefined') return <>{children}</>;

  return (
    <StyleSheetManager sheet={sheet.instance}>{children}</StyleSheetManager>
  );
};
```
