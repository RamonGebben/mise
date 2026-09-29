import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import rules from './rules.js';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  { rules },
  // Build output any Next.js project produces. Project-specific ignores
  // (generated files, tooling directories, …) belong in the consuming
  // project's own config, not here.
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);
