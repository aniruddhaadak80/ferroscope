import { assessTrust } from "@ferroscope/core";
import { CERTIFICATES, DEFAULT_PROFILE } from "@ferroscope/seed";
import {
  Badge,
  Callout,
  Card,
  Kicker,
  Meter,
  PageHeader,
  Stat,
  Table,
  Td,
  Th,
} from "@ferroscope/ui";
import type { Metadata } from "next";
import { Container } from "@/components/container";

export const metadata: Metadata = {
  title: "Certificate trust ledger",
  description:
    "Which roots are trusted by the OS, Python's certifi, and Node — and which of those stores still include a compromised eMudhra root.",
};

const STATUS_TONE = {
  trusted: "moss",
  distrusted: "rust",
  "blocked-in-browsers": "amber",
  retired: "neutral",
} as const;

export default function LedgerPage() {
  const assessment = assessTrust(CERTIFICATES, DEFAULT_PROFILE.stack);

  return (
    <Container>
      <PageHeader
        index="06"
        kicker="Trust ledger"
        title={
          <>
            A root can be blocked
            <br />
            in Chrome and <em className="text-amber">still</em> be trusted by Python.
          </>
        }
        lede="The October wave exposed a structural problem: browsers patched in hours, while vendored trust stores, Java keystores, and embedded clients kept trusting the same root for months. This ledger makes the gap readable."
        meta={
          <>
            <span>{CERTIFICATES.length} roots tracked</span>
            <span>3 stores compared</span>
            <span>snapshot 2026-10-23</span>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-px border-b border-line bg-line sm:grid-cols-4">
        <div className="bg-canvas px-4 py-5">
          <Stat value={assessment.total} label="Roots" hint="Tracked here" />
        </div>
        <div className="bg-canvas px-4 py-5">
          <Stat
            value={assessment.atRisk.length}
            label="At risk"
            hint="Blocked in browsers"
            tone="rust"
          />
        </div>
        <div className="bg-canvas px-4 py-5">
          <Stat
            value={assessment.pythonTrusted}
            label="In certifi"
            hint="Vendored bundle"
            tone="amber"
          />
        </div>
        <div className="bg-canvas px-4 py-5">
          <Stat
            value={assessment.score}
            label="Trust score"
            hint="0..100, higher safer"
            tone="moss"
          />
        </div>
      </div>

      <div className="grid gap-10 py-10 lg:grid-cols-[1fr_19rem] lg:items-start">
        <div>
          <div className="border border-line bg-surface">
            <Table>
              <thead>
                <tr>
                  <Th>Common name</Th>
                  <Th>Owner</Th>
                  <Th>Status</Th>
                  <Th>System</Th>
                  <Th>Python</Th>
                  <Th>Node</Th>
                </tr>
              </thead>
              <tbody>
                {CERTIFICATES.map((record) => (
                  <tr key={record.id}>
                    <Td>
                      <span className="font-mono text-[11px] text-ink">{record.commonName}</span>
                    </Td>
                    <Td>
                      <span className="text-xs">{record.owner}</span>
                    </Td>
                    <Td>
                      <Badge tone={STATUS_TONE[record.status]}>
                        {record.status.replaceAll("-", " ")}
                      </Badge>
                    </Td>
                    {[
                      { store: "system", present: record.systemStore },
                      { store: "python", present: record.pythonBundle },
                      { store: "node", present: record.nodeBundle },
                    ].map(({ store, present }) => (
                      <Td key={`${record.id}-${store}`}>
                        <span
                          aria-hidden="true"
                          className={`inline-block h-2 w-2 ${
                            present ? "bg-amber" : "border border-line-strong bg-transparent"
                          }`}
                        />
                        <span className="sr-only">{present ? "present" : "absent"}</span>
                      </Td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          <div className="mt-8 space-y-4">
            {CERTIFICATES.filter((record) => record.status === "blocked-in-browsers").map(
              (record) => (
                <Callout key={record.id} title={record.commonName} tone="rust">
                  {record.note}
                </Callout>
              ),
            )}
          </div>

          <div className="mt-8">
            <Kicker>What to do</Kicker>
            <ol className="mt-4 space-y-3">
              {[
                "Update the Python bundle: pip install --upgrade certifi. This is a three-minute fix and it is the highest-leverage one on the default profile.",
                "Install pending Windows updates and restart. Root distrust ships through the update channel, not through the browser.",
                "If you run Java, check cacerts separately. It does not follow the OS store.",
                "Search your repositories for vendored .pem bundles. A pinned CA file will never update itself.",
              ].map((step, index) => (
                <li key={step} className="flex gap-4 border-b border-line pb-3">
                  <span className="font-mono text-[10px] text-amber">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm leading-relaxed text-muted">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <Card className="p-5">
            <Kicker>Assessment</Kicker>
            <p className="mt-3 font-display text-4xl tabular-nums leading-none text-ink">
              {assessment.score}
              <span className="text-lg text-muted">/100</span>
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted">{assessment.note}</p>
            <div className="mt-4">
              <Meter
                value={assessment.score}
                tone="moss"
                label="Trust"
                hint={`${assessment.score}`}
              />
            </div>
          </Card>

          <Card className="p-5">
            <Kicker>Stores compared</Kicker>
            <dl className="mt-3 space-y-3">
              <div className="flex justify-between gap-3">
                <dt className="font-mono text-[9px] uppercase tracking-[0.16em] text-faint">
                  Windows
                </dt>
                <dd className="font-mono text-sm text-ink">{assessment.systemTrusted}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="font-mono text-[9px] uppercase tracking-[0.16em] text-faint">
                  certifi
                </dt>
                <dd className="font-mono text-sm text-ink">{assessment.pythonTrusted}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="font-mono text-[9px] uppercase tracking-[0.16em] text-faint">
                  Node
                </dt>
                <dd className="font-mono text-sm text-ink">
                  {CERTIFICATES.filter((record) => record.nodeBundle).length}
                </dd>
              </div>
            </dl>
          </Card>

          <Callout title="Scope limit" tone="neutral">
            Five roots, not the full CA universe. The ledger demonstrates the failure mode; it is
            not a compliance inventory. Treat it as a model you can extend.
          </Callout>
        </aside>
      </div>
    </Container>
  );
}
