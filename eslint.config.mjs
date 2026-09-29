// This repo is a plain Node/TS monorepo (no React, no Next.js), so it lints
// itself with the base `@pindakaasman/eslint-config` export - the same one
// any other non-Next project would use.
import { defineConfig, globalIgnores } from 'eslint/config';
import base from '@pindakaasman/eslint-config';

export default defineConfig([
  ...base,
  globalIgnores(['**/dist/**', '**/*.md']),
]);
