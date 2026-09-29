// Minimal placeholder base. No non-Next project config exists yet to derive
// this from — revisit once one does. Until then this is just
// eslint:recommended + typescript-eslint's recommended rules.
import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default defineConfig([js.configs.recommended, ...tseslint.configs.recommended]);
