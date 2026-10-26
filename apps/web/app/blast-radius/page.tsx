import { ButtonLink, PageHeader } from "@ferroscope/ui";
import type { Metadata } from "next";
import { BlastRadiusView } from "@/components/blast-radius-view";
import { Container } from "@/components/container";

export const metadata: Metadata = {
  title: "Blast radius",
  description:
    "An interactive, deterministic graph of every declared component that intersects the Black October incident set.",
};

export default function BlastRadiusPage() {
  return (
    <Container>
      <PageHeader
        index="03"
        kicker="Blast radius"
        title={
          <>
            The shortest honest
            <br />
            explanation of <em className="text-amber">why</em>.
          </>
        }
        lede="Nodes are components you declared. Edges are intersections computed by the matcher. Near misses sit one step away so you can see what a single install would add."
        actions={
          <>
            <ButtonLink href="/profile" variant="outline" size="sm">
              Edit stack
            </ButtonLink>
            <ButtonLink href="/cascade" size="sm">
              Run the cascade
            </ButtonLink>
          </>
        }
      />
      <div className="py-10">
        <BlastRadiusView />
      </div>
    </Container>
  );
}
