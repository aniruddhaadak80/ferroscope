import { SEVERITIES, vectorLabel } from "@ferroscope/core";
import { ACTIONS, CERTIFICATES, INCIDENTS, PLAYBOOKS, STACK_CATALOG } from "@ferroscope/seed";
import { Bars, Kicker, PageHeader, Stat, Table, Td, Th } from "@ferroscope/ui";
import type { Metadata } from "next";
import { Container } from "@/components/container";

export const metadata: Metadata = {
  title: "Dataset stats",
  description:
    "The shape of the Ferroscope dataset: severity mix, vector distribution, action minutes, and the numbers the product is built on.",
};

export default function StatsPage() {
  const byVector = [...new Set(INCIDENTS.map((incident) => incident.vector))]
    .map((vector) => ({
      label: vectorLabel(vector),
      value: INCIDENTS.filter((incident) => incident.vector === vector).length,
    }))
    .sort((a, b) => b.value - a.value);

  const bySeverity = SEVERITIES.map((severity) => ({
    label: severity,
    value: INCIDENTS.filter((incident) => incident.severity === severity).length,
  }));

  const totalMinutes = ACTIONS.reduce((sum, action) => sum + action.minutes, 0);
  const avgMinutes = Math.round(totalMinutes / ACTIONS.length);
  const surfaces = INCIDENTS.reduce((sum, incident) => sum + incident.affected.length, 0);
  const withCvss = INCIDENTS.filter((incident) => incident.cvss !== null).length;

  return (
    <Container>
      <PageHeader
        index="10"
        kicker="Dataset"
        title={
          <>
            The numbers behind
            <br />
            the <em className="text-amber">instrument</em>.
          </>
        }
        lede="Everything on this page is computed from files in the repository at request time. No warehouse, no nightly job, no cache to go stale."
        meta={
          <>
            <span>dataset 2026.10.23</span>
            <span>seed 2718</span>
            <span>static generation</span>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-px border-b border-line bg-line sm:grid-cols-4">
        <div className="bg-canvas px-4 py-5">
          <Stat value={INCIDENTS.length} label="Incidents" hint={`${withCvss} with CVSS`} />
        </div>
        <div className="bg-canvas px-4 py-5">
          <Stat
            value={STACK_CATALOG.length}
            label="Stack items"
            hint="10 categories"
            tone="amber"
          />
        </div>
        <div className="bg-canvas px-4 py-5">
          <Stat
            value={ACTIONS.length}
            label="Actions"
            hint={`${totalMinutes} min total`}
            tone="moss"
          />
        </div>
        <div className="bg-canvas px-4 py-5">
          <Stat value={surfaces} label="Surface links" hint="Incident → component" tone="rust" />
        </div>
      </div>

      <div className="grid gap-10 py-10 lg:grid-cols-2">
        <section>
          <Kicker>Severity mix</Kicker>
          <div className="mt-5 border border-line bg-surface p-5">
            <Bars data={bySeverity} tone="amber" />
          </div>
        </section>

        <section>
          <Kicker>Vector distribution</Kicker>
          <div className="mt-5 border border-line bg-surface p-5">
            <Bars data={byVector} tone="rust" />
          </div>
        </section>

        <section>
          <Kicker>Effort distribution</Kicker>
          <div className="mt-5 border border-line bg-surface p-5">
            <Bars
              data={[
                {
                  label: "under 10 min",
                  value: ACTIONS.filter((action) => action.minutes < 10).length,
                },
                {
                  label: "10–20 min",
                  value: ACTIONS.filter((action) => action.minutes >= 10 && action.minutes <= 20)
                    .length,
                },
                {
                  label: "21–40 min",
                  value: ACTIONS.filter((action) => action.minutes > 20 && action.minutes <= 40)
                    .length,
                },
                {
                  label: "over 40 min",
                  value: ACTIONS.filter((action) => action.minutes > 40).length,
                },
              ]}
              tone="amber"
            />
            <p className="mt-4 border-t border-line pt-3 font-mono text-[9px] uppercase tracking-[0.14em] text-faint">
              mean {avgMinutes} min · median{" "}
              {
                [...ACTIONS.map((action) => action.minutes)].sort((a, b) => a - b)[
                  Math.floor(ACTIONS.length / 2)
                ]
              }{" "}
              min
            </p>
          </div>
        </section>

        <section>
          <Kicker>Coverage</Kicker>
          <div className="mt-5 border border-line bg-surface">
            <Table>
              <thead>
                <tr>
                  <Th>Surface</Th>
                  <Th>Count</Th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    label: "Incidents with a stack surface",
                    value: INCIDENTS.filter((i) => i.affected.length > 0).length,
                  },
                  {
                    label: "Incidents matched by region only",
                    value: INCIDENTS.filter((i) => i.affected.length === 0).length,
                  },
                  { label: "Certificate records", value: CERTIFICATES.length },
                  { label: "Playbooks", value: PLAYBOOKS.length },
                  {
                    label: "Actions with a command",
                    value: ACTIONS.filter((a) => a.command).length,
                  },
                ].map((row) => (
                  <tr key={row.label}>
                    <Td>
                      <span className="text-xs text-ink">{row.label}</span>
                    </Td>
                    <Td>
                      <span className="font-mono text-xs tabular-nums text-muted">{row.value}</span>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </section>
      </div>

      <div className="mb-14 border border-line bg-surface p-6">
        <Kicker>How to reproduce</Kicker>
        <pre className="mt-4 overflow-x-auto border border-line bg-surface-2 p-4 font-mono text-[11px] leading-relaxed text-ink">
          {`bun install
bun run --filter @ferroscope/seed test
bun run --filter @ferroscope/core test
bun run loc`}
        </pre>
        <p className="mt-3 text-xs leading-relaxed text-muted">
          The dataset tests assert exactly 27 incidents, that every referenced stack item and action
          exists, and that timelines are chronologically ordered. A broken reference fails the
          build.
        </p>
      </div>
    </Container>
  );
}
