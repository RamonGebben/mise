// Same pre-commit gate as the verification plugin's setup skill installs in
// every project, plus one repo-specific step: plugin/marketplace edits get
// validated locally instead of waiting for CI.
export default {
  '*': 'prettier --write --ignore-unknown',
  '*.{js,jsx,ts,tsx,mjs,cjs}': 'eslint --fix',
  '{.claude-plugin,plugins}/**': () => 'claude plugin validate .',
};
