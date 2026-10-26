# Guide — adding an incident

An incident is a claim about the world. The repository's credibility rests on each one being
sourced, dated, and honestly scoped. This guide is the full procedure.

Estimated time: **20–40 minutes** per incident, most of it reading sources.

---

## 1. Choose the right file

| File                                       | Use for                                        |
| ------------------------------------------ | ---------------------------------------------- |
| `packages/seed/src/incidents-48h.ts`       | Disclosures inside the 21–23 Oct 2026 window   |
| `packages/seed/src/incidents-month.ts`     | October context, outside the 48-hour wave      |
| `packages/seed/src/incidents-watchlist.ts` | Regional, unconfirmed, or low-confidence items |

The `window` field must match the file: `"48h"` in the first, `"month"` in the other two.

## 2. Add the record

```ts
{
  slug: "example-incident",              // kebab-case, permanent, becomes the URL
  name: "Example incident",              // short enough for a 320px card
  headline: "One sentence a person could repeat.",
  summary:
    "Two or three sentences. What happened, who shipped the fix, and what an attacker gains. " +
    "No adjectives that cannot be sourced.",
  severity: "high",                      // critical | high | medium | low
  cvss: 8.1,                             // number or null — never invent one
  status: "patched",                     // active | contained | patched | unverified
  vector: "supply-chain",                // must be in VECTORS
  regions: ["global"],                   // ISO-3166 alpha-2, or "global"
  disclosedAt: "2026-10-22T09:14:00Z",   // ISO-8601 UTC, with Z
  window: "48h",
  affected: ["pkg-npm", "runtime-node"], // existing stack ids only
  mitigations: ["pin-actions", "rotate-tokens"],
  sources: [
    { label: "Vendor advisory", url: "https://example.com/advisory" },
    { label: "CVE-2026-00000", url: "https://nvd.nist.gov/vuln/detail/CVE-2026-00000" },
  ],
  iocs: ["198.51.100.24", "example-package@4.2.1"],
  exposureNote:
    "If you install packages from npm without a lockfile, this is yours. " +
    "If your lockfile is committed and CI uses --frozen-lockfile, you are probably not exposed.",
  timeline: [
    { at: "2026-10-22T09:14:00Z", label: "Disclosure", detail: "Vendor publishes an advisory." },
    { at: "2026-10-22T14:02:00Z", label: "Malicious version unpublished", detail: "Registry removes 4.2.1." },
  ],
}
```

### Field rules

- **`slug`** — permanent. A rename breaks `/atlas/<slug>`, the sitemap, API responses, and any saved
  report. If it must change, add a redirect and a changelog entry.
- **`headline`** — appears on cards. Say what happened, not how it felt.
- **`severity`** — reflects impact if you are on the path, not global drama. A compromised CA is
  `critical` even if few sites used it.
- **`cvss`** — copy from the advisory, or `null`. Never estimate.
- **`affected`** — the single most important field. If it is empty, the incident can only match by
  region and sector, which is correct for a bank breach and wrong for a package compromise.
- **`exposureNote`** — answers "does this touch me?" in plain language, including when the answer is
  "probably not, and here is why". This is the field users read most.
- **`timeline`** — chronological, UTC, at least two entries. The dataset test enforces ordering.

## 3. Reference only what exists

Every id in `affected` must exist in `packages/seed/src/stack.ts`.
Every id in `mitigations` must exist in `packages/seed/src/actions.ts`.

```bash
# Check quickly
grep -o 'id: "[^"]*"' packages/seed/src/stack.ts | sort | uniq -d
grep -o 'id: "[^"]*"' packages/seed/src/actions.ts | sort | uniq -d
```

If a component is missing, follow [adding a stack component](adding-a-stack-component.md) first.
Inventing an id that resolves to nothing silently weakens the matcher, which is worse than a missing
incident.

## 4. Update the counts

The number 27 appears in prose, not only in tests:

```bash
grep -rn "27 incidents\|27-incident\|\\b27\\b" apps packages --include=*.tsx --include=*.ts | grep -v node_modules
```

Places that usually need a edit:
- `packages/seed/src/dataset.test.ts` — the expected incident count
- `apps/web/app/page.tsx` — hero statistics
- `apps/web/app/atlas/page.tsx` — header and stats strip
- `apps/web/app/stats/page.tsx` — derived, no change needed
- `apps/web/app/manifest.ts` — description
- `apps/web/app/og/route.tsx` — the four stat tiles
- `README.md` — every count
- `CHANGELOG.md` — under "Unreleased"

## 5. Run the gates

```bash
bun run --filter @ferroscope/seed test
bun run test
bun run build
```

Expected: dataset tests pass with the new count, and the build emits 97 addressable URLs (the new
incident adds one `/atlas/<slug>` and one `/api/incidents/<slug>`). Run
`bun scripts/count-routes.mjs` and update `EXPECTED_TOTAL` in the same PR.

Then check the page in both themes:

```bash
bun run dev
# http://localhost:3000/atlas/example-incident
```

## 6. Open the PR

Use the dataset correction template if you are fixing an existing incident, or a normal PR with the
`data:` prefix if you are adding one. Include:
- The public sources, pasted as links (not screenshots)
- What changed in the score for the default profile, if anything
- A note if the incident is likely to be reclassified

```bash
git checkout -b data/example-incident
git add packages/seed/src/incidents-48h.ts packages/seed/src/dataset.test.ts
git commit -m "data(seed): add the example incident"
```

---

## Common mistakes

| Mistake                             | Symptom                              | Fix                                  |
| ----------------------------------- | ------------------------------------ | ------------------------------------ |
| `affected` references an unknown id | Matcher silently never fires         | Add the stack item first             |
| Timeline out of order               | Dataset test fails                   | Sort by `at`                         |
| `window` does not match the file    | Timeline page miscounts the wave     | Move the record                      |
| Severity inflated                   | Default profile jumps several points | Compare against a peer incident      |
| Exposure note hedges both ways      | Users cannot decide                  | Take a position, state the condition |
| CVSS invented                       | Reviewer cannot verify               | Use `null`                           |
