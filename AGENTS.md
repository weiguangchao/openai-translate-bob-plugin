# OpenAI Translate Bob Plugin

## Non-negotiables

The Principles section below grounds every trigger. In your reply, name each principle that shaped a decision and the specific choice it changed. Cite only principles whose leaf SKILL.md you read this session.

Remaining triggers:

- Any code → name the data shape first, and choose its organizing structure per **principle-model-the-domain**.
- Any prose surface, your reply to the user included → the **unslop** skill. Write the reply per **Writing the reply**.
- Before commit → the **deslop** skill
- Broken skill mid-task → fix it in its own PR. Don't block. Don't silently work around it.
- When reading or editing any `.ts` or `.tsx` file → the **typescript-best-practices** skill

## Principles

Read the leaf skill in full for any principle you apply. Each entry names when it applies. Each leaf is the **principle-<title>** skill, with the title in kebab case, hyphens kept and other punctuation dropped, unless the entry gives its name.

### Core

- **Laziness Protocol**. Refactoring, sizing a diff, or tempted to add abstractions, layers, or signal threading. Bias to deletion and the smallest change that solves the problem.

- **Foundational Thinking**. Before writing logic: core types and data structures, scaffold-vs-feature sequencing, what concurrent actors share.

- **Redesign from First Principles**. Integrating a new requirement into an existing design. Redesign as if it had been foundational from day one.

- **Subtract Before You Add**. Sequencing an addition, refactor, or rewrite. Remove dead weight first, then build on the simpler base.

- **Minimize Reader Load**. Reviewing or shaping code that's hard to trace. Count layers and hidden state, collapse one-caller wrappers, shrink mutable scope.

- **Outcome-Oriented Execution**. Planned rewrites and migrations with explicit phase boundaries. Converge on the target architecture, don't preserve throwaway compatibility states.

- **Experience First**. Product, UX, or feature-scope tradeoffs. Choose user delight over implementation convenience.

### Architecture

- **Model the Domain**. Writing stateful logic, or code that branches a lot or repeats a shape assumption across files. Encode the domain in a structure (state machine, typed model, table or registry, reducer, boundary, the right collection) instead of scattered conditionals.

- **Boundary Discipline**. Wiring validation, error handling, or framework adapters. Guards at system boundaries, trust internal types, keep business logic pure.

- **Type System Discipline**. Designing types or a signature in any typed language. Make illegal states unrepresentable, brand primitives, parse external data at boundaries.

- **Make Operations Idempotent**. Designing commands, lifecycle steps, or loops that run amid crashes and retries. Converge to the same end state.

- **Migrate Callers Then Delete Legacy APIs**. Introducing a new internal API while old callers exist. Migrate and delete in one wave.

- **Separate Before Serializing Shared State**. Concurrent actors might write the same file, branch, key, or object. Eliminate the sharing first.

### Verification

- **Fix Root Causes**. Debugging. Trace each symptom back to the first place the system went wrong and fix it there. A guard is a fix only when the state it handles is legitimate.

- **Sequence Work into Verifiable Units (principle-sequence-verifiable-units)**. Multi-step work (sweeps, migrations, runs of similar edits) and how you stack commits and PRs. Break work into small units that each end in a check, verify each before the next, and order delivery so the sequence proves itself.

- **Test Behavior, Not Implementation**. Writing, changing, or keeping a test. Assert what the code's users can observe, so the test fails when that behavior breaks and keeps passing when only the internals change.

### Delegation

- **Guard the Context Window**. Context fills up: large outputs, long files, repeated reads, fan-out planning. Route bulk to subagents, keep summaries in the main thread.

- **Never Block on the Human**. Tempted to ask "should I do X?" on reversible work. Proceed, present the result, let the human course-correct.

### Meta

- **Encode Lessons in Structure**. You catch yourself writing the same instruction a second time. Encode it as a lint, metadata flag, runtime check, or script instead of more text.

## Writing the reply

Write the reply clean as you draft it. A cleanup pass after drafting does not remove these patterns.

- **Short declarative sentences**. One thought per sentence, ended with a period.
- **No long-dash character anywhere**. Write a file-list bullet as a sentence ("main.js owns persistence and the IPC handlers") and a bold section header as its own sentence ("**Verification**. End to end via CDP").
- **A colon as a mid-sentence connector is also out** (unslop rule 14). A colon before a list is fine.
- **Terse is not an excuse to drop content**. Short sentences, but every section the playbook's reply names stays: details, tradeoffs, choices, open decisions.
- **Frame impact for the consumer and the maintainer**. Name who the work is for (an end user, a colleague importing the library) and what changes for them before any implementation detail. Then what the next engineer who owns this code inherits. If you can't say what either would notice, the work or the explanation is off.
- **Never fabricate a link, citation, or transcript reference**. Link only artifacts you produced or read this session.
- **Every claim carries its evidence or its label in the same sentence**. Measured, inferred, or guess. A prediction or an unseen cause is a guess. Never hand the human a check you could run.

## Pull requests

- Never make a PR unless the developer explicitly asks you to do so.
- Conventional commit titles, plain language: `fix(web): new threads no longer spike CPU`.
- Body: the problem in a sentence or two, then how you fixed it. End with the model and harness that did the work.
- UI changes need before/after images.
- Upload PR evidence to GitHub. Never commit PR-only screenshots or other PR-only assets into the repo.
- When babysitting: call `watch_pull_request` and end your turn. T3 Code wakes you on checks, comments, or conflicts. Do not poll or sleep. Verify each bot finding against the source, fix real ones, dismiss false positives with a written reason. Stay quiet when nothing is new. Stop when the bots are green on the latest commit.