import type { BlastGraph, ExposureReport, Incident } from "@ferroscope/core";
import { formatMinutes } from "@ferroscope/core";
import {
  Badge,
  BandChip,
  ButtonLink,
  Counter,
  GridBackdrop,
  Marquee,
  Meter,
  Reveal,
  Ring,
  Spotlight,
} from "@ferroscope/ui";
import Link from "next/link";
import { BlastGraphStatic } from "@/components/blast-graph-static";

export function Hero({
  report,
  graph,
  incidents,
}: {
  report: ExposureReport;
  graph: BlastGraph;
  incidents: readonly Incident[];
}) {
  return (
    <section className="relative isolate overflow-hidden border-b border-line">
      <GridBackdrop />
      <Spotlight />

      <span
        aria-hidden
        className="pointer-events-none absolute -right-10 top-10 hidden select-none font-display text-[22rem] leading-none text-ink/[0.035] lg:block"
      >
        01
      </span>

      <div className="mx-auto grid w-full max-w-[1440px] gap-14 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.18fr_0.82fr] lg:gap-20 lg:pb-24 lg:pt-20">
        <div className="relative">
          <Reveal>
            <div className="flex flex-wrap items-center gap-3">
              <span className="relative flex h-2 w-2 items-center justify-center">
                <span className="absolute h-2 w-2 animate-ferro-pulse bg-amber" />
                <span className="h-1 w-1 bg-amber" />
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-muted">
                Black October / Exposure observatory
              </span>
              <Badge tone="outline">Seed 2718</Badge>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="mt-8 text-balance font-display text-[clamp(3.1rem,7.6vw,7.2rem)] leading-[0.86] tracking-[-0.035em] text-ink">
              Map your <em className="text-amber">blast radius</em> before the breach does.
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mt-8 max-w-xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
              Twenty-seven incidents landed in forty-eight hours. Most of them cannot touch you.
              Ferroscope takes the stack you actually run and shows the two that can — then ranks
              the fixes by risk removed per minute.
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <ButtonLink href="/profile" size="lg">
                Declare your stack
              </ButtonLink>
              <ButtonLink href="/atlas" variant="outline" size="lg">
                Read the 27 incidents
              </ButtonLink>
            </div>
          </Reveal>

          <Reveal delay={0.3}>
            <dl className="mt-12 grid max-w-xl grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4">
              {[
                { label: "Incidents", value: report.totalIncidents },
                { label: "In your path", value: report.exposed.length },
                { label: "Safety score", value: report.score },
                { label: "First fix", value: 3, suffix: " min" },
              ].map((item) => (
                <div key={item.label} className="bg-surface px-4 py-4">
                  <dd className="font-display text-3xl tabular-nums leading-none text-ink">
                    <Counter value={item.value} suffix={item.suffix ?? ""} />
                  </dd>
                  <dt className="mt-2 font-mono text-[9px] uppercase tracking-[0.18em] text-faint">
                    {item.label}
                  </dt>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <Reveal delay={0.18} y={26}>
          <div className="border border-line-strong bg-surface">
            <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-amber" />
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
                  Default profile / this laptop
                </span>
              </div>
              <BandChip band={report.band} />
            </div>

            <div className="grid grid-cols-[auto_1fr] items-center gap-5 border-b border-line px-5 py-5">
              <Ring value={report.score} label="safety" tone="amber" size={118} />
              <div>
                <p className="font-display text-2xl leading-tight text-ink">
                  {report.exposed.length} incidents intersect this stack.
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">
                  Nothing is confirmed breached. Two things are inside the blast path.
                </p>
                <div className="mt-4">
                  <Meter
                    value={report.risk}
                    tone="rust"
                    label="Exposure"
                    hint={`${report.risk}/100`}
                  />
                </div>
              </div>
            </div>

            <div className="px-5 py-4">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-faint">
                Largest contributors
              </p>
              <div className="mt-3 divide-y divide-line">
                {report.exposed.slice(0, 3).map((match) => (
                  <Link
                    key={match.incident.slug}
                    href={`/atlas/${match.incident.slug}`}
                    className="flex items-center justify-between gap-4 py-2.5 transition-colors hover:text-amber"
                  >
                    <span className="min-w-0 truncate text-sm text-ink">{match.incident.name}</span>
                    <span className="font-mono text-[10px] tabular-nums text-amber">
                      +{match.contribution}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-t border-line px-5 py-4">
              <BlastGraphStatic graph={graph} className="h-44 w-full" />
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-line bg-surface-2 px-5 py-3">
              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-faint">
                Next best move · {formatMinutes(3)}
              </span>
              <Link
                href="/planner"
                className="font-mono text-[9px] uppercase tracking-[0.18em] text-amber hover:underline"
              >
                Open planner →
              </Link>
            </div>
          </div>
        </Reveal>
      </div>

      <div className="border-t border-line bg-surface py-3">
        <Marquee speed={64}>
          {incidents.slice(0, 14).map((incident) => (
            <span
              key={incident.slug}
              className="flex items-center gap-10 font-mono text-[10px] uppercase tracking-[0.22em] text-faint"
            >
              {incident.name}
              <span className="text-amber">◆</span>
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
