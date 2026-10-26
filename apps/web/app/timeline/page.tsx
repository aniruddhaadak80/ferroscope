import { formatShortTime, vectorLabel } from "@ferroscope/core";
import { INCIDENTS } from "@ferroscope/seed";
import { Badge, Kicker, PageHeader, SeverityChip, Stat } from "@ferroscope/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/container";

export const metadata: Metadata = {
  title: "48-hour timeline",
  description:
    "The Black October wave, hour by hour: fourteen disclosures in two days, the order they landed, and which ones matter to a developer laptop.",
};

const WAVE_START = Date.parse("2026-10-21T00:00:00Z");
const WAVE_END = Date.parse("2026-10-23T00:00:00Z");

const wave = INCIDENTS.filter((incident) => incident.window === "48h").sort(
  (a, b) => Date.parse(a.disclosedAt) - Date.parse(b.disclosedAt),
);

const days = ["2026-10-21", "2026-10-22", "2026-10-23"] as const;
const HOUR_TICKS = Array.from({ length: 49 }, (_, hour) => hour);

export default function TimelinePage() {
  const peakHour = wave.reduce<Record<string, number>>((accumulator, incident) => {
    const hour = incident.disclosedAt.slice(0, 13);
    accumulator[hour] = (accumulator[hour] ?? 0) + 1;
    return accumulator;
  }, {});
  const busiest = Object.entries(peakHour).sort((a, b) => b[1] - a[1])[0];

  return (
    <Container>
      <PageHeader
        index="08"
        kicker="Chronology"
        title={
          <>
            Forty-eight hours,
            <br />
            laid out <em className="text-amber">flat</em>.
          </>
        }
        lede="A wave is not a list. It is a sequence: disclosure, scanning, exploitation, and a second disclosure that lands while responders are still triaging the first."
        meta={
          <>
            <span>{wave.length} disclosures</span>
            <span>21–23 Oct 2026</span>
            <span>all times UTC</span>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-px border-b border-line bg-line sm:grid-cols-4">
        <div className="bg-canvas px-4 py-5">
          <Stat value={wave.length} label="In the wave" hint="48-hour window" tone="amber" />
        </div>
        <div className="bg-canvas px-4 py-5">
          <Stat value="6" label="Vectors" hint="Distinct surfaces" />
        </div>
        <div className="bg-canvas px-4 py-5">
          <Stat
            value={busiest?.[1] ?? 0}
            label="Peak hour"
            hint={busiest?.[0]?.slice(11) ?? "—"}
            tone="rust"
          />
        </div>
        <div className="bg-canvas px-4 py-5">
          <Stat value="2" label="Touch the laptop" hint="eMudhra + SBI" tone="rust" />
        </div>
      </div>

      <div className="py-10">
        <div className="border border-line bg-surface">
          <div className="flex items-center justify-between border-b border-line px-4 py-2">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-faint">
              21 Oct 00:00 → 23 Oct 00:00 UTC
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-faint">
              each tick = 1 hour
            </span>
          </div>
          <div className="relative h-28 px-3 py-4">
            <div className="absolute inset-x-3 top-1/2 h-px bg-line" />
            {HOUR_TICKS.map((hour) => {
              const isMajor = hour % 6 === 0;
              return (
                <span
                  key={`tick-${hour}`}
                  className={`absolute top-1/2 w-px ${isMajor ? "h-4 bg-line-strong" : "h-2 bg-line"}`}
                  style={{ left: `calc(${(hour / 48) * 100}% )` }}
                />
              );
            })}
            {wave.map((incident) => {
              const at = Date.parse(incident.disclosedAt);
              const position = Math.max(
                0,
                Math.min(1, (at - WAVE_START) / (WAVE_END - WAVE_START)),
              );
              const color =
                incident.severity === "critical"
                  ? "var(--rust)"
                  : incident.severity === "high"
                    ? "var(--amber)"
                    : "var(--moss)";
              return (
                <span
                  key={incident.slug}
                  title={`${incident.name} · ${incident.disclosedAt}`}
                  className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45"
                  style={{ left: `${position * 100}%`, backgroundColor: color }}
                />
              );
            })}
            <div className="absolute inset-x-3 bottom-1 flex justify-between font-mono text-[8px] uppercase tracking-[0.14em] text-faint">
              <span>21 Oct</span>
              <span>22 Oct</span>
              <span>23 Oct</span>
            </div>
          </div>
        </div>

        <div className="mt-10 space-y-12">
          {days.map((day) => {
            const entries = wave.filter((incident) => incident.disclosedAt.startsWith(day));
            if (entries.length === 0) return null;
            return (
              <section key={day}>
                <div className="flex items-baseline gap-4 border-b border-line pb-3">
                  <h2 className="font-display text-3xl leading-none text-ink">
                    {new Date(`${day}T00:00:00Z`).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "long",
                      timeZone: "UTC",
                    })}
                  </h2>
                  <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-faint">
                    {day.slice(0, 4)} · {entries.length} disclosures
                  </span>
                </div>

                <ol className="mt-6 space-y-0">
                  {entries.map((incident, index) => (
                    <li
                      key={incident.slug}
                      className="grid grid-cols-[4.5rem_1fr] gap-4 border-b border-line/60 py-4 last:border-0"
                    >
                      <div>
                        <p className="font-mono text-sm tabular-nums text-ink">
                          {formatShortTime(incident.disclosedAt)}
                        </p>
                        <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-faint">
                          UTC
                        </p>
                      </div>
                      <Link href={`/atlas/${incident.slug}`} className="group min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <SeverityChip severity={incident.severity} />
                          <Badge tone="neutral">{vectorLabel(incident.vector)}</Badge>
                          <span className="font-mono text-[9px] tabular-nums text-faint">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                        </div>
                        <p className="mt-2 text-base font-medium text-ink group-hover:text-amber">
                          {incident.name}
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-muted">
                          {incident.headline}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ol>
              </section>
            );
          })}
        </div>

        <div className="mt-12 border border-line bg-surface p-5">
          <Kicker>Why the order matters</Kicker>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
            Responders triage in the order things arrive, which is almost never the order of
            personal relevance. PHP2Shell landed first and dominated attention; the eMudhra root
            landed second and was the only one that could silently mint a trusted certificate for
            every domain. The timeline is a reminder that volume is not the same as impact.
          </p>
        </div>
      </div>
    </Container>
  );
}
