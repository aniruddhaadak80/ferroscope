import type { ExposureReport, Incident } from "@ferroscope/core";
import { formatDate, vectorLabel } from "@ferroscope/core";
import { Badge, Card, SeverityChip } from "@ferroscope/ui";
import Link from "next/link";

export function IncidentCard({
  incident,
  index,
  matched = false,
}: {
  incident: Incident;
  index?: number;
  matched?: boolean;
}) {
  return (
    <Link
      href={`/atlas/${incident.slug}`}
      className="group relative flex h-full flex-col border border-line bg-surface p-5 transition-colors hover:border-amber/60"
    >
      {index !== undefined ? (
        <span
          aria-hidden
          className="absolute right-4 top-4 font-mono text-[10px] tabular-nums tracking-[0.18em] text-faint"
        >
          {String(index).padStart(2, "0")}
        </span>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 pr-8">
        <SeverityChip severity={incident.severity} />
        <Badge tone="neutral">{vectorLabel(incident.vector)}</Badge>
        {matched ? <Badge tone="amber">In your path</Badge> : null}
      </div>

      <h3 className="mt-5 font-display text-2xl leading-tight text-ink transition-colors group-hover:text-amber">
        {incident.name}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{incident.headline}</p>

      <div className="mt-auto flex items-center justify-between gap-4 border-t border-line pt-4 font-mono text-[9px] uppercase tracking-[0.16em] text-faint">
        <span>{formatDate(incident.disclosedAt)}</span>
        <span className="text-muted transition-colors group-hover:text-amber">Open file →</span>
      </div>
    </Link>
  );
}

export function MatchedIncidentRow({ report }: { report: ExposureReport }) {
  return (
    <div className="divide-y divide-line">
      {report.exposed.map((match) => (
        <div key={match.incident.slug} className="flex items-center gap-4 py-3">
          <span
            aria-hidden
            className="h-1.5 w-1.5 shrink-0"
            style={{
              backgroundColor:
                match.incident.severity === "critical"
                  ? "var(--rust)"
                  : match.incident.severity === "high"
                    ? "var(--amber)"
                    : "var(--moss)",
            }}
          />
          <Link
            href={`/atlas/${match.incident.slug}`}
            className="min-w-0 flex-1 truncate text-sm text-ink hover:text-amber"
          >
            {match.incident.name}
          </Link>
          <span className="font-mono text-[10px] tabular-nums text-faint">
            +{match.contribution}
          </span>
        </div>
      ))}
      {report.exposed.length === 0 ? (
        <p className="py-4 text-sm text-muted">Nothing in this profile intersects the dataset.</p>
      ) : null}
    </div>
  );
}

export function IncidentMiniCard({ incident }: { incident: Incident }) {
  return (
    <Card className="h-full p-4">
      <div className="flex items-center justify-between gap-3">
        <SeverityChip severity={incident.severity} />
        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-faint">
          {vectorLabel(incident.vector)}
        </span>
      </div>
      <p className="mt-4 font-display text-lg leading-tight text-ink">{incident.name}</p>
      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">{incident.headline}</p>
    </Card>
  );
}
