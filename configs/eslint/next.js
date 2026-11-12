import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import rules from './rules.js';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  // eslint-config-next registers jsx-a11y but only warns on a handful of its
  // rules. Accessibility is baked in (see the accessibility plugin), so its
  // whole recommended set errors - rules only, since the plugin is already
  // registered and registering it twice is an error in flat config.
  { rules: jsxA11y.flatConfigs.recommended.rules },
  { rules },
  // Build output any Next.js project produces. Project-specific ignores
  // (generated files, tooling directories, …) belong in the consuming
  // project's own config, not here.
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);
