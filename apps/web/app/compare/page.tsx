import { ButtonLink, PageHeader } from "@ferroscope/ui";
import type { Metadata } from "next";
import { CompareView } from "@/components/compare-view";
import { Container } from "@/components/container";

export const metadata: Metadata = {
  title: "Compare profiles",
  description:
    "Put your declared stack next to four scenarios and see which single change moves the risk the most.",
};

export default function ComparePage() {
  return (
    <Container>
      <PageHeader
        index="14"
        kicker="Compare"
        title={
          <>
            Which change
            <br />
            <em className="text-amber">actually</em> moves the number.
          </>
        }
        lede="Four scenarios, one live profile. Toggle them on and off; the delta column is computed against your stack, not against a baseline someone chose for you."
        meta={
          <>
            <span>live comparison</span>
            <span>delta vs your profile</span>
          </>
        }
        actions={
          <ButtonLink href="/scenarios" variant="outline" size="sm">
            Scenario notes
          </ButtonLink>
        }
      />
      <div className="py-10">
        <CompareView />
      </div>
    </Container>
  );
}
