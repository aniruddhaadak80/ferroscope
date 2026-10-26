import { computeExposure } from "@ferroscope/core";
import { INCIDENTS, SCENARIOS, STACK_CATALOG } from "@ferroscope/seed";
import { Badge, BandChip, ButtonLink, Card, Kicker, PageHeader } from "@ferroscope/ui";
import type { Metadata } from "next";
import { CompareView } from "@/components/compare-view";
import { Container } from "@/components/container";

export const metadata: Metadata = {
  title: "Scenarios",
  description:
    "Four reference profiles: the default laptop, the same laptop hardened, a small server operator, and a phone-only user.",
};

export default function ScenariosPage() {
  const rows = SCENARIOS.map((scenario) => ({
    scenario,
    report: computeExposure(scenario.profile, INCIDENTS, STACK_CATALOG),
  }));

  return (
    <Container>
      <PageHeader
        index="15"
        kicker="Scenarios"
        title={
          <>
            Four profiles,
            <br />
            one <em className="text-amber">engine</em>.
          </>
        }
        lede="The same matcher runs on a laptop, a hardened laptop, a small self-hosted stack, and a phone. If the model only worked for one of those, it would be a demo, not an instrument."
        meta={
          <>
            <span>{SCENARIOS.length} reference profiles</span>
            <span>{INCIDENTS.length} incidents each</span>
          </>
        }
      />

      <div className="grid gap-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {rows.map(({ scenario, report }) => (
          <Card key={scenario.id} className="flex h-full flex-col p-5">
            <div className="flex items-start justify-between gap-2">
              <Kicker>{scenario.id.replaceAll("-", " ")}</Kicker>
              <BandChip band={report.band} />
            </div>
            <p className="mt-4 font-display text-2xl leading-tight text-ink">{scenario.name}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted">{scenario.description}</p>
            <div className="mt-5 flex items-baseline gap-2">
              <span className="font-display text-5xl tabular-nums leading-none text-ink">
                {report.risk}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-faint">
                risk
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              <Badge tone="amber">{report.exposed.length} in path</Badge>
              <Badge tone="outline">{report.examinedStack} declared</Badge>
            </div>
            <ul className="mt-4 space-y-1.5">
              {report.exposed.slice(0, 3).map((match) => (
                <li key={match.incident.slug} className="flex justify-between gap-2 text-xs">
                  <span className="truncate text-muted">{match.incident.name}</span>
                  <span className="font-mono text-[9px] tabular-nums text-amber">
                    +{match.contribution}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <div className="pb-10">
        <Kicker>Compare directly</Kicker>
        <div className="mt-4">
          <CompareView />
        </div>
      </div>

      <div className="mb-14 border border-line bg-surface p-6">
        <Kicker>Why these four</Kicker>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
          They bracket the product's real audience. The default laptop is a working developer in
          India with real exposure. The hardened version isolates the effect of four changes. The
          server operator is where the October wave actually bites. The phone-only profile proves
          the model degrades gracefully when almost nothing is declared.
        </p>
        <div className="mt-4">
          <ButtonLink href="/profile" variant="outline" size="sm">
            Build your own
          </ButtonLink>
        </div>
      </div>
    </Container>
  );
}
