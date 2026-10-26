import { formatDate, formatDateTime, vectorLabel } from "@ferroscope/core";
import { ACTIONS_BY_ID, INCIDENTS, INCIDENTS_BY_SLUG, STACK_BY_ID } from "@ferroscope/seed";
import {
  Badge,
  ButtonLink,
  Callout,
  Card,
  Kicker,
  SeverityChip,
  Stat,
  Timeline,
  TimelineEntry,
} from "@ferroscope/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/container";

export function generateStaticParams() {
  return INCIDENTS.map((incident) => ({ slug: incident.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const incident = INCIDENTS_BY_SLUG.get(slug);
  if (!incident) return { title: "Incident not found" };
  return {
    title: incident.name,
    description: incident.headline,
    openGraph: { title: `${incident.name} · Ferroscope`, description: incident.headline },
  };
}

export default async function IncidentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const incident = INCIDENTS_BY_SLUG.get(slug);
  if (!incident) notFound();

  const index = INCIDENTS.findIndex((item) => item.slug === incident.slug);
  const next = INCIDENTS[(index + 1) % INCIDENTS.length];
  const affected = incident.affected
    .map((id) => STACK_BY_ID.get(id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const mitigations = incident.mitigations
    .map((id) => ACTIONS_BY_ID.get(id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <Container>
      <nav aria-label="Breadcrumb" className="pt-8">
        <Link
          href="/atlas"
          className="font-mono text-[9px] uppercase tracking-[0.2em] text-faint hover:text-amber"
        >
          ← Atlas
        </Link>
      </nav>

      <header className="border-b border-line pb-10 pt-6">
        <div className="flex flex-wrap items-center gap-3">
          <SeverityChip severity={incident.severity} />
          <Badge tone="neutral">{vectorLabel(incident.vector)}</Badge>
          <Badge tone="outline">{incident.status}</Badge>
          {incident.cvss !== null ? (
            <Badge tone="amber">CVSS {incident.cvss.toFixed(1)}</Badge>
          ) : null}
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-faint">
            {formatDate(incident.disclosedAt)}
          </span>
        </div>

        <h1 className="mt-6 max-w-4xl text-balance font-display text-[clamp(2.6rem,6vw,5rem)] leading-[0.92] tracking-[-0.03em] text-ink">
          {incident.name}
        </h1>
        <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted">
          {incident.headline}
        </p>
      </header>

      <div className="grid gap-10 py-10 lg:grid-cols-[1fr_20rem] lg:items-start">
        <div className="space-y-10">
          <section>
            <Kicker>What happened</Kicker>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink">{incident.summary}</p>
          </section>

          <Callout
            title="Does this touch you?"
            tone={incident.affected.length > 0 ? "rust" : "neutral"}
          >
            {incident.exposureNote}
          </Callout>

          <section>
            <Kicker>Timeline</Kicker>
            <Timeline className="mt-6">
              {incident.timeline.map((entry, entryIndex) => (
                <TimelineEntry
                  key={entry.at + entry.label}
                  title={entry.label}
                  meta={formatDateTime(entry.at)}
                  tone={
                    incident.severity === "critical"
                      ? "rust"
                      : incident.severity === "high"
                        ? "amber"
                        : "moss"
                  }
                  last={entryIndex === incident.timeline.length - 1}
                >
                  {entry.detail}
                </TimelineEntry>
              ))}
            </Timeline>
          </section>

          {incident.iocs.length > 0 ? (
            <section>
              <Kicker>Indicators</Kicker>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {incident.iocs.map((ioc) => (
                  <code
                    key={ioc}
                    className="border border-line bg-surface px-2 py-1 font-mono text-[10px] text-muted"
                  >
                    {ioc}
                  </code>
                ))}
              </div>
              <p className="mt-3 text-xs leading-relaxed text-faint">
                Published indicators age quickly. Treat these as research artefacts, not a blocking
                list.
              </p>
            </section>
          ) : null}

          <section>
            <Kicker>Sources</Kicker>
            <ul className="mt-4 space-y-2">
              {incident.sources.map((source) => (
                <li key={source.url}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-baseline justify-between gap-4 border-b border-line py-2.5 transition-colors hover:text-amber"
                  >
                    <span className="text-sm text-ink group-hover:text-amber">{source.label}</span>
                    <span className="truncate font-mono text-[9px] text-faint">
                      {new URL(source.url).hostname}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
            <ButtonLink href={`/cascade?incident=${incident.slug}`} variant="outline" size="sm">
              Simulate this cascade
            </ButtonLink>
            {next ? (
              <Link
                href={`/atlas/${next.slug}`}
                className="font-mono text-[9px] uppercase tracking-[0.18em] text-faint hover:text-amber"
              >
                Next · {next.name} →
              </Link>
            ) : null}
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <Card className="p-5">
            <Kicker>Facts</Kicker>
            <dl className="mt-4 space-y-3">
              {[
                { label: "Disclosed", value: formatDate(incident.disclosedAt) },
                { label: "Window", value: incident.window === "48h" ? "48 hours" : "Month" },
                { label: "Severity", value: incident.severity },
                { label: "Status", value: incident.status },
                { label: "Regions", value: incident.regions.join(", ") },
                { label: "Vector", value: vectorLabel(incident.vector) },
              ].map((item) => (
                <div key={item.label} className="flex items-baseline justify-between gap-3">
                  <dt className="font-mono text-[9px] uppercase tracking-[0.16em] text-faint">
                    {item.label}
                  </dt>
                  <dd className="text-right text-xs capitalize text-ink">{item.value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card className="p-5">
            <Kicker>Affected surfaces</Kicker>
            {affected.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {affected.map((item) => (
                  <li key={item.id} className="border-b border-line/60 pb-2">
                    <p className="text-sm text-ink">{item.label}</p>
                    <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-faint">
                      {item.category} · {item.vendor}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm leading-relaxed text-muted">
                No stack surface by design. This incident is matched by region, sector, or account
                type instead.
              </p>
            )}
            <div className="mt-4">
              <ButtonLink href="/profile" variant="outline" size="sm">
                Check your stack
              </ButtonLink>
            </div>
          </Card>

          <Card className="p-5">
            <Kicker>Remediation</Kicker>
            {mitigations.length > 0 ? (
              <ol className="mt-3 space-y-3">
                {mitigations.map((action) => (
                  <li key={action.id}>
                    <p className="text-sm text-ink">{action.title}</p>
                    <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-amber">
                      {action.minutes} min · {Math.round(action.reduces * 100)}% covered
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-3 text-sm text-muted">
                No specific action. Hygiene settings in the profile model the indirect reduction.
              </p>
            )}
            <div className="mt-4">
              <ButtonLink href="/planner" variant="outline" size="sm">
                Open the planner
              </ButtonLink>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-px border border-line bg-line">
            <div className="bg-surface px-4 py-3">
              <Stat value={incident.affected.length} label="Surfaces" />
            </div>
            <div className="bg-surface px-4 py-3">
              <Stat value={incident.timeline.length} label="Events" tone="amber" />
            </div>
          </div>
        </aside>
      </div>
    </Container>
  );
}
