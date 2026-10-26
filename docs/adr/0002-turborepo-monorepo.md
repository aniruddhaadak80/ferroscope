# ADR 0002 — A Turborepo with six workspaces and one app

- **Status:** Accepted
- **Date:** 2026-10-20
- **Deciders:** Aniruddha Adak

## Context

The product has three genuinely separable concerns:
1. **An engine** that must be testable without React, without Next, and without a browser.
2. **A dataset** that must be reviewable as data, not buried in components.
3. **A presentation layer** with more than twenty routes, a design system, and interactive views.

Putting all three in `apps/web` would have been faster for the first day. It would also have made the
scoring math untestable in isolation, invited `import { INCIDENTS }` inside UI primitives, and turned
every dataset review into a component diff.

## Decision

Use a Turborepo with explicit package boundaries:

```
apps/web          Next.js 15, React 19, route handlers, client views
packages/core     Pure TypeScript engine — zero runtime dependencies
packages/seed     Dataset as typed modules — depends on core for types only
packages/ui       Primitives and tokens — depends on neither core nor seed
packages/sdk      zod schemas + typed client for the HTTP API
packages/config   Shared tsconfig and vitest base
```

Dependency direction is enforced socially and by review:

```
seed ──types──▶ core ──▶ ui ──▶ web
  │                              ▲
  └──────────────▶ web ──────────┘
```

- `core` may not import React, Next, or any package in this repository except `config` types.
- `ui` may not import `seed`. If a primitive needs an incident, the page passes it in.
- `seed` imports `core` only with `import type`.

Turborepo tasks: `build` depends on `^build`; `test` depends on `^build`; `typecheck` depends on
`^typecheck`. A change to `core` invalidates `web` automatically.

## Consequences

- `bun run test` runs 54 engine tests in ~1.7 s without booting Next.
- The dataset can be reviewed by someone who does not know React.
- Installing is slower (262 packages) and the build has one extra layer of indirection.
- Every new shared package must justify its existence; the default is to add a file, not a package.

## Alternatives considered

- **Single Next.js app.** Rejected: the engine would be tested through the framework, which hides
  determinism bugs behind bundler behaviour.
- **Nx.** Rejected: heavier configuration for a repository with one app.
- **Separate repositories.** Rejected: the dataset, engine, and UI change together; version skew
  would be constant.
- **Bun workspaces without Turborepo.** Viable, but the task graph and remote-cache hooks are worth
  the single config file.
