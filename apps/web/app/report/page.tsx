import { ButtonLink, PageHeader } from "@ferroscope/ui";
import type { Metadata } from "next";
import { Container } from "@/components/container";
import { ReportView } from "@/components/report-view";

export const metadata: Metadata = {
  title: "Exposure report",
  description:
    "A printable, exportable record of your declared stack, matched incidents, and recommended fix order.",
};

export default function ReportPage() {
  return (
    <Container>
      <PageHeader
        index="17"
        kicker="Report"
        title={
          <>
            A document you can
            <br />
            <em className="text-amber">hand</em> to someone.
          </>
        }
        lede="Generated entirely in the browser from your stored profile. Print it, save it as PDF, or copy the JSON the model used."
        meta={
          <>
            <span>print-ready</span>
            <span>json export</span>
            <span>no server storage</span>
          </>
        }
        actions={
          <ButtonLink href="/profile" variant="outline" size="sm">
            Edit stack
          </ButtonLink>
        }
      />
      <div className="py-10">
        <ReportView />
      </div>
    </Container>
  );
}
