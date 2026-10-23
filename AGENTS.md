# OpenAI Translate Bob Plugin

## Non-negotiables

- Any prose surface → the unslop skill. Your reply is a prose surface.
- Before commit → the deslop skill
- For testing -> the test-audit skill

## Principles

Read the leaf skill in full for any principle you apply. Each entry names when it applies. Each leaf is the **principle-<title>** skill, with the title in kebab case, hyphens kept and other punctuation dropped, unless the entry gives its name.

### Core

- **Laziness Protocol.** Refactoring, sizing a diff, or tempted to add abstractions, layers, or signal threading. Bias to deletion and the smallest change that solves the problem.

### Delegation

- **Never Block on the Human.** Tempted to ask "should I do X?" on reversible work. Proceed, present the result, let the human course-correct.

## Pull requests

- Never make a PR unless the developer explicitly asks you to do so.
- Conventional commit titles, plain language: fix(web): new threads no longer spike CPU.
- Body: the problem in a sentence or two, then how you fixed it.
- UI changes need before/after images.
