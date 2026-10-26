# Security policy

## Scope

Ferroscope is a **static analytical instrument**. It has no database, no accounts, no sessions, and
no server-side storage of user profiles. The attack surface is therefore small, but it is not zero.

In scope:
- The Next.js app and its API routes (`apps/web`)
- The engine and dataset packages (`packages/*`)
- The Docker image and deployment configuration
- Supply-chain risk in the dependency graph
- Any path that could cause a declared profile to leave the browser without consent

Out of scope:
- The accuracy of third-party incident reporting (use the dataset correction template instead)
- Findings that require a compromised browser, OS, or physical access
- Denial of service through volumetric traffic (Vercel and Fly absorb this at the edge)
- Missing headers that have no practical effect on a static, script-light site

## Reporting

**Do not open a public issue.**

Use GitHub's private vulnerability reporting:
<https://github.com/aniruddhaadak80/ferroscope/security/advisories/new>

Include:
- The affected route, file, or package
- A reproduction that does not require your real profile
- Impact: what an attacker gains, and what they need first
- Whether the issue is already public

You will get an acknowledgement within **72 hours** and a decision within **7 days**. If the report
is valid, the fix ships before the advisory is published, and you are credited unless you ask not to
be.

## What this project promises

| Promise                                                 | How it is enforced                                                                         |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Profiles never leave the browser unless you export them | `localStorage` only; API routes accept a body and persist nothing                          |
| No telemetry                                            | No analytics package, no third-party script, no cookie banner because there are no cookies |
| No secrets in the repository                            | `.env.example` contains placeholders only; CI does not need keys                           |
| Reproducible output                                     | Deterministic engine, seed 2718, no `Math.random()` in `packages/core`                     |
| Dependencies are visible                                | `bun.lock` committed; Dependabot weekly; CodeQL on every push                              |

## Deployment hardening

The shipped configurations already do the following:
- `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and a
  restrictive `Permissions-Policy` via `vercel.json`
- `poweredByHeader: false` in `next.config.ts`
- The Docker image runs as a non-root user with a read-only application tree
- API bodies are validated with zod before they reach the engine; invalid input returns 422 with
  field errors and is never coerced

If you self-host, put the container behind TLS. The app does not redirect HTTP to HTTPS itself.

## Supported versions

| Version | Supported |
| ------- | --------- |
| 0.1.x   | Yes       |
| < 0.1   | No        |

This is a single-maintainer project. Fixes land on `main` and deploy continuously.
