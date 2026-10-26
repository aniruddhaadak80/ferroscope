import { Badge, Kicker, PageHeader, Timeline, TimelineEntry } from "@ferroscope/ui";
import type { Metadata } from "next";
import { Container } from "@/components/container";

export const metadata: Metadata = {
  title: "Changelog",
  description: "Every release of Ferroscope and the dataset version it serves.",
};

const RELEASES = [
  {
    version: "0.1.0",
    date: "2026-10-24",
    label: "First public release",
    detail:
      "27 incidents, 55 stack items, 24 actions, 8 playbooks, 5 certificate records, and 4 scenarios. The engine, the atlas, the blast radius, the cascade simulator, and the planner all ship together.",
    changes: [
      "Deterministic exposure matcher with exponential saturation and an 80% mitigation cap.",
      "Radial blast-graph layout with FNV-1a jitter and byte-stable output.",
      "Twelve-frame cascade narrative per incident.",
      "Risk-per-minute planner with multiplicative residual risk.",
      "Certificate trust ledger across system, Python, and Node stores.",
      "Stateless API routes with zod-validated payloads.",
      "Full light and dark palettes on Instrument Serif, Manrope, and JetBrains Mono.",
    ],
  },
  {
    version: "0.1.0-dataset",
    date: "2026-10-23",
    label: "Dataset sealed",
    detail:
      "The Black October snapshot frozen at 2026.10.23. Every incident carries sources, a timeline, and an exposure note. Seed 2718.",
    changes: [
      "14 incidents in the 48-hour wave.",
      "9 month-scale incidents kept for context.",
      "4 watchlist incidents with regional relevance.",
      "Two certificate records flagged as blocked in browsers but trusted elsewhere.",
    ],
  },
] as const;

export default function ChangelogPage() {
  return (
    <Container>
      <PageHeader
        index="19"
        kicker="Changelog"
        title={
          <>
            Small surface,
            <br />
            <em className="text-amber">dated</em> changes.
          </>
        }
        lede="The dataset and the engine version independently. A report is only reproducible against the pair it names."
        meta={<span>current 0.1.0</span>}
      />

      <div className="py-10">
        <Timeline>
          {RELEASES.map((release, index) => (
            <TimelineEntry
              key={release.version}
              title={
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm text-ink">{release.version}</span>
                  <Badge tone={index === 0 ? "amber" : "outline"}>{release.label}</Badge>
                </span>
              }
              meta={`${release.date} · ${release.changes.length} changes`}
              last={index === RELEASES.length - 1}
              tone={index === 0 ? "amber" : "muted"}
            >
              <p>{release.detail}</p>
              <ul className="mt-3 space-y-1.5">
                {release.changes.map((change) => (
                  <li key={change} className="flex gap-2 text-xs leading-relaxed text-muted">
                    <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 bg-amber" />
                    {change}
                  </li>
                ))}
              </ul>
            </TimelineEntry>
          ))}
        </Timeline>

        <div className="mt-12 border border-line bg-surface p-5">
          <Kicker>Version policy</Kicker>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            Two numbers travel together: the app version and the dataset version. The dataset
            version is a date because the incident set is a snapshot. If you compare two reports and
            the dataset versions differ, you are comparing different worlds.
          </p>
        </div>
      </div>
    </Container>
  );
}
