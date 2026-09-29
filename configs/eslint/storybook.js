import { defineConfig, globalIgnores } from 'eslint/config';
import storybook from 'eslint-plugin-storybook';

export default defineConfig([
  ...storybook.configs['flat/recommended'],
  // Storybook's own build output. Project-specific Storybook tooling
  // directories (design-sync, ds-bundle, …) belong in the consuming
  // project's own config, not here.
  globalIgnores(['storybook-static/**']),
]);
