import { defineConfig, globalIgnores } from 'eslint/config';
import storybook from 'eslint-plugin-storybook';

export default defineConfig([
  ...storybook.configs['flat/recommended'],
  // Storybook's own build output. Other project-specific Storybook
  // tooling directories belong in the consuming project's own config,
  // not here.
  globalIgnores(['storybook-static/**']),
]);
