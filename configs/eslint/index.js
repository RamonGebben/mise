// eslint:recommended + typescript-eslint's recommended rules, derived from
// linting the mise repo itself (a Node/TS monorepo, no browser). Node globals
// are needed for the repo's own plain-.js tooling scripts - typescript-eslint
// turns `no-undef` off for .ts files (the compiler already catches that
// there), so this only matters for .js files, but a Node consumer's .ts
// files benefit from having `process`/`console`/etc. recognized too.
import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import rules from './rules.js';

export default defineConfig([
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { languageOptions: { globals: globals.node } },
  { rules },
]);
