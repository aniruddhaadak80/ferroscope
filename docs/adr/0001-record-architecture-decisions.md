# ADR 0001 — Record architecture decisions

- **Status:** Accepted
- **Date:** 2026-10-20
- **Deciders:** Aniruddha Adak

## Context

Ferroscope makes claims about security posture. Its numbers are used to decide what a person fixes
first. That kind of product accumulates quiet decisions — a cap here, a shortcut there — which
become impossible to defend two months later if nobody wrote down why they exist.

The project has no committee. The only reviewer is the author and, later, a stranger reading the
repository. A decision record is the cheapest way to make that stranger's job possible.

## Decision

Every decision that is expensive to reverse gets a numbered record in `docs/adr/`, using the format:

```
# ADR NNNN — Title

- Status: Proposed | Accepted | Superseded by ADR-XXXX | Deprecated
- Date: YYYY-MM-DD
- Deciders: names

## Context
## Decision
## Consequences
## Alternatives considered
```

Rules:
1. Records are immutable once accepted. A reversal is a new record that supersedes the old one.
2. The number is permanent, even if the decision is later undone.
3. Code comments may link to an ADR, but the ADR must stand alone.
4. An ADR is required for: storage, data model, scoring, dependency direction, deployment topology,
   and anything the product publicly refuses to do.

## Consequences

- The repository contains prose that must be maintained. Accepted; the cost is paid once per
  decision.
- New contributors can read six short files instead of reverse-engineering intent from code.
- The `refusals` list on `/roadmap` has a citable origin.

## Alternatives considered

- **A single ARCHITECTURE.md.** Rejected: it becomes a stale monolith, and edits erase history.
- **Commit messages only.** Rejected: they explain what changed, not why the alternative was worse.
- **A wiki.** Rejected: it lives outside the code, so it is never read during review.
