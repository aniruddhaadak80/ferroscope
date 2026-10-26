import { PageHeader } from "@ferroscope/ui";
import type { Metadata } from "next";
import { CascadePlayer } from "@/components/cascade-player";
import { Container } from "@/components/container";

export const metadata: Metadata = {
  title: "Cascade simulator",
  description:
    "Step through how a single disclosure reaches the rest of your stack: primary surface, lateral siblings, peak exposure, containment window.",
};

export default function CascadePage() {
  return (
    <Container>
      <PageHeader
        index="04"
        kicker="Cascade"
        title={
          <>
            One disclosure,
            <br />
            <span className="text-muted">twelve frames.</span>
          </>
        }
        lede="A deterministic narrative over your declared stack. Not a prediction engine — an instrument for making lateral movement visible before it happens to you."
        meta={
          <>
            <span>seed 2718</span>
            <span>12 frames</span>
            <span>play / step / scrub</span>
          </>
        }
      />
      <div className="py-10">
        <CascadePlayer />
      </div>
    </Container>
  );
}
