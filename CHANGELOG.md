# Changelog

All notable changes to Ferroscope are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Two versions travel together:
- **App version** — semver, the code.
- **Dataset version** — a date, because the incident set is a snapshot.

A report is only reproducible against the pair it names.

---

## [Unreleased]

### Fixed

- `@source` in `globals.css` pointed at `apps/packages/ui/src`, which does not exist. Local builds hid it
  because Tailwind's automatic content detection walked up from the real `.git` root; the Vercel build
  has no `.git`, so utilities used only inside `@ferroscope/ui` were dropped and the grain layer lost
  `position: fixed`, pushing the header 150px down the page. `scripts/check-css.mjs` now fails the build
  when a `@source` path does not resolve or the compiled stylesheet is missing those utilities.
- `/og` renders on the Node runtime. The Vercel `services` target rejects Edge Function output, so the
  Open Graph card could not ship.

### Planned

- Dataset diffing between two snapshots.
- Per-package patch levels instead of one auto-updates flag.
- Comparison links that encode a profile in the URL fragment, never the path.
- Axe accessibility audit wired into CI as a blocking gate.

---

## [0.1.0] — 2026-10-24

The first public release. Everything below ships together, because a dataset without an engine is a
blog post and an engine without a dataset is a demo.

### Added — engine (`packages/core`)

- Deterministic exposure matcher with coverage-based confidence
  (`0.55 + 0.45 × present/affected`) and region-scoped fallbacks for banking, data-breach, and
  state-actor incidents.
- Exponential risk saturation (`1 − e^(−0.55 × Σ raw)`), which bounds the score at 100 as the dataset
  grows and keeps a tenth incident from adding ten points.
- Mitigation model: 2FA `+0.22`, password manager `+0.18`, automatic updates `+0.25`, capped at
  `0.80`. Mitigation ≥ 0.40 downgrades the displayed severity by one step.
- Blast graph with a radial, deterministic layout. Jitter comes from an FNV-1a hash of the node id,
  so positions are byte-stable across runs.
- Twelve-frame cascade simulator with a pure `(incident, profile, tick)` frame function.
- Risk-per-minute planner. Ranking is efficiency descending, with deterministic tie-breaks on
  incident coverage and minutes. Residual risk is multiplicative with a 0.72 competence haircut and a
  floor of zero.
- Certificate trust assessment across system, Python, and Node stores.
- 55 unit tests, including determinism assertions that compare two calls byte for byte.

### Added — dataset (`packages/seed`)

- 27 incidents: 14 in the 48-hour Black October wave, 9 month-scale, 4 watchlist.
- 55 stack items across 10 categories, each with a documented `riskWeight`.
- 24 remediation actions with steps, realistic minutes, and shell commands where a command helps.
- 8 playbooks, 5 certificate records, 4 reference scenarios.
- Default profile recorded from a real developer laptop: Windows, Edge and Brave, Node and Python,
  GitHub and Actions, Vercel, the eMudhra root, SBI banking. It computes **risk 58 / score 42 /
  band exposed**, with exactly two intersections: `emudhra` and `sbi`.
- 18 dataset tests: counts, reference integrity, chronological timelines, absolute source URLs, and a
  pin on the published default-profile numbers.

### Added — web (`apps/web`)

- 95 addressable URLs: every route is prerendered except the four POST computation endpoints and
  the OG image route.
- `/atlas` with search, severity, vector, window, and sort controls; `/atlas/[slug]` for all 27 files.
- `/blast-radius`, an interactive SVG graph with near-miss toggling and edge isolation.
- `/cascade`, a frame scrubber with play, step, speed, and an active-surface readout.
- `/planner`, with completion persisted locally and residual risk recomputed multiplicatively.
- `/report`, printable and exportable as JSON; `/ledger`; `/supply-chain`; `/timeline`; `/matrix`;
  `/stats`; `/glossary`; `/method`; `/changelog`; `/roadmap`; `/about`; `/settings`; `/compare`;
  `/scenarios`; `/playbooks` and `/playbooks/[slug]`.
- Command palette (`Ctrl/⌘ K`) covering every route and incident.
- Full light and dark palettes on Instrument Serif, Manrope, and JetBrains Mono. No purple, no pink.
- Fonts vendored as Latin-subset `.woff2` under `apps/web/fonts` and loaded with `next/font/local`, so
  builds are reproducible offline and no page ever reaches a font CDN.
- `prefers-reduced-motion` honoured globally; grain and grid textures rendered as CSS, not images.

### Added — API

- `GET /api/healthz` — dataset identity and version.
- `GET /api/incidents` with `severity`, `vector`, and `window` filters.
- `GET /api/incidents/[slug]` — prerendered for all 27 slugs.
- `POST /api/exposure` — zod-validated, stateless.
- `POST /api/blast-radius` — graph plus report.
- `POST /api/cascade` — deterministic frames.
- `POST /api/planner` — ranked plans and residual risk.
- `GET /api/ledger` — certificate records and assessment.
- Every response carries `x-ferroscope-version` and `cache-control: no-store`.

### Added — tooling and infrastructure

- Turborepo with six workspaces and an enforced dependency direction
  (`seed → core → ui → web`).
- `scripts/gen-assets.mjs` — deterministic SVG generation for the favicon, apple touch icon, logo,
  banner, OG card, and four screenshots.
- `scripts/loc-count.mjs` and `scripts/count-routes.mjs` — honest totals, no inflated numbers.
- Playwright suite across Chromium, Firefox, and a mobile viewport: route smoke, API contract,
  interaction, and axe accessibility checks.
- GitHub Actions: quality, build, e2e, and a Docker smoke test; CodeQL on push and weekly.
- Deployment targets: Vercel (services layout), Docker, Compose, Fly.io, and Render.
- Six ADRs, three guides, three runbooks, issue templates for bugs, features, and dataset
  corrections.

### Security

- No database, no accounts, no sessions. Profiles live in `localStorage` under
  `ferroscope.profile.v1`.
- No telemetry, no analytics, no third-party runtime script.
- Security headers set in `vercel.json`; `poweredByHeader: false`.
- Docker image runs as a non-root user with a healthcheck.
- No API keys are required anywhere, in development or production.

### Known limits

- The dataset is a snapshot dated `2026.10.23`. It ages.
- Patch state is a single boolean, not per-package versions.
- The score is a ranking device, not a probability of compromise.
- Profiles do not sync across devices, by design.

---

## [0.1.0-dataset] — 2026-10-23

### Added

- The Black October snapshot frozen at `2026.10.23`, seed `2718`.
- 14 incidents inside the 48-hour window, each with at least two sources and a chronological
  timeline.
- Two certificate records flagged `blocked-in-browsers` but still trusted by Python's vendored
  bundle — the gap the trust ledger exists to show.
- Regional scoping for banking, data-breach, and state-actor incidents, so a breach headline only
  matches the geography it actually concerns.

---

[Unreleased]: https://github.com/aniruddhaadak80/ferroscope/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/aniruddhaadak80/ferroscope/releases/tag/v0.1.0
[0.1.0-dataset]: https://github.com/aniruddhaadak80/ferroscope/releases/tag/v0.1.0
