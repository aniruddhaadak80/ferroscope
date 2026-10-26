import { formatMinutes, vectorLabel } from "@ferroscope/core";
import { PLAYBOOKS, PLAYBOOKS_BY_SLUG } from "@ferroscope/seed";
import {
  Badge,
  ButtonLink,
  Card,
  Kicker,
  PageHeader,
  Timeline,
  TimelineEntry,
} from "@ferroscope/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/container";

export function generateStaticParams() {
  return PLAYBOOKS.map((playbook) => ({ slug: playbook.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const playbook = PLAYBOOKS_BY_SLUG.get(slug);
  if (!playbook) return { title: "Playbook not found" };
  return { title: playbook.title, description: playbook.summary };
}

export default async function PlaybookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const playbook = PLAYBOOKS_BY_SLUG.get(slug);
  if (!playbook) notFound();

  const index = PLAYBOOKS.findIndex((item) => item.slug === playbook.slug);
  const next = PLAYBOOKS[(index + 1) % PLAYBOOKS.length];
  const total = playbook.steps.reduce((sum, step) => sum + step.minutes, 0);

  return (
    <Container>
      <nav aria-label="Breadcrumb" className="pt-8">
        <Link
          href="/playbooks"
          className="font-mono text-[9px] uppercase tracking-[0.2em] text-faint hover:text-amber"
        >
          ← Playbooks
        </Link>
      </nav>

      <PageHeader
        kicker={playbook.kicker}
        title={playbook.title}
        lede={playbook.summary}
        meta={
          <>
            <span>{playbook.steps.length} steps</span>
            <span>{formatMinutes(total)}</span>
            <span>no tools required</span>
          </>
        }
        actions={
          next ? (
            <ButtonLink href={`/playbooks/${next.slug}`} variant="outline" size="sm">
              Next · {next.title}
            </ButtonLink>
          ) : null
        }
      />

      <div className="grid gap-10 py-10 lg:grid-cols-[1fr_18rem] lg:items-start">
        <div>
          <Kicker>The procedure</Kicker>
          <Timeline className="mt-6">
            {playbook.steps.map((step, stepIndex) => (
              <TimelineEntry
                key={step.title}
                title={step.title}
                meta={`Step ${String(stepIndex + 1).padStart(2, "0")} · ${formatMinutes(step.minutes)}`}
                last={stepIndex === playbook.steps.length - 1}
                tone={stepIndex === 0 ? "rust" : "amber"}
              >
                {step.detail}
              </TimelineEntry>
            ))}
          </Timeline>

          {playbook.command ? (
            <section className="mt-10">
              <Kicker>Command</Kicker>
              <pre className="mt-4 overflow-x-auto border border-line bg-surface p-4 font-mono text-[11px] leading-relaxed text-ink">
                {playbook.command}
              </pre>
              <p className="mt-2 text-xs leading-relaxed text-faint">
                Read it before running it. Every command in this repository is a plain shell
                command, not a downloaded script.
              </p>
            </section>
          ) : null}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <Card className="p-5">
            <Kicker>Applies to</Kicker>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {playbook.forVectors.map((vector) => (
                <Badge key={vector} tone="outline">
                  {vectorLabel(vector)}
                </Badge>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <Kicker>Before you start</Kicker>
            <ul className="mt-3 space-y-2.5">
              {[
                "Work from a device you believe is clean if credentials are involved.",
                "Change passwords from the official app or a typed URL, never a link.",
                "Record the time of each step; you will want it later.",
              ].map((item) => (
                <li key={item} className="flex gap-2 text-xs leading-relaxed text-muted">
                  <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 bg-amber" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5">
            <Kicker>Afterwards</Kicker>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Open the planner and mark the matching actions complete. The residual risk number is a
              better record of what you did than a memory of what you meant to do.
            </p>
            <div className="mt-4">
              <ButtonLink href="/planner" variant="outline" size="sm">
                Open the planner
              </ButtonLink>
            </div>
          </Card>
        </aside>
      </div>
    </Container>
  );
}
