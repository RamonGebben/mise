// Same pre-commit gate as the verification plugin's setup skill installs in
// every project, plus one repo-specific step: plugin/marketplace edits get
// validated locally instead of waiting for CI. The hook runs this with
// `--concurrent false` (JS/TS files match both the prettier and eslint globs,
// and typecheck/test must see the fixed files) and `--hide-all`, so every
// task - including the whole-project typecheck and test - sees only what's
// staged, never unstaged edits or untracked files.
const config = {
  '*': 'prettier --write --ignore-unknown',
  '*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}': 'eslint --fix',
  '{.claude-plugin,plugins}/**': () => 'claude plugin validate .',
  '**': () => ['pnpm run typecheck', 'pnpm run test'],
};

export default config;
