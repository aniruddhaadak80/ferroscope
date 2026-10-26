import { INCIDENTS } from "@ferroscope/seed";
import { ButtonLink, PageHeader, Stat } from "@ferroscope/ui";
import type { Metadata } from "next";
import { AtlasExplorer } from "@/components/atlas-explorer";
import { Container } from "@/components/container";

export const metadata: Metadata = {
  title: "Incident atlas",
  description:
    "All 27 incidents in the Ferroscope dataset, with sources, timelines, affected surfaces, and the exposure note that decides whether they matter to you.",
};

export default function AtlasPage() {
  const critical = INCIDENTS.filter((incident) => incident.severity === "critical").length;
  const last = INCIDENTS.reduce(
    (latest, incident) =>
      Date.parse(incident.disclosedAt) > Date.parse(latest) ? incident.disclosedAt : latest,
    INCIDENTS[0]?.disclosedAt ?? "",
  );

  return (
    <Container>
      <PageHeader
        index="01"
        kicker="The atlas"
        title={
          <>
            27 incidents.
            <br />
            <span className="text-muted">A very small number</span> of them are yours.
          </>
        }
        lede="Every file carries its own sources, timeline, affected surfaces, and one honest note about who it can actually reach. The atlas is the dataset, rendered."
        meta={
          <>
            <span>{INCIDENTS.length} files</span>
            <span>{critical} critical</span>
            <span>last disclosure {last.slice(0, 10)}</span>
          </>
        }
        actions={
          <>
            <ButtonLink href="/timeline" variant="outline" size="sm">
              48-hour timeline
            </ButtonLink>
            <ButtonLink href="/matrix" variant="ghost" size="sm">
              Risk matrix
            </ButtonLink>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-px border-b border-line bg-line sm:grid-cols-4">
        {[
          { value: "27", label: "Incidents", hint: "All cited" },
          { value: "14", label: "In 48 hours", hint: "The cascade" },
          { value: "9", label: "Vectors", hint: "Distinct surfaces" },
          { value: "0", label: "API keys", hint: "Fully offline" },
        ].map((item) => (
          <div key={item.label} className="bg-canvas px-4 py-5">
            <Stat value={item.value} label={item.label} hint={item.hint} />
          </div>
        ))}
      </div>

      <div className="py-10">
        <AtlasExplorer incidents={INCIDENTS} />
      </div>
    </Container>
  );
}
