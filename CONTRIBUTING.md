# Contributing to Ferroscope

Ferroscope is a small instrument with a narrow contract: **declared stack in, deterministic
exposure report out.** Most contributions that respect that contract are welcome, and the ones that
break it will be declined even when they are well built.

Read [the method](https://ferroscope.vercel.app/method) before changing a number. Every score on the
site has a formula in `packages/core`, and a test that pins it.

---

## Setup

```bash
git clone https://github.com/aniruddhaadak80/ferroscope.git
cd ferroscope
bun install
bun run dev          # http://localhost:3000
```

Requirements: **Bun 1.2+** (the repo pins 1.3.14) and **Node 22+** for the production server. No
API keys, no database, no Docker required for development.

### The five commands that matter

```bash
bun run typecheck    # tsc --noEmit across every workspace
bun run lint         # biome check .
bun run test         # vitest, 80 tests
bun run build        # next build, must emit 95 addressable URLs
bun run test:e2e     # playwright, needs a build first
```

`bun run verify` chains typecheck, lint, test, and build. CI runs the same chain plus Docker and
Playwright.

---

## Repository shape

```
apps/web            Next.js 15 app: routes, API handlers, client components
packages/core       Pure engine: matcher, graph, cascade, planner, trust
packages/seed       27 incidents, 55 stack items, 24 actions, 8 playbooks
packages/ui         30+ primitives, design tokens, motion wrappers
packages/sdk        zod schemas and a typed fetch client
packages/config     Shared tsconfig and vitest base
scripts             Asset generation, LOC count, route count
e2e                 Playwright specs
docs                ADRs, guides, runbooks, generated assets
```

Dependency direction is one-way: `seed → core → ui → web`. `core` never imports React, `seed` never
imports `core` at runtime beyond types, and `ui` never imports `seed`.

---

## What belongs in a pull request

| Change               | Accepted when                                                   |
| -------------------- | --------------------------------------------------------------- |
| A new incident       | It has a public source, a timeline, and an honest exposure note |
| A new stack item     | The matcher can reason about it; it is not decoration           |
| A scoring change     | The formula, the test, and the method page all change together  |
| A new route          | It answers a question the other routes do not                   |
| A visual change      | Dark and light, desktop and mobile, screenshots in the PR       |
| A performance change | Before/after numbers from `next build`                          |
| A dependency         | It removes more code than it adds, or it is genuinely required  |

### What gets declined

- An account system, a login wall, or email capture.
- A live threat feed that makes reports non-reproducible.
- An LLM anywhere in the explanation path.
- A scanner that uploads inventory.
- Analytics, session replay, or any third-party script.
- A new colour that is not in the token file.
- "Improvements" that change scores without updating the method page.

These are not stylistic preferences. Each one breaks a promise the product makes on its own About
page.

---

## Adding an incident

This is the most common contribution. The short version:
1. Add the record to the right file in `packages/seed/src/`:
   - `incidents-48h.ts` for the two-day wave
   - `incidents-month.ts` for month-scale context
   - `incidents-watchlist.ts` for regional or unconfirmed items
2. Give it a stable `slug`. Slugs are URLs; renaming one breaks links.
3. Fill `sources` with at least one public, non-paywalled URL.
4. Set `affected` to stack ids that already exist in `stack.ts`. If none fit, add the component
   first — do not invent an id.
5. Write `exposureNote` in plain language. It answers "does this touch me?" without hedging.
6. Make `timeline` chronological. The dataset test enforces this.
7. Run:

```bash
bun run --filter @ferroscope/seed test
bun run test
bun run build
```

The dataset test asserts the incident count, that every `affected` and `mitigations` reference
resolves, and that timelines are ordered. If you add an incident, update the expected count in
`packages/seed/src/dataset.test.ts` **and** the copy that says "27" on the home page, atlas, stats,
and manifest. Sixty seconds of search:

```bash
grep -rn "27 incidents\|27-incident\|\"27\"" apps packages --include=*.tsx --include=*.ts
```

Full walkthrough: [`docs/guides/adding-an-incident.md`](docs/guides/adding-an-incident.md).

---

## Changing the model

The exposure model is four files and one contract.

```
packages/core/src/exposure.ts   matching, mitigation, saturation
packages/core/src/planner.ts    risk-per-minute, residual risk
packages/core/src/blast.ts      graph construction and layout
packages/core/src/cascade.ts    twelve-frame narrative
```

Rules:
- **Pure functions only.** No `Date.now()`, no `Math.random()`, no I/O.
- **Determinism is testable.** If output depends on iteration order, sort first.
- **Pin the numbers.** A scoring change updates `packages/core/src/*.test.ts` with the new expected
  values, and the table on `/method`.
- **Never exceed the caps.** Mitigation is capped at 0.8; residual risk can approach zero but never
  cross it. Tests assert both.

If you are unsure whether a change is a model change or a presentation change, it is a model change.

---

## Style

- TypeScript strict, `exactOptionalPropertyTypes` on. No `any` — Biome fails the build.
- ESM everywhere. No CommonJS in source.
- Tailwind v4 utilities with tokens from `apps/web/app/globals.css`. No arbitrary hex values in
  components; add a token instead.
- Server components by default. `"use client"` only where state, effects, or browser APIs are
  actually needed.
- Comments explain _why_. The code already says what.
- Copy is part of the design: short sentences, concrete nouns, no exclamation marks, no "revolutionise".

Format before committing:

```bash
bun run lint:fix
```

---

## Commits and branches

Conventional commits, one logical change each:

```
feat(atlas): add a severity filter that persists in the URL
fix(planner): clamp residual risk at zero after the final action
data(seed): correct the eMudhra disclosure date
docs(adr): record the no-database decision
```

Branch names: `feat/…`, `fix/…`, `data/…`, `docs/…`.

---

## Review

A review checks four things, in order:
1. **Is the claim true?** Numbers, sources, and dates.
2. **Is it deterministic?** Same input, same output.
3. **Does it respect the refusals?** No account, no feed, no LLM, no telemetry.
4. **Does it look like the rest of the instrument?** Tokens, spacing, typography, motion.

Expect comments about copy. The writing is part of the product.

---

## Security

Do not open a public issue for a vulnerability. See [SECURITY.md](SECURITY.md).

## Conduct

Participation is covered by the [Code of Conduct](CODE_OF_CONDUCT.md).
