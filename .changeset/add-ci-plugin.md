---
'@pindakaasman/ci-plugin': minor
'@pindakaasman/verification-plugin': patch
'@pindakaasman/init-plugin': patch
'@pindakaasman/mise-place': minor
---

Add the `ci` plugin: `ci:pipeline` describes the provider-agnostic stage
graph (install, verification, build, e2e, deploy - what waits for what,
what runs in parallel, what gets cancelled) and `ci:setup` creates or
migrates a project's pipeline onto it. `verification:setup` no longer
touches CI, `init:setup` runs `ci` last, and `mise-place` installs it.
