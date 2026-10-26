# Architecture decision records

Short, numbered, immutable records of decisions that are expensive to reverse. The format and the
rules are in [ADR 0001](0001-record-architecture-decisions.md).

| #                                             | Decision                                    | Status   | Date       |
| --------------------------------------------- | ------------------------------------------- | -------- | ---------- |
| [0001](0001-record-architecture-decisions.md) | Record architecture decisions               | Accepted | 2026-10-20 |
| [0002](0002-turborepo-monorepo.md)            | A Turborepo with six workspaces and one app | Accepted | 2026-10-20 |
| [0003](0003-no-database-localstorage.md)      | No database: profiles live in localStorage  | Accepted | 2026-10-20 |
| [0004](0004-deterministic-engine-seed.md)     | A deterministic engine with a fixed seed    | Accepted | 2026-10-21 |
| [0005](0005-exposure-scoring.md)              | How exposure is scored                      | Accepted | 2026-10-21 |
| [0006](0006-no-llm-no-telemetry.md)           | No LLM, no telemetry, no live feed          | Accepted | 2026-10-22 |

## Reading order

If you have five minutes, read **0003** and **0005**. They explain why the product has no backend and
why its central number is shaped the way it is. Everything else is structure around those two
choices.

## Superseding a decision

Create `NNNN-title.md` with `Status: Accepted`, and change the old record's status line to
`Superseded by ADR-NNNN`. Do not edit the old record's reasoning. The history is the point.
