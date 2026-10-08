---
name: pipeline
description: The shape of a CI/CD pipeline whatever the provider - the install, verification, build, e2e and deploy stages, what each one waits for, what runs in parallel and what gets cancelled
---

# CI pipeline

GitHub Actions, GitLab CI, CircleCI, Jenkins and Travis all spell it
differently, but the pipeline is the same one everywhere: the same stages,
in the same order, waiting on the same things. This skill is that shape.
[[setup]] maps it onto whichever provider the project uses.

The stages call the standard script names the `verification` plugin's setup
adds to every project (`format`, `lint`, `typecheck`, `test`, `test:e2e`),
plus the project's `build` script.

## When it runs

**On every push, to every branch.** Not only on the main branch, and not
only once a pull request exists.

**Why:** the pipeline has then already run by the time the pull request is
opened - its result is there from the start instead of being the first
thing the pull request waits for. It's also what makes a pull-request
trigger unnecessary (below).

**Push is the only trigger.** Where the provider also has a pull-request
trigger, it stays off.

**Why:** a branch with an open pull request would otherwise run the
pipeline twice for the same commit, once per trigger, and bill twice for
one answer.

```
# bad - every push to a branch with an open pull request runs twice
on: push, pull_request

# good - one run per commit
on: push
```

**Exception - public repos run pull requests from forks.** A fork's push
happens in the fork, so it never triggers the pipeline here; with push as
the only trigger, a contributor's pull request would get no run at all. A
public repo therefore also turns the pull-request trigger on, limited to
pull requests whose branch lives in a fork. Pull requests from the repo's
own branches still run on push only.

**A new push cancels the run it supersedes.** When a push lands on a branch
whose pipeline is still running, the older run is cancelled, wherever the
provider can do that.

**Why:** the older run's result describes a commit that is no longer the
head of the branch, so nobody will act on it - finishing it only adds
billed time.

## The stages

```
install -> verification -> build -> e2e -> deploy
```

Each stage starts only when the one before it passed.

**Every stage is its own job**, always - also on a small project where one
job running everything in sequence would bill less. The billed-time
trade-off under Verification decides how the checks _inside_ that stage
run; it never merges stages.

**Why:** a failure should say what failed before anyone opens a log.
"build failed" or "e2e failed" in a notification tells you where to look
from the start; "CI failed" tells you nothing. Separate jobs also keep each
stage's logs and artefacts apart, so inspecting one doesn't mean scrolling
through the others. That clarity is worth the extra start-up time.

```
# bad - one job; the notification reads "ci failed"
ci: install, format, lint, typecheck, test, build, test:e2e

# good - the notification names the stage: "e2e failed"
install -> verification -> build -> e2e
```

| Stage        | Runs                                                  | Hands on to later stages |
| ------------ | ----------------------------------------------------- | ------------------------ |
| install      | install dependencies from the lockfile                | the dependency cache     |
| verification | `format`, `lint`, `typecheck`, `test`                 | nothing                  |
| build        | `build`                                               | the build artefacts      |
| e2e          | `test:e2e`, Lighthouse, anything else needing a build | nothing                  |
| deploy       | deploy the build                                      | -                        |

### Install

Install the dependencies once and cache them, so every later stage restores
them instead of installing again.

**Why:** every stage needs `node_modules`. Installing per stage pays the
same cost several times over for an identical result.

### Verification

The checks that only need the source code: unit tests, linter, formatting
and type-checking.

**In parallel only when that bills less.** Billed CI time is the cost that
counts, and it's kept as low as possible. Whether the checks run as
parallel jobs or one after another in a single job follows from that alone:
split them up once the parallel jobs together bill less than the single
job, and not before.

**Why billed time, not wall-clock time:** every parallel job pays for its
own start-up (checkout, restoring the dependency cache) and is billed
separately, usually rounded up. Splitting four short checks over four jobs
finishes sooner but bills more than running them in one. A faster pipeline
that costs more is not the goal.

```
# bad - four jobs, each billed a minute of start-up for seconds of work
install -> format | lint | typecheck | test

# good - the checks are short, so one job runs them in sequence
install -> format, lint, typecheck, test
```

**Each check is named on its own.** Also when the checks share one job,
every check is its own named step - never one step chaining them
(`lint && typecheck && test`) - so a failure reads "lint failed", not just
"verification failed".

**Why:** the same reason stages are separate jobs - the failure message
should say what broke before anyone opens a log.

**A failing check cancels the others.** The first check to fail stops the
checks still running, and nothing after verification starts.

**Why:** the pipeline is already red. The remaining checks would only spend
compute to make it red twice.

### Build

Build the project and cache the artefacts for the stages after it.

**Build waits for verification**, even though it only needs the install to
run.

**Why:** there's no point building - and then e2e testing - something
verification already showed to be broken, whether in the small (a type
error, a failing unit test) or in the large. Waiting costs a little
wall-clock time on a green pipeline and saves the whole build and e2e stage
on a red one.

```
# bad - build starts alongside verification, and runs to completion on
# code the linter is about to reject
install -> verification
        -> build -> e2e

# good - a red verification stops the pipeline before anything gets built
install -> verification -> build -> e2e
```

### E2E

Everything that tests the real, built project rather than the code:
Playwright e2e tests, Lighthouse, and the like. It runs against the
artefacts the build stage cached - it never builds again, and it doesn't
test a deployed preview URL instead, even when the hosting platform made
one.

**Why the pipeline's own build:** it's the exact build the earlier stages
led up to and the one the deploy stage ships, and testing it doesn't depend
on a deployment outside the pipeline having finished.

**Why a separate stage from verification:** these tests need the build, so
they can't start before it, and they're the slowest and most expensive part
of the pipeline - they only run on code that already passed everything
cheaper.

### Deploy

Deploy the build once every stage before it passed.

When the hosting platform deploys by itself on push (Vercel, for example),
the deploy has already happened alongside the pipeline and there is no
deploy stage to write. That deploy isn't gated on verification, which is
fine: it's only a preview. Production is protected another way - branch
protection, or promoting a deployment only after the pipeline is green.

Otherwise the project has its own deploy script, checked into the project,
and the deploy stage runs that.

Which branches deploy - every branch, or only the main one - differs per
project. It isn't a convention: when the project doesn't make it clear,
ask.

**Why a script in the project:** the same deploy can then be run and
debugged locally, and it moves with the project instead of living in one
provider's config.
