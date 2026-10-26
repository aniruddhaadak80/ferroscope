import { formatMinutes, vectorLabel } from "@ferroscope/core";
import { PLAYBOOKS } from "@ferroscope/seed";
import { Badge, Card, Kicker, PageHeader, Stat } from "@ferroscope/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/container";

export const metadata: Metadata = {
  title: "Playbooks",
  description:
    "Eight short, specific procedures for the hours after a disclosure: stop the bleed, fix certificate trust, browser hygiene, bank safety, and more.",
};

export default function PlaybooksPage() {
  const totalMinutes = PLAYBOOKS.reduce(
    (sum, playbook) => sum + playbook.steps.reduce((inner, step) => inner + step.minutes, 0),
    0,
  );

  return (
    <Container>
      <PageHeader
        index="13"
        kicker="Playbooks"
        title={
          <>
            Procedures, not
            <br />
            <em className="text-amber">principles</em>.
          </>
        }
        lede="Each playbook fits in a sitting and assumes no security background. Steps are ordered by what closes access fastest, not by what is most interesting."
        meta={
          <>
            <span>{PLAYBOOKS.length} playbooks</span>
            <span>{totalMinutes} min total</span>
            <span>command included where useful</span>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-px border-b border-line bg-line sm:grid-cols-4">
        <div className="bg-canvas px-4 py-5">
          <Stat value={PLAYBOOKS.length} label="Playbooks" hint="Eight procedures" />
        </div>
        <div className="bg-canvas px-4 py-5">
          <Stat
            value={PLAYBOOKS.reduce((sum, playbook) => sum + playbook.steps.length, 0)}
            label="Steps"
            hint="All specific"
            tone="amber"
          />
        </div>
        <div className="bg-canvas px-4 py-5">
          <Stat
            value={Math.round(totalMinutes / 60)}
            label="Hours"
            hint="To run everything"
            tone="moss"
          />
        </div>
        <div className="bg-canvas px-4 py-5">
          <Stat value="15" label="Minutes" hint="For stop-the-bleed" tone="rust" />
        </div>
      </div>

      <div className="grid gap-4 py-10 sm:grid-cols-2">
        {PLAYBOOKS.map((playbook, index) => {
          const minutes = playbook.steps.reduce((sum, step) => sum + step.minutes, 0);
          return (
            <Link
              key={playbook.slug}
              href={`/playbooks/${playbook.slug}`}
              className="group flex flex-col border border-line bg-surface p-5 transition-colors hover:border-amber/60"
            >
              <div className="flex items-start justify-between gap-3">
                <Kicker index={String(index + 1).padStart(2, "0")}>{playbook.kicker}</Kicker>
                <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-faint">
                  {formatMinutes(minutes)}
                </span>
              </div>
              <h2 className="mt-5 font-display text-2xl leading-tight text-ink group-hover:text-amber">
                {playbook.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{playbook.summary}</p>
              <div className="mt-auto flex flex-wrap gap-1.5 pt-5">
                {playbook.forVectors.map((vector) => (
                  <Badge key={vector} tone="outline">
                    {vectorLabel(vector)}
                  </Badge>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-3 font-mono text-[9px] uppercase tracking-[0.14em] text-faint">
                <span>{playbook.steps.length} steps</span>
                <span className="text-amber">Open →</span>
              </div>
            </Link>
          );
        })}
      </div>

      <Card className="mb-14 p-6">
        <Kicker>How to use these</Kicker>
        <div className="mt-4 grid gap-5 sm:grid-cols-3">
          {[
            {
              title: "Pick by trigger, not by title",
              body: "The first line of each playbook says when it applies. If the trigger has not happened, the playbook is not urgent.",
            },
            {
              title: "Do the top step within the hour",
              body: "Every procedure is ordered by access closure. If you only do one step, do the first one.",
            },
            {
              title: "Write down the time",
              body: "A short timestamped note turns a panicked afternoon into a report you can hand to anyone.",
            },
          ].map((item) => (
            <div key={item.title}>
              <p className="text-sm font-medium text-ink">{item.title}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </Card>
    </Container>
  );
}
