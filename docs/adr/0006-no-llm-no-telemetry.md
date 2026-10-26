# ADR 0006 — No LLM, no telemetry, no live feed

- **Status:** Accepted
- **Date:** 2026-10-22
- **Deciders:** Aniruddha Adak

## Context

Three capabilities are almost default in 2026 products, and all three were considered seriously:
1. **An LLM to summarise incidents** and personalise the exposure note.
2. **Analytics** to see which routes people actually use.
3. **A live feed** so the atlas stays current without a release.

Each would improve some metric. Each would also break a property the product claims on its own About
page.

## Decision

**None of the three ships.**

### No LLM in the explanation path

Incident summaries, exposure notes, and remediation steps are written by a human, reviewed, and
versioned in `packages/seed`. The engine's explanations are composed from structured fields
(`reasons`, `summary`, `exposureNote`), not generated at request time.

Why: an explanation that changes between runs cannot be audited, cannot be cited, and cannot be
tested. It also cannot be cached honestly, and it introduces a network dependency into a product that
works on a plane. The dataset is 27 incidents — small enough that careful writing is cheaper than a
prompt pipeline and better than its output.

### No telemetry

No analytics script, no session replay, no error reporter that serialises state, no third-party font
request at build or runtime (the three families are vendored into `apps/web/fonts` and served from our
own bundle). The only counters are the ones in the repository: tests, routes, and LOC.

Why: the input to this product is a security inventory. Even "anonymous" event data can fingerprint a
stack. A privacy policy that says "we collect nothing" is stronger than one that says "we collect
carefully", and it is verifiable by reading `package.json`.

### No live feed

The dataset is a dated snapshot (`2026.10.23`). Reports name the version they used. Updating the data
is a pull request with sources, not a cron job.

Why: reproducibility. A report generated in November must still be explainable in December. A live
feed silently changes the meaning of a saved PDF. Freshness is traded for auditability, and the
`/changelog` page makes the trade visible.

## Consequences

**Good**
- The whole product is inspectable in an afternoon: no hidden prompt, no vendor, no data flow.
- Deterministic output makes screenshots, tests, and reports trustworthy.
- Deployment needs no keys, so a fork works immediately and CI cannot leak a secret.
- The ethical claim on `/about` is true rather than aspirational.

**Bad**
- The dataset ages. Mitigation: version it, date it, and invite corrections through a template that
  requires a source.
- No usage data means prioritisation is judgement, not measurement. Accepted for a single-maintainer
  project.
- Writing 27 exposure notes by hand took longer than prompting would have. The notes are also
  better, and they can be reviewed in a diff.

## Enforcement

- `bun.lock` contains no analytics or AI SDK; a reviewer can check in seconds.
- CI runs CodeQL and Dependabot; a new network-capable dependency is visible in the PR.
- The refusals are published on `/roadmap` so a future contributor knows the boundary before writing
  code.
- If a future maintainer wants to reverse this, it requires a superseding ADR and a change to the
  About page — not a quiet dependency.

## Alternatives considered

- **LLM with a fixed seed and cached output.** Rejected: cache invalidation becomes a correctness
  problem, and the cache is still a network dependency.
- **Self-hosted analytics (Plausible, Umami).** Rejected: still a data flow, still a consent
  question, still a script.
- **Opt-in anonymous aggregation.** Rejected: opt-in rates are low, and the resulting numbers would
  be misleading enough to be worse than none.

## Related

- [ADR 0003 — No database](0003-no-database-localstorage.md)
- `/roadmap` → Refusals
- `/about` → Principles
