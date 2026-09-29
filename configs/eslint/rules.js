// Stated preferences shared across every variant of this config - not
// specific to Next.js vs. a generic project, so lives once instead of
// duplicated between index.js and next.js.
export default {
  // Array<T> over T[] - see the typescript plugin's conventions skill.
  '@typescript-eslint/array-type': ['error', { default: 'generic' }],
  '@typescript-eslint/no-explicit-any': 'error',
  'no-restricted-syntax': [
    'error',
    {
      selector: 'TSEnumDeclaration',
      message:
        "Use a union of string literals instead of enum - see the typescript plugin's conventions skill.",
    },
  ],
};
