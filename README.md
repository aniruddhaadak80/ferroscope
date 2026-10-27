<div align="center">

<img src="docs/assets/banner.svg" alt="Ferroscope — map your blast radius before the breach does" width="100%">

# Ferroscope

**Map your blast radius before the breach does.**

27 incidents landed in 48 hours. Declare the stack you actually run, see which ones intersect it,
then rank the fixes by **risk removed per minute**.

[![CI](https://github.com/aniruddhaadak80/ferroscope/actions/workflows/ci.yml/badge.svg)](https://github.com/aniruddhaadak80/ferroscope/actions/workflows/ci.yml)
[![CodeQL](https://github.com/aniruddhaadak80/ferroscope/actions/workflows/codeql.yml/badge.svg)](https://github.com/aniruddhaadak80/ferroscope/actions/workflows/codeql.yml)
![license](https://img.shields.io/badge/license-MIT-8fb996)
![next](https://img.shields.io/badge/Next.js-15-f2eee4)
![react](https://img.shields.io/badge/React-19-f0a63c)
![routes](https://img.shields.io/badge/routes-95-e5644a)
![tests](https://img.shields.io/badge/tests-81%20passing-8fb996)
![api keys](https://img.shields.io/badge/API%20keys-0-f0a63c)

<a href="https://ferroscope.vercel.app"><b>Open the live instrument →</b></a> · no account · no API keys · works offline

</div>

---

## What is Ferroscope?

A wave of breaches is a terrible interface. Twenty-seven disclosures arrive in forty-eight hours,
each one written as if it were yours, and none of them answer the only question that matters:
**does this touch anything I actually run?**

Ferroscope answers that question with a filter instead of a feed. You declare your operating system,
browsers, runtimes, hosts, certificate authorities, accounts, and package ecosystems. A deterministic
matcher intersects that declaration against 27 sourced incidents. Most of the time the answer is
"none of them" — and that is a real result, not an error state.

The default profile in this repository is a real developer laptop in Kolkata. Of 27 incidents,
**exactly two** are on its path: a certificate authority whose intermediates were forged but whose
root is still vendored in Python's trust bundle, and a bank breach in the region it banks in. That
gap between 27 headlines and 2 relevant items is the entire product.

> Most breaches are not your breach. The ones that are tend to have a cheap first fix.

---

## What you can do with it

| I want to…                           | Open                                                          | And get                                                      |
| ------------------------------------ | ------------------------------------------------------------- | ------------------------------------------------------------ |
| See whether a headline is my problem | [`/profile`](https://ferroscope.vercel.app/profile)           | A live risk score that recomputes as you toggle components   |
| Read the full incident set           | [`/atlas`](https://ferroscope.vercel.app/atlas)               | 27 files with sources, timelines, IOCs, and an exposure note |
| Understand _why_ a number moved      | [`/blast-radius`](https://ferroscope.vercel.app/blast-radius) | An interactive graph with near misses one step away          |
| Watch a disclosure spread            | [`/cascade`](https://ferroscope.vercel.app/cascade)           | A 12-frame deterministic narrative you can scrub             |
| Know what to fix tonight             | [`/planner`](https://ferroscope.vercel.app/planner)           | Actions ranked by risk points removed per minute             |
| Check certificate trust gaps         | [`/ledger`](https://ferroscope.vercel.app/ledger)             | Windows vs. certifi vs. Node, side by side                   |
| Audit the developer-specific risk    | [`/supply-chain`](https://ferroscope.vercel.app/supply-chain) | Updater, registry, CI workflow, control plane                |
| Get a document I can hand over       | [`/report`](https://ferroscope.vercel.app/report)             | Print-to-PDF, copy JSON, download JSON                       |
| Verify the math                      | [`/method`](https://ferroscope.vercel.app/method)             | Every formula, every band, and the model's stated limits     |
| Compare against reference profiles   | [`/compare`](https://ferroscope.vercel.app/compare)           | Your live profile against four scenarios                     |
| Follow a procedure under pressure    | [`/playbooks`](https://ferroscope.vercel.app/playbooks)       | 8 playbooks, ordered by what closes access fastest           |
| Read the dataset as data             | [`/stats`](https://ferroscope.vercel.app/stats)               | Severity mix, vector distribution, effort distribution       |

---

## The screens

<table>
  <tr>
    <td width="50%"><img src="apps/web/public/screenshots/hero.svg" alt="Ferroscope home: exposure ring, contributor list, live graph"></td>
    <td width="50%"><img src="apps/web/public/screenshots/blast-radius.svg" alt="Blast radius graph with the default laptop at the centre"></td>
  </tr>
  <tr>
    <td><img src="apps/web/public/screenshots/atlas.svg" alt="Incident atlas grid with severity chips"></td>
    <td><img src="apps/web/public/screenshots/planner.svg" alt="Planner ranked by risk removed per minute"></td>
  </tr>
</table>

The four SVGs are generated by [`scripts/gen-assets.mjs`](scripts/gen-assets.mjs) from the same
palette tokens as the app, so the README cannot drift from the product.

---

## Quickstart

```bash
git clone https://github.com/aniruddhaadak80/ferroscope.git
cd ferroscope
bun install
bun run dev            # http://localhost:3000
```

No database to start, no `.env` to fill, no key to request. The dataset is in git.

### Docker, one command

```bash
docker build -t ferroscope . && docker run --rm -p 3000:3000 ferroscope
```

### The whole gate in one line

```bash
bun run verify         # typecheck → lint → 81 tests → production build
```

### Deploy

```bash
vercel --prod          # reads vercel.json services layout
```

Docker, Fly.io, and Render configurations ship in the repository and are documented in
[`docs/runbooks/self-host-docker.md`](docs/runbooks/self-host-docker.md).

---

## The worked example

The default profile is not a worst case and not a guess. It was recorded during the audit that
produced the dataset.

```
17 declared components
 2 incidents intersect it          emudhra (+33) · sbi (+25)
risk 58 / 100                     band: exposed
safety 42 / 100
first fix: pip install --upgrade certifi   →  3 minutes
```

Hardening it — removing the eMudhra root, adding a password manager, 2FA, and automatic updates —
moves the number down without pretending the risk reaches zero. A small server operator adds NGINX,
PHP, WordPress, GitLab, and AWS and sees the score climb sharply. Both are pinned by tests, because a
demo that only works for one profile is a demo, not an instrument.

---

## How it works

1. **Declare.** `/profile` writes a 10-field profile to `localStorage` under
   `ferroscope.profile.v1`. Nothing is sent anywhere.
2. **Match.** `packages/core/src/exposure.ts` intersects each incident's `affected` stack ids with
   your declaration. Incidents with no stack surface (a bank breach) match by region and account type
   instead.
3. **Weight.** Severity, the mean `riskWeight` of the components you actually run, and a coverage
   confidence multiply into a raw score. Hygiene controls subtract, capped at 80%.
4. **Saturate.** `risk = round(100 × (1 − e^(−0.55 × Σ raw)))`. Adding the tenth incident cannot add
   ten points, and the score cannot leave 0–100 as the dataset grows.
5. **Explain.** The graph, the cascade, and every "+33" chip are derived from the same arithmetic —
   there is no second model for presentation.
6. **Act.** The planner divides risk removed by minutes. Tick an action complete and residual risk
   recomputes multiplicatively with a 0.72 competence haircut, so it can approach zero but never
   cross it.

---

## Architecture

```mermaid
flowchart LR
  subgraph browser["Browser · no account, no cookie"]
    UI["apps/web<br/>React 19 client views"]
    STORE["zustand + persist<br/>ferroscope.profile.v1"]
  end

  subgraph edge["Vercel edge / Node runtime"]
    RSC["React Server Components<br/>95 addressable URLs"]
    API["/api/*<br/>stateless handlers"]
  end

  subgraph engine["packages/core · pure TypeScript"]
    MATCH["exposure.ts<br/>matcher + saturation"]
    GRAPH["blast.ts<br/>FNV-1a radial layout"]
    CASCADE["cascade.ts<br/>12 deterministic frames"]
    PLAN["planner.ts<br/>risk per minute"]
    TRUST["trust.ts<br/>certificate ledger"]
  end

  subgraph data["packages/seed · files in git"]
    INC["27 incidents"]
    STACK["55 stack items"]
    ACT["24 actions"]
    PB["8 playbooks"]
    CERT["5 certificate records"]
  end

  UI --> STORE
  UI -->|"POST profile JSON"| API
  RSC --> UI
  API --> MATCH
  API --> GRAPH
  API --> CASCADE
  API --> PLAN
  API --> TRUST
  MATCH --> INC
  MATCH --> STACK
  PLAN --> ACT
  TRUST --> CERT
  RSC --> INC
  RSC --> PB
  BROWSER_NOTE["Profile never persisted server-side<br/>ADR-0003"] -.-> API

  classDef client fill:#0f1114,stroke:#f0a63c,color:#f2eee4
  classDef server fill:#0f1114,stroke:#8fb996,color:#f2eee4
  classDef core fill:#0f1114,stroke:#e5644a,color:#f2eee4
  classDef seed fill:#0f1114,stroke:#9a9b9e,color:#f2eee4
  class UI,STORE client
  class RSC,API server
  class MATCH,GRAPH,CASCADE,PLAN,TRUST core
  class INC,STACK,ACT,PB,CERT seed
```

The dependency direction is one-way and reviewed:

| Workspace         | Responsibility                                        | May import        |
| ----------------- | ----------------------------------------------------- | ----------------- |
| `packages/core`   | Matcher, graph, cascade, planner, trust               | nothing but types |
| `packages/seed`   | 27 incidents, 55 stack items, 24 actions, 8 playbooks | `core` types only |
| `packages/ui`     | 30+ primitives, tokens, motion wrappers               | React, Tailwind   |
| `packages/sdk`    | zod schemas + typed client                            | zod               |
| `apps/web`        | Routes, API handlers, client views                    | all of the above  |
| `packages/config` | Shared tsconfig and vitest base                       | nothing           |

`core` never imports React. `ui` never imports `seed`. That is what makes the engine testable in
under a second and the dataset reviewable by someone who does not know Next.js.

### One request, two paths

```mermaid
sequenceDiagram
  autonumber
  actor U as You
  participant UI as /profile (client)
  participant LS as localStorage
  participant API as /api/exposure
  participant CORE as packages/core
  participant SEED as packages/seed

  U->>UI: toggle "NGINX"
  UI->>LS: persist ferroscope.profile.v1
  UI->>CORE: computeExposure(profile, INCIDENTS, STACK)
  CORE->>SEED: read incidents + stack weights
  CORE-->>UI: report { risk, score, band, matches }
  Note over UI: instant, offline, no network

  U->>API: POST /api/exposure { profile }
  API->>API: zod validate
  alt invalid
    API-->>U: 422 { code: invalid_profile, details }
  else valid
    API->>CORE: computeExposure(profile, ...)
    CORE-->>API: report
    API-->>U: 200 { report, profile }
    Note over API: nothing written,<br/>nothing logged
  end
```

The browser path is the default. The HTTP path exists so the same engine can be used from a script,
a CI job, or the included SDK — and it performs the identical computation.

### Domain model

```mermaid
erDiagram
  EXPOSURE_PROFILE ||--o{ PROFILE_STACK : declares
  STACK_ITEM ||--o{ PROFILE_STACK : "selected as"
  STACK_ITEM ||--o{ INCIDENT_SURFACE : "appears in"
  INCIDENT ||--o{ INCIDENT_SURFACE : affects
  INCIDENT ||--o{ INCIDENT_SOURCE : cites
  INCIDENT ||--o{ TIMELINE_ENTRY : "ordered by"
  INCIDENT ||--o{ INCIDENT_MITIGATION : "reduced by"
  REMEDIATION_ACTION ||--o{ INCIDENT_MITIGATION : mitigates
  INCIDENT ||--o{ INCIDENT_MATCH : "matched against"
  EXPOSURE_PROFILE ||--o{ INCIDENT_MATCH : produces
  INCIDENT_MATCH ||--|| EXPOSURE_REPORT : aggregates
  REMEDIATION_ACTION ||--o{ ACTION_PLAN : "ranked as"
  EXPOSURE_REPORT ||--o{ ACTION_PLAN : "scopes"

  EXPOSURE_PROFILE {
    string[] stack
    string region
    boolean bank
    boolean passwordManager
    boolean twoFactor
    boolean autoUpdates
  }
  STACK_ITEM {
    string id PK
    string label
    string category
    float riskWeight
    boolean defaultOn
  }
  INCIDENT {
    string slug PK
    string name
    string severity
    float cvss
    string vector
    string disclosedAt
    string[] regions
    string[] affected
    string[] mitigations
  }
  INCIDENT_MATCH {
    boolean matched
    float confidence
    string effectiveSeverity
    int contribution
  }
  EXPOSURE_REPORT {
    int risk
    int score
    string band
    int examinedStack
  }
  REMEDIATION_ACTION {
    string id PK
    int minutes
    float reduces
    string category
  }
  ACTION_PLAN {
    int riskReduced
    float efficiency
    boolean completed
  }
```

The types are deliberately serialisable: no class instances, no `Date` objects, no functions. The same
shape crosses the server/client boundary, lands in exported JSON, and seeds the simulator.

```mermaid
classDiagram
  class ExposureProfile {
    +readonly string[] stack
    +readonly string region
    +readonly boolean bank
    +readonly boolean passwordManager
    +readonly boolean twoFactor
    +readonly boolean autoUpdates
  }
  class Incident {
    +readonly string slug
    +readonly string name
    +readonly Severity severity
    +readonly number|null cvss
    +readonly Vector vector
    +readonly string[] affected
    +readonly string[] mitigations
  }
  class StackItem {
    +readonly string id
    +readonly string label
    +readonly number riskWeight
    +readonly boolean defaultOn
  }
  class IncidentMatch {
    +readonly boolean matched
    +readonly number confidence
    +readonly Severity effectiveSeverity
    +readonly number contribution
  }
  class ExposureReport {
    +readonly number score
    +readonly number risk
    +readonly RiskBand band
    +readonly IncidentMatch[] exposed
  }
  class RemediationAction {
    +readonly string id
    +readonly number minutes
    +readonly number reduces
    +readonly string[] steps
  }
  class ActionPlan {
    +readonly number riskReduced
    +readonly number efficiency
    +readonly boolean completed
  }

  ExposureProfile "1" --> "*" StackItem : declares
  Incident "*" --> "*" StackItem : affects
  ExposureReport "1" --> "*" IncidentMatch
  IncidentMatch --> Incident
  ExposureReport --> ActionPlan : ranks
  RemediationAction --> ActionPlan
```

---

## The model

```mermaid
flowchart TD
  P["ExposureProfile<br/>stack · region · 4 flags"] --> M{"affected ∩ declared<br/>non-empty?"}
  M -->|yes| C["confidence = 0.55 + 0.45 × coverage"]
  M -->|no| R{"no surface by design?"}
  R -->|"banking + bank + region"| C9["confidence = 0.90"]
  R -->|"data-breach / state-actor + region"| C6["confidence = 0.60"]
  R -->|no| Z["not matched · raw = 0"]

  C --> MIT
  C9 --> MIT
  C6 --> MIT
  MIT["mitigation = min(0.80, Σ controls)<br/>2FA +0.22 · manager +0.18 · updates +0.25"]
  MIT --> W["weight = mean riskWeight of present"]
  W --> RAW["raw = severity × weight × confidence × (1 − mitigation)"]
  RAW --> SUM["Σ raw across matched incidents"]
  SUM --> SAT["risk = round(100 × (1 − e^(−0.55 × Σ raw)))"]
  SAT --> BAND{"band"}
  BAND -->|"0–19"| F["fortified"]
  BAND -->|"20–44"| W2["watchful"]
  BAND -->|"45–69"| E["exposed"]
  BAND -->|"70–100"| CR["critical"]
  SAT --> SCORE["score = 100 − risk"]

  classDef input fill:#0f1114,stroke:#9a9b9e,color:#f2eee4
  classDef decision fill:#0f1114,stroke:#f0a63c,color:#f2eee4
  classDef math fill:#0f1114,stroke:#e5644a,color:#f2eee4
  classDef out fill:#0f1114,stroke:#8fb996,color:#f2eee4
  class P input
  class M,R,BAND decision
  class C,C9,C6,MIT,W,RAW,SUM,SAT math
  class F,W2,E,CR,SCORE,Z out
```

Three properties matter more than the constants:
- **`confidence` is a coverage fraction, not a probability.** Running all four affected components
  scores 1.0; one of four scores 0.6625.
- **Mitigation is capped at 0.80.** Ticking every hygiene box cannot produce a zero, because none of
  those controls is a force field.
- **Saturation is deliberate.** A linear model would let the dataset's growth push scores past 100,
  and would make the tenth incident as loud as the first.

The planner is a division, not a model:

```mermaid
quadrantChart
  title Effort against risk removed · default profile
  x-axis Low minutes --> High minutes
  y-axis Low risk removed --> High risk removed
  quadrant-1 Cheap and decisive
  quadrant-2 Expensive but worth it
  quadrant-3 Ignore for now
  quadrant-4 Busywork
  Refresh certifi: [0.05, 0.86]
  Turn on 2FA: [0.22, 0.74]
  Rotate SBI credentials: [0.18, 0.68]
  Install Windows updates: [0.26, 0.61]
  Pin GitHub Actions to SHA: [0.42, 0.55]
  Audit Actions across repos: [0.72, 0.58]
  Move DNS to a scoped provider: [0.66, 0.34]
  Rebuild the home server: [0.92, 0.41]
  Revoke stale OAuth grants: [0.34, 0.28]
  Enable router logging: [0.55, 0.16]
```

Full derivations, including the 0.72 haircut and the band table, are on
[`/method`](https://ferroscope.vercel.app/method) and in
[ADR-0005](docs/adr/0005-exposure-scoring.md).

---

## The dataset

The dataset is a snapshot, not a feed. Every incident names its sources, its timeline, and one honest
paragraph about who it can actually reach.

| Group                | Count  | Window                       |
| -------------------- | ------ | ---------------------------- |
| Black October wave   | 14     | 21–23 Oct 2026, 48 hours     |
| Month-scale context  | 9      | October 2026                 |
| Watchlist / regional | 4      | ongoing                      |
| **Total**            | **27** | dataset version `2026.10.23` |

**Seed `2718`** (e ≈ 2.718, π ≈ 3.14) appears in the footer, in `/api/healthz`, and in every exported
report. It is the dataset's identity, not a random number.

```mermaid
flowchart LR
  YOU(("YOU<br/>default laptop<br/>17 declared"))

  subgraph path["On the path · 2 of 27"]
    EMU["eMudhra root<br/>critical · CA · +33"]
    SBI["State Bank of India<br/>high · banking · +25"]
  end

  subgraph near["Near misses · one step away"]
    LITE["LiteLLM<br/>critical · supply chain"]
    PHP["PHP2Shell<br/>critical · web server"]
    RAIL["Railway<br/>critical · hosting"]
  end

  subgraph declared["Declared surfaces"]
    PY["Python 3.13<br/>certifi 2026.07.22"]
    EDGE["Edge"]
    BRAVE["Brave"]
    WIN["Windows 11"]
    GH["GitHub + Actions"]
    VCL["Vercel"]
    NPM["npm"]
    PYP["PyPI"]
  end

  YOU --> PY
  YOU --> EDGE
  YOU --> BRAVE
  YOU --> WIN
  YOU --> GH
  YOU --> VCL
  YOU --> NPM
  YOU --> PYP
  PY ==>|"trusts root"| EMU
  YOU ==>|"bank in IN"| SBI
  EDGE -.->|"blocked intermediate"| EMU
  BRAVE -.->|"blocked intermediate"| EMU
  NPM -.->|"if lockfile absent"| LITE
  VCL -.->|"control plane"| RAIL
  WIN -.->|"if unpatched"| PHP

  classDef self fill:#f0a63c,stroke:#f0a63c,color:#08090b
  classDef hit fill:#0f1114,stroke:#e5644a,color:#f2eee4,stroke-width:2px
  classDef near fill:#0f1114,stroke:#f0a63c,color:#f2eee4,stroke-dasharray: 4 4
  classDef stack fill:#0f1114,stroke:#9a9b9e,color:#f2eee4
  class YOU self
  class EMU,SBI hit
  class LITE,PHP,RAIL near
  class PY,EDGE,BRAVE,WIN,GH,VCL,NPM,PYP stack
```

A correction is a pull request with a source, not a retraction in a blog post. The
[dataset correction template](.github/ISSUE_TEMPLATE/dataset_correction.yml) requires one.

---

## Routes and API

95 addressable URLs in the build output: 56 HTML pages (21 static, 27 incident files, 8
playbooks), 34 API URLs from 8 handlers, plus robots, sitemap, manifest, the not-found page, and a
server-rendered OG image. `bun scripts/count-routes.mjs --strict` asserts the total.

### API

| Method | Route                                      | Returns                              |
| ------ | ------------------------------------------ | ------------------------------------ |
| `GET`  | `/api/healthz`                             | Dataset identity, version, seed      |
| `GET`  | `/api/incidents?severity=&vector=&window=` | Filtered incidents                   |
| `GET`  | `/api/incidents/[slug]`                    | One incident, prerendered for all 27 |
| `POST` | `/api/exposure`                            | Full exposure report                 |
| `POST` | `/api/blast-radius`                        | Graph + report                       |
| `POST` | `/api/cascade`                             | Deterministic frames                 |
| `POST` | `/api/planner`                             | Ranked plans + residual risk         |
| `GET`  | `/api/ledger`                              | Certificate records + assessment     |

```bash
curl -s https://ferroscope.vercel.app/api/healthz | jq
# { "status": "ok", "incidents": 27, "seed": 2718, "version": "0.1.0" }

curl -s https://ferroscope.vercel.app/api/exposure \
  -H 'content-type: application/json' \
  -d '{"profile":{"stack":["ca-emudhra","acct-bank-sbi"],"region":"IN","bank":true,
       "passwordManager":false,"twoFactor":false,"autoUpdates":false}}' | jq '.report | {risk, score, band}'
# { "risk": 56, "score": 44, "band": "exposed" }
```

Invalid bodies return `422` with zod field errors. Every response carries `x-ferroscope-version` and
`cache-control: no-store`. Nothing is written, logged, or queued.

---

## Design

The interface is an instrument, not a dashboard. Graphite and bone, one signal amber, rust for
critical, moss for safe. No purple, no pink, no gradient soup.

| Token       | Dark      | Light     | Use                       |
| ----------- | --------- | --------- | ------------------------- |
| `--canvas`  | `#08090b` | `#f6f3ec` | Page                      |
| `--surface` | `#0f1114` | `#fffdf8` | Cards                     |
| `--ink`     | `#f2eee4` | `#101215` | Primary text              |
| `--muted`   | `#9a9b9e` | `#5d6066` | Secondary text            |
| `--amber`   | `#f0a63c` | `#a86a10` | Signal, links, live model |
| `--rust`    | `#e5644a` | `#b23a22` | Critical, danger          |
| `--moss`    | `#8fb996` | `#3f6b48` | Safe, confirmed           |

Typography: **Instrument Serif** for display, **Manrope** for text, **JetBrains Mono** for labels and
numerals. All three are vendored as Latin-subset `.woff2` files in `apps/web/fonts` (OFL 1.1, see
[NOTICE](apps/web/fonts/NOTICE.md)) and loaded with `next/font/local`, so neither the build nor the
running site ever touches a font CDN. `bun scripts/vendor-fonts.mjs` regenerates them.

Motion is restrained and respects `prefers-reduced-motion` globally: transitions collapse to
near-zero, marquees stop, and the cascade becomes steppable rather than autoplaying.

```mermaid
mindmap
  root((Ferroscope))
    Atlas
      27 incidents
      Severity and vector filters
      Sources and timelines
    Blast radius
      Deterministic radial layout
      Near misses at low opacity
      Click to isolate edges
    Cascade
      12 frames
      Play step scrub
      Active surfaces
    Planner
      24 actions
      Risk per minute
      Multiplicative residual
    Trust ledger
      5 roots
      Windows vs certifi vs Node
    Supply chain
      Updater
      Registry
      CI workflow
      Control plane
    Reports
      Print to PDF
      JSON export
    Method
      Formulas
      Bands
      Stated limits
```

---

## Quality gates

```mermaid
flowchart LR
  DEV["git push<br/>main"] --> CI["CI · ubuntu<br/>bun 1.3.14"]
  CI --> Q["typecheck<br/>tsc --noEmit × 6"]
  Q --> L["lint<br/>biome check"]
  L --> T["test<br/>81 vitest"]
  T --> B["build<br/>next build · 95 routes"]
  B --> E["e2e<br/>playwright · chromium + firefox + mobile"]
  B --> D["docker<br/>standalone image"]
  D --> DS["container smoke<br/>/api/healthz"]
  E --> OK{"all green?"}
  DS --> OK
  B --> V["Vercel build<br/>turbo --filter=@ferroscope/web"]
  OK -->|yes| V
  V --> PROD["ferroscope.vercel.app"]

  classDef ci fill:#0f1114,stroke:#f0a63c,color:#f2eee4
  classDef gate fill:#0f1114,stroke:#8fb996,color:#f2eee4
  classDef prod fill:#0f1114,stroke:#e5644a,color:#f2eee4
  class CI,Q,L,T,B,E,D,DS,OK ci
  class V gate
  class PROD prod
```

| Gate      | Command                      | What must hold                                 |
| --------- | ---------------------------- | ---------------------------------------------- |
| Types     | `bun run typecheck`          | Strict, `exactOptionalPropertyTypes`, no `any` |
| Lint      | `bun run lint`               | Biome recommended + a11y rules                 |
| Unit      | `bun run test`               | 81 tests: 55 engine, 17 dataset, 9 SDK         |
| Build     | `bun run build`              | 95 routes, zero prerender errors               |
| E2E       | `bun run test:e2e`           | 24 routes, API contract, interaction, axe      |
| Container | `docker build` + healthcheck | Runs as uid 1001, `/api/healthz` returns ok    |
| Security  | CodeQL + Dependabot          | Weekly, plus every push to `main`              |

### Honest size

```text
workspace            files    total     code
apps/web                64     7100     6566
packages/core           18     1807     1558
packages/seed           14     2742     2628
packages/ui             16     1443     1349
packages/sdk             7      301      258
packages/config          4       56       51
scripts                  5      938      772
e2e                      4      358      295
docs                    16     1330      880
.github                  8      393      361
root docs                5     1412     1024
────────────────────────────────────────────────
total                  161    17880    15742
```

**15,742 lines of code, 17,880 lines including blanks.** That is the complete product: engine, dataset,
design system, 95 routes, tests, docs, and deployment. It is not a million-line codebase and this
README will not pretend otherwise. Run `bun run loc` to reproduce the table; generated output,
lockfiles, and `node_modules` are excluded by the script.

---

## Deployment

```mermaid
flowchart TB
  subgraph visitor["Your machine"]
    B["Browser<br/>localStorage profile"]
    CLI["curl / SDK<br/>packages/sdk"]
  end

  subgraph vercel["Vercel · primary"]
    EDGE["Edge network<br/>TLS · rewrites · headers"]
    NEXT["Next.js server<br/>95 routes · 8 API handlers"]
    STATIC["Static output<br/>RSC payload · SVG · manifest"]
  end

  subgraph selfhost["Self-hosted · optional"]
    DOCKER["Docker image<br/>node:22-alpine · uid 1001"]
    FLY["Fly.io<br/>bom · shared-cpu-1x"]
    RENDER["Render<br/>singapore · free plan"]
  end

  subgraph absent["Deliberately absent"]
    DB[("database")]
    AUTH["auth provider"]
    FEED["live threat feed"]
    LLM["LLM API"]
  end

  B -->|HTTPS| EDGE
  CLI -->|HTTPS| EDGE
  EDGE --> NEXT
  NEXT --> STATIC
  B -.->|"profile stays here"| B
  DOCKER --> NEXT
  FLY --> DOCKER
  RENDER --> DOCKER
  NEXT -.->|"never"| DB
  NEXT -.->|"never"| AUTH
  NEXT -.->|"never"| FEED
  NEXT -.->|"never"| LLM

  classDef client fill:#0f1114,stroke:#f0a63c,color:#f2eee4
  classDef host fill:#0f1114,stroke:#8fb996,color:#f2eee4
  classDef none fill:#0f1114,stroke:#e5644a,color:#f2eee4,stroke-dasharray: 5 5
  class B,CLI client
  class EDGE,NEXT,STATIC,DOCKER,FLY,RENDER host
  class DB,AUTH,FEED,LLM none
```

| Target  | Config                                     | Notes                                       |
| ------- | ------------------------------------------ | ------------------------------------------- |
| Vercel  | [`vercel.json`](vercel.json)               | Services layout, rewrites, security headers |
| Docker  | [`Dockerfile`](Dockerfile)                 | Standalone output, non-root, healthcheck    |
| Compose | [`docker-compose.yml`](docker-compose.yml) | Port 3000, restart policy                   |
| Fly.io  | [`fly.toml`](fly.toml)                     | `bom` region, auto-stop, health check       |
| Render  | [`render.yaml`](render.yaml)               | Docker runtime, free plan                   |

Runbooks: [Vercel](docs/runbooks/deploy-vercel.md) · [Docker and self-hosting](docs/runbooks/self-host-docker.md) · [Dataset review](docs/runbooks/dataset-review.md)

---

## Documentation

| Document                                                            | What it answers                                                 |
| ------------------------------------------------------------------- | --------------------------------------------------------------- |
| [`/method`](https://ferroscope.vercel.app/method)                   | The formulas, the bands, and what the model refuses to claim    |
| [`/glossary`](https://ferroscope.vercel.app/glossary)               | Blast radius, exposure, breach, and the difference between them |
| [ADR-0003](docs/adr/0003-no-database-localstorage.md)               | Why there is no database                                        |
| [ADR-0005](docs/adr/0005-exposure-scoring.md)                       | Why the score is shaped the way it is                           |
| [ADR-0006](docs/adr/0006-no-llm-no-telemetry.md)                    | Why there is no LLM, telemetry, or live feed                    |
| [Adding an incident](docs/guides/adding-an-incident.md)             | The full dataset contribution procedure                         |
| [Adding a stack component](docs/guides/adding-a-stack-component.md) | Choosing `riskWeight` and `defaultOn`                           |
| [Extending the planner](docs/guides/extending-the-planner.md)       | Minutes, `reduces`, and ranking                                 |
| [Architecture decisions](docs/adr/README.md)                        | All six records                                                 |

---

## Roadmap

```mermaid
gantt
  title Ferroscope roadmap
  dateFormat YYYY-MM-DD
  axisFormat %d %b
  section Shipped
  27-incident dataset            :done, d1, 2026-10-21, 3d
  Exposure engine + tests        :done, d2, 2026-10-21, 2d
  Atlas, graph, cascade, planner :done, d3, 2026-10-22, 2d
  ADRs, guides, runbooks         :done, d4, 2026-10-23, 2d
  0.1.0 public release           :milestone, m1, 2026-10-24, 0d
  section Next
  Dataset diffing between snaps  :active, n1, 2026-10-27, 10d
  Per-package patch levels       :n2, after n1, 12d
  URL-fragment comparison links  :n3, after n2, 7d
  Axe audit in CI                :n4, after n1, 5d
  section Later
  Optional local-only scanner    :l1, 2026-12-01, 30d
  Manifest import to prefill     :l2, after l1, 20d
  Playbook progress per profile  :l3, after l2, 10d
```

Four things will never ship, and they are on [`/roadmap`](https://ferroscope.vercel.app/roadmap) next
to the features:
- **No account system.** A security tool that asks for your email before telling you anything is a
  lead-generation form.
- **No LLM summarisation.** An explanation that changes between runs cannot be audited.
- **No live feed.** Freshness would silently change the meaning of a saved report.
- **No scanner that uploads.** Inventory is the most sensitive data a security product can hold.

Those are not constraints imposed by time. They are the product.

---

## Contributing

```mermaid
gitGraph
  commit id: "scaffold"
  commit id: "core: matcher + tests"
  branch data/dataset
  checkout data/dataset
  commit id: "27 incidents"
  commit id: "24 actions"
  checkout main
  merge data/dataset tag: "0.1.0-dataset"
  branch feat/web
  checkout feat/web
  commit id: "routes: 95"
  commit id: "graph + cascade"
  checkout main
  merge feat/web
  branch docs/adr
  checkout docs/adr
  commit id: "6 ADRs"
  commit id: "guides + runbooks"
  checkout main
  merge docs/adr tag: "0.1.0"
  commit id: "deploy: vercel prod"
```

The most useful contributions, in order:
1. **A dataset correction with a source.** The atlas ages; corrections keep it honest.
2. **An accessibility fix.** The axe suite runs, but it only catches what axe can see.
3. **A playbook step that assumes less.** Every procedure should work for someone with no security
   background and no paid tools.
4. **A model critique with arithmetic.** If a formula is wrong, show the counterexample.

Read [`CONTRIBUTING.md`](CONTRIBUTING.md) first. It lists the refusals, the five commands, and the
rules for changing a number. Then:

```bash
bun install
bun run verify
```

New here? Look for issues labelled
[`good first issue`](https://github.com/aniruddhaadak80/ferroscope/labels/good%20first%20issue).

### The first ten minutes

```mermaid
journey
  title First ten minutes with Ferroscope
  section Land
    Read the hero claim: 27 incidents, 2 touch this laptop: 5: You
    See the live exposure ring at 44: 4: You
    Scan the six featured files: 3: You
  section Declare
    Open /profile: 4: You
    Tick Windows, Edge, Node, Python, GitHub, SBI: 3: You
    Watch the number move as each tile toggles: 5: You
  section Understand
    Open /blast-radius and click eMudhra: 4: You
    Read the reasons list: 4: You
    Step the cascade frame by frame: 5: You
  section Act
    Open /planner, sorted by risk per minute: 5: You
    Read the 3-minute certifi fix: 4: You
    Tick it complete and watch residual drop: 5: You
  section Keep
    Print the report or copy the JSON: 3: You
    Return next week; profile is still there: 4: You
```

---

## License

MIT © 2026 [Aniruddha Adak](https://github.com/aniruddhaadak80).

The dataset is provided for educational use. It is a snapshot of public reporting, not a threat
intelligence feed, and it is not legal or compliance advice. See [`LICENSE`](LICENSE).

<div align="center">
  <sub>Built in Kolkata. No telemetry, no account, no API keys. Seed 2718.</sub>
</div>
