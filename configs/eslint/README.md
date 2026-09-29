# @pindakaasman/eslint-config

Ramon's shared ESLint config. Flat config format, targets ESLint v9+.

Three composable exports:

| Export                              | What it is                                                                 |
| ------------------------------------ | --------------------------------------------------------------------------- |
| `@pindakaasman/eslint-config`        | Generic base (`eslint:recommended` + `typescript-eslint` recommended). **Placeholder** — see note below. |
| `@pindakaasman/eslint-config/next`   | `eslint-config-next` (core-web-vitals + typescript) + Next.js build-output ignores. |
| `@pindakaasman/eslint-config/storybook` | `eslint-plugin-storybook` recommended rules + Storybook build-output ignore. |

Use the base **or** `/next`, not both — `/next` already brings full TS/React
coverage via `eslint-config-next`. Add `/storybook` on top of either when a
project uses Storybook.

> **Note on the base:** it doesn't come from an actual non-Next project yet —
> every config Ramon had on hand when this package was built was Next.js-based.
> It's a reasonable placeholder (`eslint:recommended` + `typescript-eslint`
> recommended), not a stated preference. Revisit once there's a real non-Next
> project to derive it from.

## Install

```bash
npm install --save-dev eslint @pindakaasman/eslint-config
# add these too if you use the matching export:
npm install --save-dev eslint-config-next        # for /next
npm install --save-dev eslint-plugin-storybook    # for /storybook
```

## Usage

`eslint.config.mjs`, Next.js + Storybook project:

```js
import { defineConfig, globalIgnores } from 'eslint/config';
import next from '@pindakaasman/eslint-config/next';
import storybook from '@pindakaasman/eslint-config/storybook';

export default defineConfig([
  ...next,
  ...storybook,
  // Project-specific ignores go here, not in the shared package, e.g.:
  globalIgnores(['.agents/**', 'public/mockServiceWorker.js']),
]);
```

`eslint.config.mjs`, non-Next project:

```js
import { defineConfig } from 'eslint/config';
import base from '@pindakaasman/eslint-config';

export default defineConfig([...base]);
```
