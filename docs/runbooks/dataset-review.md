# Runbook — dataset review

Run this before tagging a release that changes `packages/seed`. It takes about twenty minutes and
catches the class of error that tests cannot: claims that are internally consistent but externally
wrong.

---

## 1. Mechanical checks

```bash
bun run --filter @ferroscope/seed test
bun run --filter @ferroscope/core test
bun run build
```

What the suite already guarantees:
- Exactly 27 incidents, matching the published count
- Every `affected` id resolves to a stack item
- Every `mitigations` id resolves to an action
- Every timeline is chronological
- Every source has a label and an absolute URL
- The default profile computes risk 58 / score 42

## 2. Source hygiene

For each incident you touched, open every source. Then confirm:
- [ ] The URL resolves without a login or a paywall
- [ ] The page still says what the `summary` claims
- [ ] The `disclosedAt` date matches the source, in UTC
- [ ] The vendor's own advisory is present, not only secondary reporting
- [ ] No source is a search result, an aggregator, or a screenshot

```bash
# Print every source grouped by incident for a quick scan
bun -e '
const { INCIDENTS } = await import("./packages/seed/src/index.ts");
for (const i of INCIDENTS) {
  console.log(`\n${i.slug} (${i.disclosedAt})`);
  for (const s of i.sources) console.log(`  ${s.label} — ${s.url}`);
}'
```

## 3. Severity calibration

Sort by severity and read the criticals together. They should feel comparable.

```bash
bun -e '
const { INCIDENTS } = await import("./packages/seed/src/index.ts");
for (const s of ["critical","high","medium","low"]) {
  const set = INCIDENTS.filter(i => i.severity === s);
  console.log(`\n${s.toUpperCase()} (${set.length})`);
  for (const i of set) console.log(`  ${i.slug} — cvss ${i.cvss ?? "—"} — ${i.vector}`);
}'
```

Red flags:
- A critical with `cvss: null` and no explanation
- A low-severity incident whose `exposureNote` says "act now"
- Two incidents of the same severity where one is clearly a footnote and the other is a root CA

Severity is **impact if you are on the path**, not global newsworthiness.

## 4. Exposure notes

Read every note you changed and ask three questions:
1. Does it name a condition the reader can evaluate? ("If you install without a lockfile…")
2. Does it avoid claiming compromise? ("exposed", never "breached")
3. Does it tell the reader what to do, or explicitly say nothing is required?

A note that says "stay vigilant" is a failure. Replace it with a condition or delete the field.

## 5. Regional scoping

```bash
bun -e '
const { INCIDENTS } = await import("./packages/seed/src/index.ts");
for (const i of INCIDENTS.filter(i => i.affected.length === 0)) {
  console.log(`${i.slug} — ${i.vector} — ${i.regions.join(",")}`);
}'
```

Incidents with no stack surface match by region. Verify that:
- `banking` incidents require `profile.bank` (they do, in `matchIncident`)
- `data-breach` and `state-actor` match on region alone
- A `global` region never triggers the regional branch (`isRegional` returns false)

If an incident with no surface is **not** one of those three vectors, it can never match. Either give
it a surface or reclassify it.

## 6. Version and counts

- [ ] `SEED.version` in `packages/seed/src/index.ts` is the release date
- [ ] Every "27" in prose still says 27 (see the grep in `adding-an-incident.md`)
- [ ] `CHANGELOG.md` has an entry naming the dataset version
- [ ] `/changelog` has a matching entry
- [ ] The README's dataset table is unchanged or updated

## 7. Regression check on the default profile

```bash
bun -e '
const { DEFAULT_PROFILE, INCIDENTS, STACK_CATALOG } = await import("./packages/seed/src/index.ts");
const { computeExposure } = await import("./packages/core/src/index.ts");
const r = computeExposure(DEFAULT_PROFILE, INCIDENTS, STACK_CATALOG);
console.log({ risk: r.risk, score: r.score, band: r.band, exposed: r.exposed.map(m => m.incident.slug) });'
```

Expected for 0.1.x:

```
{ risk: 56, score: 44, band: "exposed", exposed: [ "emudhra", "sbi" ] }
```

A change here is a product change. It needs a changelog line explaining why the default laptop's
exposure moved.

## 8. Sign-off

Record in the PR:
- Which incidents changed and why
- The default profile delta (risk before → after)
- Any source that has gone dark and how you replaced it
- A note on anything you were unsure about, so the next reviewer knows where to look

Then tag. The dataset version is a date; the app version is semver; both appear in exported reports.
