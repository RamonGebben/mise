# @pindakaasman/tsconfig

Ramon's shared TypeScript configs. Targets TypeScript v5+.

Four files, meant to be extended, not used directly:

| File             | What it is                                                                                   |
| ----------------- | ----------------------------------------------------------------------------------------------- |
| `base.json`       | Universal strict settings (`strict`, `skipLibCheck`, `esModuleInterop`, …). Extended by the rest, rarely used alone. |
| `app.json`        | For apps built by a bundler (extends `base.json`): `noEmit: true`, `moduleResolution: "bundler"`. |
| `library.json`    | For packages tsc itself compiles and emits (extends `base.json`): `noEmit: false`, `declaration`, `outDir: "dist"`. **Placeholder** — see note below. |
| `nextjs.json`     | For Next.js apps (extends `app.json`): `jsx: "react-jsx"`, the `next` TS plugin.               |

> **Note on `library.json`:** no actual library tsconfig was on hand when this
> package was built — every config Ramon had was Next.js-based. It's a
> reasonable placeholder (`NodeNext` module/resolution, declaration output to
> `dist/`), not a stated preference. Revisit once there's a real library
> project to derive it from.

## Why no `paths`, `include`, or `exclude` in these files

Those options are relative-path-based and where they get resolved from (the
package's own directory vs. your project's) is inconsistent across
TypeScript versions once a base config lives inside `node_modules`. Every
project's source layout is different anyway, so these stay local to your own
`tsconfig.json` rather than baked into the shared package.

## Install

```bash
npm install --save-dev typescript @pindakaasman/tsconfig
```

## Usage

`tsconfig.json`, Next.js project:

```json
{
  "extends": "@pindakaasman/tsconfig/nextjs.json",
  "compilerOptions": {
    "paths": {
      "~/*": ["./src/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}
```

`tsconfig.json`, library that tsc compiles directly:

```json
{
  "extends": "@pindakaasman/tsconfig/library.json",
  "compilerOptions": {
    "paths": {
      "~/*": ["./src/*"]
    }
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

`~/*` (rather than the more common `@/*`) is deliberate: it avoids visual
overlap with scoped package imports like `@pindakaasman/*`.
