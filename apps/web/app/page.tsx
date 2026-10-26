import {
  buildBlastGraph,
  computeExposure,
  formatMinutes,
  type Incident,
  rankActions,
} from "@ferroscope/core";
import {
  ACTIONS,
  DEFAULT_PROFILE,
  INCIDENTS,
  INCIDENTS_BY_SLUG,
  STACK_CATALOG,
} from "@ferroscope/seed";
import {
  Badge,
  ButtonLink,
  Card,
  Kicker,
  Meter,
  Reveal,
  SectionHeader,
  Stat,
} from "@ferroscope/ui";
import Link from "next/link";
import { BlastGraphStatic } from "@/components/blast-graph-static";
import { Container, Section } from "@/components/container";
import { Hero } from "@/components/hero";
import { IncidentCard } from "@/components/incident-card";

const report = computeExposure(DEFAULT_PROFILE, INCIDENTS, STACK_CATALOG);
const graph = buildBlastGraph(report, DEFAULT_PROFILE, STACK_CATALOG);
const plans = rankActions(ACTIONS, report)
  .filter((plan) => plan.relevant.length > 0)
  .slice(0, 3);
const featuredSlugs = ["php2shell", "emudhra", "gitlab-onigmo", "litellm", "sbi", "meta-muse"];
const featured = featuredSlugs
  .map((slug) => INCIDENTS_BY_SLUG.get(slug))
  .filter((incident): incident is Incident => Boolean(incident));

const QUESTIONS = [
  {
    index: "01",
    title: "What actually touches me?",
    body: "A headline is not an exposure. Declare your browser, runtimes, hosts, CAs, and accounts; the matcher only fires on intersection.",
    href: "/blast-radius",
    cta: "Open the blast radius",
  },
  {
    index: "02",
    title: "How far does it spread?",
    body: "One compromised root becomes a browser session, then a CI token, then a deploy. The cascade simulator makes the path visible.",
    href: "/cascade",
    cta: "Run a cascade",
  },
  {
    index: "03",
    title: "What do I fix first?",
    body: "Rank by risk removed per minute, not by severity. A three-minute certificate refresh can outrank a two-hour audit.",
    href: "/planner",
    cta: "Open the planner",
  },
] as const;

const METHOD = [
  {
    title: "Deterministic",
    body: "The matcher, the graph layout, and the cascade are pure functions. Same profile, same numbers, every run.",
  },
  {
    title: "Offline seed",
    body: "All 27 incidents live in git with sources and timelines. No feed, no key, no network call required.",
  },
  {
    title: "Zero keys",
    body: "There is no LLM in the loop. Explanations come from the model, not a prompt, and they are reproducible.",
  },
  {
    title: "Private by default",
    body: "Your stack is stored in localStorage. The API computes a report and keeps nothing on the server.",
  },
] as const;

export default function HomePage() {
  return (
    <>
      <Hero report={report} graph={graph} incidents={INCIDENTS} />

      <Section className="border-b border-line py-14 sm:py-16">
        <Container className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <Kicker index="01">The wave</Kicker>
            <h2 className="mt-4 max-w-md font-display text-4xl leading-[1.02] tracking-[-0.02em] text-ink sm:text-5xl">
              Fourteen disclosures in forty-eight hours.
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4">
            <div className="bg-surface p-5">
              <Stat value="27" label="Incidents" hint="Seeded and cited" />
            </div>
            <div className="bg-surface p-5">
              <Stat value="14" label="In 48 hours" hint="The cascade window" tone="amber" />
            </div>
            <div className="bg-surface p-5">
              <Stat value="2" label="Touch this laptop" hint="eMudhra + SBI" tone="rust" />
            </div>
            <div className="bg-surface p-5">
              <Stat value="3 min" label="First fix" hint="certifi refresh" tone="moss" />
            </div>
          </div>
        </Container>
      </Section>

      <Section>
        <SectionHeader
          index="02"
          title="Three questions, one instrument."
          lede="Most breach dashboards answer a question you did not ask. Ferroscope answers the three that decide what you do next."
        />
        <div className="mt-8 grid gap-px border border-line bg-line md:grid-cols-3">
          {QUESTIONS.map((question) => (
            <Link
              key={question.index}
              href={question.href}
              className="group flex flex-col bg-surface p-6 transition-colors hover:bg-surface-2 sm:p-8"
            >
              <span className="font-mono text-[10px] tracking-[0.2em] text-faint">
                {question.index}
              </span>
              <h3 className="mt-8 font-display text-3xl leading-tight text-ink group-hover:text-amber">
                {question.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{question.body}</p>
              <span className="mt-8 font-mono text-[10px] uppercase tracking-[0.18em] text-amber">
                {question.cta} →
              </span>
            </Link>
          ))}
        </div>
      </Section>

      <Section className="border-y border-line bg-surface/60">
        <SectionHeader
          index="03"
          title="The files that matter."
          lede="Six of the twenty-seven, chosen because each one teaches a different failure mode. The atlas holds the rest."
          right={
            <ButtonLink href="/atlas" variant="outline" size="sm">
              All 27 →
            </ButtonLink>
          }
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((incident, index) => (
            <Reveal key={incident.slug} delay={index * 0.04}>
              <IncidentCard incident={incident} index={index + 1} />
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <Kicker index="04">Blast radius</Kicker>
            <h2 className="mt-4 font-display text-4xl leading-[1.02] tracking-[-0.02em] text-ink sm:text-5xl">
              A graph, not a headline.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-muted">
              The default laptop touches two incidents. One is a certificate authority that browsers
              blocked but Python still trusts. The other is a bank breach that turns a password into
              a money problem. The graph is the shortest honest explanation of why.
            </p>
            <ul className="mt-8 space-y-3 border-t border-line pt-6">
              {[
                "Nodes are only the components you declared.",
                "Edges are intersections, not guesses.",
                "Near misses are shown one step away, not hidden.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-muted">
                  <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 bg-amber" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <ButtonLink href="/blast-radius" variant="outline">
                Explore your graph
              </ButtonLink>
            </div>
          </div>

          <div className="border border-line bg-surface">
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-faint">
                Default profile · {report.examinedStack} declared components
              </span>
              <Badge tone="amber">Live model</Badge>
            </div>
            <BlastGraphStatic graph={graph} className="h-[26rem] w-full p-4 sm:h-[30rem]" />
            <div className="grid grid-cols-3 gap-px border-t border-line bg-line">
              {[
                { label: "Stack", value: report.examinedStack },
                { label: "Matched", value: report.exposed.length },
                {
                  label: "Near miss",
                  value: report.matches.filter((m) => !m.matched && m.missing.length <= 2).length,
                },
              ].map((item) => (
                <div key={item.label} className="bg-surface px-4 py-3">
                  <p className="font-display text-2xl tabular-nums text-ink">{item.value}</p>
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-faint">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section className="border-y border-line bg-surface/60">
        <SectionHeader
          index="05"
          title="The fix order is the product."
          lede="Ranked by risk removed per minute. Completing an action recalculates the residual risk multiplicatively, so the numbers cannot lie."
          right={
            <ButtonLink href="/planner" variant="outline" size="sm">
              Open planner →
            </ButtonLink>
          }
        />
        <div className="mt-8 divide-y divide-line border border-line bg-surface">
          {plans.map((plan, index) => (
            <div
              key={plan.action.id}
              className="grid gap-4 p-5 sm:grid-cols-[2rem_1fr_7rem_8rem] sm:items-center"
            >
              <span className="font-mono text-[10px] text-faint">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="text-sm font-medium text-ink">{plan.action.title}</p>
                <p className="mt-1 line-clamp-1 text-xs text-muted">{plan.action.detail}</p>
              </div>
              <div className="flex items-center gap-3 sm:block">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
                  {formatMinutes(plan.action.minutes)}
                </span>
                <span className="font-mono text-[10px] text-amber sm:mt-1 sm:block">
                  −{plan.riskReduced} pts
                </span>
              </div>
              <Meter
                value={Math.min(100, plan.efficiency * 8)}
                tone="amber"
                hint={`${plan.efficiency}/min`}
              />
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeader
          index="06"
          title="Built to be inspected."
          lede="No black box, no API key, no telemetry. The whole instrument is a repository you can read in an afternoon."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {METHOD.map((item) => (
            <Card key={item.title} className="p-5">
              <h3 className="font-display text-xl text-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
            </Card>
          ))}
        </div>
      </Section>

      <section className="border-t border-line bg-ink text-canvas">
        <Container className="flex flex-col gap-8 py-16 sm:py-20 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-canvas/50">
              The instrument is ready
            </p>
            <h2 className="mt-4 max-w-2xl font-display text-4xl leading-[0.98] tracking-[-0.02em] sm:text-6xl">
              Point it at your own stack.
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/profile" size="lg">
              Declare your stack
            </ButtonLink>
            <ButtonLink
              href="/method"
              size="lg"
              variant="outline"
              className="border-canvas/25 text-canvas hover:border-amber hover:text-amber"
            >
              Read the method
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
