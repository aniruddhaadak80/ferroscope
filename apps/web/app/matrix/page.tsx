import { SEVERITIES, type Severity, VECTORS, vectorLabel } from "@ferroscope/core";
import { INCIDENTS } from "@ferroscope/seed";
import { Badge, Kicker, PageHeader, SeverityChip, Table, Td, Th } from "@ferroscope/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/container";

export const metadata: Metadata = {
  title: "Risk matrix",
  description:
    "Severity against vector: where the twenty-seven incidents cluster, and which intersection is empty on purpose.",
};

const TONE: Record<Severity, string> = {
  critical: "bg-rust/[0.14] text-rust border-rust/30",
  high: "bg-amber/[0.14] text-amber border-amber/30",
  medium: "bg-line/40 text-muted border-line",
  low: "bg-moss/[0.12] text-moss border-moss/30",
};

export default function MatrixPage() {
  const cells = new Map<string, number>();
  for (const incident of INCIDENTS) {
    const key = `${incident.vector}:${incident.severity}`;
    cells.set(key, (cells.get(key) ?? 0) + 1);
  }

  const usedVectors = VECTORS.filter((vector) =>
    INCIDENTS.some((incident) => incident.vector === vector),
  );

  return (
    <Container>
      <PageHeader
        index="09"
        kicker="Matrix"
        title={
          <>
            Where the wave
            <br />
            <span className="text-muted">actually</span> clusters.
          </>
        }
        lede="Severity on one axis, vector on the other. The empty cells are as informative as the full ones: the wave hit servers and hosting hardest and barely touched browsers directly."
        meta={
          <>
            <span>{usedVectors.length} vectors</span>
            <span>{SEVERITIES.length} severities</span>
            <span>{INCIDENTS.length} incidents</span>
          </>
        }
      />

      <div className="py-10">
        <div className="overflow-x-auto border border-line bg-surface p-4">
          <table className="w-full min-w-[46rem] border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 bg-surface px-2 py-2 text-left font-mono text-[9px] uppercase tracking-[0.16em] text-faint">
                  Vector
                </th>
                {SEVERITIES.map((severity) => (
                  <th
                    key={severity}
                    className="px-2 py-2 text-center font-mono text-[9px] uppercase tracking-[0.16em] text-faint"
                  >
                    {severity}
                  </th>
                ))}
                <th className="px-2 py-2 text-right font-mono text-[9px] uppercase tracking-[0.16em] text-faint">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {usedVectors.map((vector) => {
                const rowTotal = INCIDENTS.filter((incident) => incident.vector === vector).length;
                return (
                  <tr key={vector} className="border-t border-line">
                    <th
                      scope="row"
                      className="sticky left-0 bg-surface px-2 py-2 text-left text-xs font-normal text-ink"
                    >
                      {vectorLabel(vector)}
                    </th>
                    {SEVERITIES.map((severity) => {
                      const count = cells.get(`${vector}:${severity}`) ?? 0;
                      return (
                        <td key={severity} className="px-1 py-1">
                          <div
                            className={`flex h-11 items-center justify-center border font-mono text-sm tabular-nums ${
                              count === 0 ? "border-line/40 text-faint" : TONE[severity]
                            }`}
                            title={`${vectorLabel(vector)} · ${severity}: ${count}`}
                          >
                            {count === 0 ? "·" : count}
                          </div>
                        </td>
                      );
                    })}
                    <td className="px-2 py-2 text-right font-mono text-sm tabular-nums text-ink">
                      {rowTotal}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            {
              label: "Densest cell",
              value: "web-server × critical",
              note: "PHP2Shell, GitLab Onigmo, and the WordPress backdoor all resolve to server-side execution.",
            },
            {
              label: "Widest vector",
              value: "hosting",
              note: "Railway, Zeabur, Onamae, OVHcloud, and TiDB Cloud: five control planes, one failure mode.",
            },
            {
              label: "Thinnest",
              value: "browser",
              note: "No browser-engine incident in this window. That is a fact about October, not a guarantee about November.",
            },
          ].map((item) => (
            <div key={item.label} className="border border-line bg-surface p-5">
              <Kicker>{item.label}</Kicker>
              <p className="mt-3 font-display text-xl leading-tight text-ink">{item.value}</p>
              <p className="mt-2 text-xs leading-relaxed text-muted">{item.note}</p>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Kicker>Full table</Kicker>
          <div className="mt-4 border border-line bg-surface">
            <Table>
              <thead>
                <tr>
                  <Th>Incident</Th>
                  <Th>Severity</Th>
                  <Th>Vector</Th>
                  <Th>Surfaces</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {INCIDENTS.map((incident) => (
                  <tr key={incident.slug}>
                    <Td>
                      <Link href={`/atlas/${incident.slug}`} className="text-ink hover:text-amber">
                        {incident.name}
                      </Link>
                    </Td>
                    <Td>
                      <SeverityChip severity={incident.severity} />
                    </Td>
                    <Td>
                      <span className="font-mono text-[10px] uppercase tracking-[0.12em]">
                        {vectorLabel(incident.vector)}
                      </span>
                    </Td>
                    <Td>
                      <span className="font-mono text-[10px] tabular-nums text-muted">
                        {incident.affected.length}
                      </span>
                    </Td>
                    <Td>
                      <Badge tone="outline">{incident.status}</Badge>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      </div>
    </Container>
  );
}
