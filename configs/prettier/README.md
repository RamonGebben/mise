# @pindakaasman/prettier-config

Ramon's shared Prettier config. Targets Prettier v3.

## Install

```bash
npm install --save-dev prettier @pindakaasman/prettier-config
```

## Usage

In `package.json`:

```json
{
  "prettier": "@pindakaasman/prettier-config"
}
```

Or in `prettier.config.js`:

```js
export default '@pindakaasman/prettier-config';
```

### Overriding a rule

```js
import base from '@pindakaasman/prettier-config';

export default {
  ...base,
  printWidth: 100,
};
```

## What it sets

| Option         | Value   | Note                                              |
| -------------- | ------- | -------------------------------------------------- |
| `printWidth`   | `80`    |                                                     |
| `semi`         | `true`  |                                                     |
| `singleQuote`  | `true`  |                                                     |
| `trailingComma`| `'all'` |                                                     |
| `tabWidth`     | `2`     |                                                     |
| `useTabs`      | `false` |                                                     |
| `bracketSpacing`| `true` |                                                     |
| `arrowParens`  | `'avoid'` | Deliberate: bare params on single-arg arrows (`x => x`), not Prettier's current default. |
