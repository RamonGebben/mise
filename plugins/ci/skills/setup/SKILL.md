---
name: setup
description: Create or migrate the project's CI pipeline onto the install, verification, build, e2e and deploy stages, on whichever CI provider the project uses
---

# ci:setup

Maps the stage graph from [[pipeline]] onto the project's CI provider, and
audits an existing pipeline against it.

Follows the repo-wide contract in the mise `CLAUDE.md`'s "Project setup"
section: plan, then apply only after approval; safe to re-run on a project
that already complies.

Runs **after** the `verification` setup - the pipeline only calls the
standard scripts that setup added (`format`, `lint`, `typecheck`, `test`,
`test:e2e`), it never adds scripts or installs tools itself. If a script is
missing, leave its check out and say so in the plan.

## 1. Detect provider, package manager and scripts

- CI provider from the config already in the project
  (`.github/workflows/`, `.gitlab-ci.yml`, `.circleci/config.yml`,
  `Jenkinsfile`, `.travis.yml`). If there is none, ask which provider to
  use - don't pick one.
- Package manager from the lockfile: `pnpm-lock.yaml` → pnpm, `yarn.lock` →
  yarn, otherwise npm.
- Which scripts exist in `package.json`: `format`, `lint`, `typecheck`,
  `test`, `build`, `test:e2e`, and a deploy script.
- Whether the repo is public or private (it decides the fork pull-request
  exception).
- Whether the hosting platform deploys by itself on push (a linked Vercel
  project, for example).
- When the pipeline has a deploy stage: which branches deploy. If the
  existing pipeline or the project's docs don't make that clear, ask -
  don't assume.

## 2. Map the stages

Write the pipeline in the provider's own terms, one stage per stage in
[[pipeline]]:

- **install** - installs from the lockfile and caches the dependencies for
  the stages after it.
- **verification** - `format`, `lint`, `typecheck` and `test`, waiting for
  install.
- **build** - `build`, waiting for verification, caching its artefacts.
- **e2e** - `test:e2e` and any Lighthouse run, waiting for build and using
  its cached artefacts.
- **deploy** - the project's deploy script, waiting for e2e. Left out when
  the hosting platform deploys by itself.

A stage whose script doesn't exist is left out, and the stages after it
wait for the nearest stage before it that does exist. No `build` script
means no build stage; no `test:e2e` and no Lighthouse means no e2e stage.

## 3. Audit an existing pipeline

Check the existing config against every rule in [[pipeline]], and put each
violation in the plan:

- **Runs on every push to every branch** - not restricted to the main
  branch or to pull requests.
- **Push is the only trigger** - no pull-request trigger next to it, so a
  commit never runs the pipeline twice.
- **Public repos run fork pull requests** - a public repo has the
  pull-request trigger on, limited to pull requests from forks; a private
  repo doesn't have it at all.
- **A new push cancels the superseded run** on the same branch, where the
  provider supports it.
- **Stages are separate jobs** - install, verification, build, e2e and
  deploy each run as their own job, never merged into one.
- **Install** - dependencies are installed once and cached; no later stage
  installs from scratch.
- **Verification runs all four checks** - `format`, `lint`, `typecheck`,
  `test`, for each script that exists.
- **Parallel only when it bills less** - compare the billed time of the
  verification checks as parallel jobs against one sequential job (from the
  provider's recent run durations, counting each job's start-up and
  rounding), and propose whichever bills less.
- **Each check is its own named step** - no step chains several checks in
  one command.
- **Cancel on failure** - a failing verification check cancels the checks
  still running.
- **Build waits for verification** - not just for install.
- **Build artefacts are cached** and e2e uses them; e2e never rebuilds, and
  doesn't run against a deployed preview URL.
- **E2E holds everything that needs a build** - Playwright, Lighthouse and
  the like run after build, not inside verification.
- **Deploy waits for every stage before it**, and runs a script checked
  into the project - unless the hosting platform deploys by itself.
- **Production is protected when the platform deploys by itself** - branch
  protection requiring the pipeline, or promotion only after it's green. If
  neither is in place, put it in the plan.

An existing pipeline is migrated in the plan, never silently replaced. Steps
that aren't part of the stage graph (release automation, a project-specific
check) are left alone.

## 4. Plan and apply

Present the plan (the pipeline config created or changed, stages left out
and why) and apply only after approval.

Re-running on a project that already complies must produce an empty plan.
