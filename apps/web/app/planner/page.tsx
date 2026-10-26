import { PageHeader } from "@ferroscope/ui";
import type { Metadata } from "next";
import { Container } from "@/components/container";
import { PlannerView } from "@/components/planner-view";

export const metadata: Metadata = {
  title: "Remediation planner",
  description:
    "Rank every fix by risk removed per minute. Tick what you have done and watch residual risk compound downward.",
};

export default function PlannerPage() {
  return (
    <Container>
      <PageHeader
        index="05"
        kicker="Planner"
        title={
          <>
            Fix the cheapest thing
            <br />
            <em className="text-amber">first</em>.
          </>
        }
        lede="Severity tells you what is loud. Efficiency tells you what is smart. The queue is sorted by risk points removed per minute, then by how many of your incidents the action actually touches."
        meta={
          <>
            <span>24 actions</span>
            <span>multiplicative residual</span>
            <span>saved locally</span>
          </>
        }
      />
      <div className="py-10">
        <PlannerView />
      </div>
    </Container>
  );
}
