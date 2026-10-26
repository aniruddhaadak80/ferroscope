# ADR 0003 — No database: profiles live in localStorage

- **Status:** Accepted
- **Date:** 2026-10-20
- **Deciders:** Aniruddha Adak

## Context

Ferroscope asks a person to declare their operating system, browsers, runtimes, hosting, certificate
authorities, accounts, and banking region. That is **inventory**, and inventory is the most sensitive
data a security product can hold. It is also the data most likely to be subpoenaed, leaked, or
quietly resold.

The conventional architecture is obvious: a `profiles` table, an auth provider, and a "your data is
encrypted" paragraph. It would also introduce the exact risk the product warns about — a central
store whose compromise turns every user's declared stack into an attacker's shopping list.

A second constraint matters: the whole product is reproducible from files in git. A database would
add a runtime dependency that can drift, expire, or be restored from the wrong backup.

## Decision

**There is no database.** The profile is stored in `localStorage` under
`ferroscope.profile.v1`. The API routes are stateless computations: they accept a profile in the
request body, run pure functions, and return a report. Nothing is written, logged, or cached
server-side.

Concretely:
- `apps/web/lib/store.ts` — zustand + `persist`, `partialize` limits storage to `profile` and
  `completed`.
- Every `/api/*` handler validates with zod and calls into `packages/core`.
- No middleware reads the profile. No analytics event contains it. No error reporter serialises it.
- Export is explicit: the report page offers JSON download and print-to-PDF, both client-side.
- Reset is explicit: settings removes the storage key and resets in-memory state.

Hydration is handled with a mount flag (`useProfileHydrated`) rather than
`persist.hasHydrated()`, because the latter runs during prerender where the persist API is
undefined. Before mount, the UI renders an empty model; after mount, the stored one. That keeps
server and client markup identical.

## Consequences

**Good**
- A breach of the deployment cannot leak a single profile. There is nothing to leak.
- The product works offline after first load, and in a Docker container with no outbound network.
- No auth means no password reset, no session fixation, no OAuth misconfiguration, no GDPR data
  processor relationship.
- Hosting is cheap enough to stay free.

**Bad**
- Profiles do not follow a person across devices. This is stated in the UI rather than hidden.
- Clearing site data deletes the profile. Export exists for that reason.
- Server-side aggregation is impossible. There is no "12,000 developers are exposed to X" statistic,
  and there never will be from this app.
- The API is still public. Anyone can POST a profile and get a report; that is the intended contract.

## Alternatives considered

- **Postgres + anonymous sessions.** Rejected: creates the liability the product exists to avoid.
- **Encrypted client-side blob in a database.** Rejected: key management moves the problem rather
  than solving it, and metadata still leaks.
- **URL-encoded profile.** Useful for sharing, rejected for storage: URLs leak through referrers,
  history, and screenshots. It remains on the roadmap as an explicit, opt-in comparison link.
- **IndexedDB.** Rejected: no benefit over `localStorage` for a sub-10 KiB object, and a harder API.

## Related

- [ADR 0006 — No LLM, no telemetry](0006-no-llm-no-telemetry.md)
- `apps/web/lib/store.ts`
- `/settings` → Data card
