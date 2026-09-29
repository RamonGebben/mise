// Stated preferences shared across every variant of this config - not
// specific to Next.js vs. a generic project, so lives once instead of
// duplicated between index.js and next.js.
export default {
  // Array<T> over T[] - see the typescript plugin's conventions skill.
  '@typescript-eslint/array-type': ['error', { default: 'generic' }],
  '@typescript-eslint/no-explicit-any': 'error',
  // Arrow functions over `function` - see the architecture plugin's
  // functional-style skill. `func-style` bans declarations; a `function`
  // expression stays allowed for the rare case that needs its own `this`.
  'func-style': ['error', 'expression'],
  'prefer-arrow-callback': 'error',
  'no-restricted-syntax': [
    'error',
    {
      selector: 'TSEnumDeclaration',
      message:
        "Use a union of string literals instead of enum - see the typescript plugin's conventions skill.",
    },
  ],
};
