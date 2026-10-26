import { ButtonLink, Callout, Card, Kicker, PageHeader, Table, Td, Th } from "@ferroscope/ui";
import type { Metadata } from "next";
import { Container } from "@/components/container";

export const metadata: Metadata = {
  title: "Scoring method",
  description:
    "The exact formulas behind the exposure score, the mitigation cap, the risk bands, and the planner's efficiency ranking — plus what the model refuses to claim.",
};

const BANDS = [
  {
    band: "fortified",
    range: "0 – 19",
    meaning: "Nothing declared intersects the dataset, or the impact is fully mitigated.",
  },
  {
    band: "watchful",
    range: "20 – 44",
    meaning: "One meaningful intersection with strong hygiene, or several weak ones.",
  },
  {
    band: "exposed",
    range: "45 – 69",
    meaning: "Multiple intersections, at least one with a high-risk component.",
  },
  {
    band: "critical",
    range: "70 – 100",
    meaning: "Broad intersection with critical-severity incidents and no mitigating controls.",
  },
] as const;

const LIMITS = [
  {
    title: "It is not a vulnerability scan",
    body: "Ferroscope never inspects your machine. It compares what you declare against a public dataset. A clean report means “no declared intersection”, not “no vulnerabilities”.",
  },
  {
    title: "Patch state is coarse",
    body: "There is a single auto-updates flag. The real world has per-package patch levels, and modelling them honestly would require a scanner the project deliberately does not ship.",
  },
  {
    title: "The dataset is a snapshot",
    body: "27 incidents from a specific window, each with sources. It ages. The version string is in every report because the numbers only mean something relative to that version.",
  },
  {
    title: "Risk is not probability",
    body: "A 58 does not mean a 58% chance of compromise. It is a bounded index of surface intersection weighted by severity. Treat it as a ranking device, not a forecast.",
  },
] as const;

export default function MethodPage() {
  return (
    <Container>
      <PageHeader
        index="11"
        kicker="Method"
        title={
          <>
            Every number here
            <br />
            has a <em className="text-amber">derivation</em>.
          </>
        }
        lede="The exposure score is four multiplications and one exponential saturation. The planner is a division. Nothing is learned, sampled, or guessed at request time."
        meta={
          <>
            <span>pure functions</span>
            <span>54 unit tests</span>
            <span>no LLM in the loop</span>
          </>
        }
        actions={
          <ButtonLink href="/glossary" variant="outline" size="sm">
            Glossary
          </ButtonLink>
        }
      />

      <div className="grid gap-10 py-10 lg:grid-cols-[1fr_19rem] lg:items-start">
        <div className="space-y-10">
          <section>
            <Kicker>01 · Matching</Kicker>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
              An incident is <strong className="text-ink">matched</strong> when at least one stack
              item it declares as affected is present in the profile. If the incident has no stack
              surface by design — a regional bank breach, a state-actor campaign — it is matched by
              region and account type instead.
            </p>
            <pre className="mt-5 overflow-x-auto border border-line bg-surface p-4 font-mono text-[11px] leading-relaxed text-ink">
              {`present    = affected ∩ declared
confidence = 0.55 + 0.45 × (|present| / |affected|)

// no stack surface:
banking     → matched if region matches and profile.bank
data-breach → matched if region matches
state-actor → matched if region matches`}
            </pre>
          </section>

          <section>
            <Kicker>02 · Mitigation</Kicker>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
              Hygiene controls reduce impact, but they are capped at 80% and applied per vector.
              Ticking every box cannot produce a zero.
            </p>
            <div className="mt-5 overflow-hidden border border-line bg-surface">
              <Table>
                <thead>
                  <tr>
                    <Th>Control</Th>
                    <Th>Applies to</Th>
                    <Th>Reduction</Th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      control: "Phishing-resistant 2FA",
                      vectors: "identity, banking, supply chain, ai-agent, network, state actor",
                      value: "+0.22",
                    },
                    {
                      control: "Password manager",
                      vectors: "identity, banking, supply chain",
                      value: "+0.18",
                    },
                    {
                      control: "Automatic updates",
                      vectors:
                        "endpoint, runtime, browser, web server, network, certificate authority",
                      value: "+0.25",
                    },
                    { control: "Cap", vectors: "all", value: "0.80" },
                  ].map((row) => (
                    <tr key={row.control}>
                      <Td>
                        <span className="text-xs text-ink">{row.control}</span>
                      </Td>
                      <Td>
                        <span className="text-xs">{row.vectors}</span>
                      </Td>
                      <Td>
                        <span className="font-mono text-xs tabular-nums text-amber">
                          {row.value}
                        </span>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </section>

          <section>
            <Kicker>03 · Score</Kicker>
            <pre className="mt-4 overflow-x-auto border border-line bg-surface p-4 font-mono text-[11px] leading-relaxed text-ink">
              {`raw_i = severityWeight_i × avgRiskWeight_i × confidence_i × (1 − mitigation_i)

risk  = round(100 × (1 − e^(−0.55 × Σ raw_i)))
score = 100 − risk`}
            </pre>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
              The exponential saturation is deliberate. Adding a tenth incident should not add ten
              points to a score that already reads 90. It also guarantees the score cannot leave
              0–100 no matter how large the dataset grows.
            </p>
          </section>

          <section>
            <Kicker>04 · Planner</Kicker>
            <pre className="mt-4 overflow-x-auto border border-line bg-surface p-4 font-mono text-[11px] leading-relaxed text-ink">
              {`relevantRisk = Σ contribution of exposed incidents the action touches
riskReduced  = min(totalRisk, round(relevantRisk × action.reduces))
efficiency   = riskReduced / max(action.minutes, 1)

residual = fold(risk, completed, (r, a) => r − r × a.reduces × 0.72)`}
            </pre>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
              Residual risk is multiplicative, not additive, which is why the planner can never
              claim to remove 130% of your risk. The 0.72 factor is a deliberate haircut: doing the
              action is not the same as doing it perfectly.
            </p>
          </section>

          <section>
            <Kicker>05 · Bands</Kicker>
            <div className="mt-4 divide-y divide-line border-y border-line">
              {BANDS.map((row) => (
                <div key={row.band} className="grid gap-2 py-3 sm:grid-cols-[7rem_6rem_1fr]">
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink">
                    {row.band}
                  </span>
                  <span className="font-mono text-[10px] tabular-nums text-amber">{row.range}</span>
                  <span className="text-xs leading-relaxed text-muted">{row.meaning}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <Kicker>06 · What the model refuses to claim</Kicker>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {LIMITS.map((limit) => (
                <Card key={limit.title} className="p-5">
                  <p className="font-display text-lg leading-tight text-ink">{limit.title}</p>
                  <p className="mt-2 text-xs leading-relaxed text-muted">{limit.body}</p>
                </Card>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <Card className="p-5">
            <Kicker>Determinism</Kicker>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Same profile plus same dataset equals the same report, byte for byte. The graph layout
              uses an FNV-1a hash for jitter, so even node positions are reproducible. That is what
              makes the screenshots in this repository trustworthy.
            </p>
          </Card>

          <Callout title="Privacy stance" tone="moss">
            The API routes are stateless computations. There is no database, no session, no logging
            of profiles. The only persistence is localStorage in your own browser.
          </Callout>

          <Card className="p-5">
            <Kicker>Read the code</Kicker>
            <ul className="mt-3 space-y-2 font-mono text-[10px] leading-relaxed text-muted">
              <li>packages/core/src/exposure.ts</li>
              <li>packages/core/src/planner.ts</li>
              <li>packages/core/src/blast.ts</li>
              <li>packages/core/src/cascade.ts</li>
            </ul>
            <div className="mt-4">
              <ButtonLink href="/stats" variant="outline" size="sm">
                Dataset stats
              </ButtonLink>
            </div>
          </Card>

          <Card className="p-5">
            <Kicker>Corrections</Kicker>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              The dataset is versioned like code. If an incident is wrong, the fix is a pull request
              against the seed file with a source, not a retraction in a blog post.
            </p>
          </Card>
        </aside>
      </div>
    </Container>
  );
}
