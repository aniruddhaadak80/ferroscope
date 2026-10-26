import { Badge, Card, Kicker, PageHeader } from "@ferroscope/ui";
import type { Metadata } from "next";
import { Container } from "@/components/container";

export const metadata: Metadata = {
  title: "Roadmap",
  description:
    "What shipped, what is next, and what Ferroscope refuses to build — including the features that would require a scanner or an account.",
};

const COLUMNS = [
  {
    title: "Shipped",
    tone: "moss" as const,
    items: [
      "27-incident dataset with sources and timelines",
      "Exposure matcher and risk bands",
      "Interactive blast-radius graph",
      "Cascade simulator with scrubber",
      "Risk-per-minute planner with residual risk",
      "Certificate trust ledger",
      "Eight playbooks with commands",
      "Printable and exportable reports",
      "Stateless API with zod validation",
    ],
  },
  {
    title: "Next",
    tone: "amber" as const,
    items: [
      "Dataset diffing: what changed between two snapshots",
      "Per-package patch levels instead of a single auto-update flag",
      "Saved comparison links that encode a profile in the URL fragment",
      "Keyboard-first navigation for the atlas table",
      "Accessibility audit with axe in CI",
    ],
  },
  {
    title: "Later",
    tone: "rust" as const,
    items: [
      "Optional local scanner that never uploads inventory",
      "Import from package manifests to prefill the stack",
      "Playbook progress persisted per profile",
      "Multi-language dataset annotations",
    ],
  },
] as const;

const REFUSALS = [
  {
    title: "No account system",
    body: "A security tool that asks for your email before telling you anything is a lead-generation form. The profile stays in localStorage.",
  },
  {
    title: "No LLM summarisation",
    body: "An explanation that changes between runs cannot be audited. The exposure notes are written, reviewed, and versioned.",
  },
  {
    title: "No live threat feed",
    body: "A feed adds freshness and removes reproducibility. The dataset is a snapshot with a date, and reports name it.",
  },
  {
    title: "No scanner that uploads",
    body: "Inventory is the most sensitive data a security product can hold. Until a scanner can run entirely local, it does not ship.",
  },
] as const;

export default function RoadmapPage() {
  return (
    <Container>
      <PageHeader
        index="20"
        kicker="Roadmap"
        title={
          <>
            What ships next,
            <br />
            and what <em className="text-amber">never</em> will.
          </>
        }
        lede="A public roadmap is a promise about direction, not a schedule. The refusal list matters more than the feature list."
        meta={<span>updated 2026-10-24</span>}
      />

      <div className="grid gap-4 py-10 lg:grid-cols-3">
        {COLUMNS.map((column) => (
          <Card key={column.title} className="p-5">
            <div className="flex items-center justify-between gap-3">
              <Kicker>{column.title}</Kicker>
              <Badge tone={column.tone}>{column.items.length}</Badge>
            </div>
            <ul className="mt-4 space-y-2.5">
              {column.items.map((item) => (
                <li
                  key={item}
                  className="flex gap-2.5 border-b border-line/60 pb-2.5 text-sm text-muted last:border-0"
                >
                  <span
                    aria-hidden
                    className={`mt-1.5 h-1 w-1 shrink-0 ${
                      column.tone === "moss"
                        ? "bg-moss"
                        : column.tone === "amber"
                          ? "bg-amber"
                          : "bg-rust"
                    }`}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <div className="mb-14">
        <Kicker>Refusals</Kicker>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {REFUSALS.map((refusal) => (
            <div key={refusal.title} className="border-l-2 border-rust bg-surface p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink">
                {refusal.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{refusal.body}</p>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
