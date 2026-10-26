import { PageHeader } from "@ferroscope/ui";
import type { Metadata } from "next";
import { Container } from "@/components/container";
import { ProfileEditor } from "@/components/profile-editor";

export const metadata: Metadata = {
  title: "Declare your stack",
  description:
    "Tick what you actually run. Ferroscope matches against 27 incidents locally, in your browser, and stores the profile nowhere else.",
};

export default function ProfilePage() {
  return (
    <Container>
      <PageHeader
        index="02"
        kicker="Your stack"
        title={
          <>
            Tell the instrument
            <br />
            what you <em className="text-amber">actually</em> run.
          </>
        }
        lede="Two dozen components decide whether a headline is your problem. Everything here is stored in localStorage and never leaves the tab unless you ask for a report."
        meta={
          <>
            <span>localStorage only</span>
            <span>no account</span>
            <span>live recompute</span>
          </>
        }
      />
      <div className="py-10">
        <ProfileEditor />
      </div>
    </Container>
  );
}
