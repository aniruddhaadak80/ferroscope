import { Badge, ButtonLink, Callout, Card, Kicker, PageHeader, Quote, Stat } from "@ferroscope/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/container";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why Ferroscope exists, what it refuses to claim, and how a personal security audit turned into a public instrument.",
};

const PRINCIPLES = [
  {
    index: "01",
    title: "A headline is not an exposure",
    body: "Twenty-seven incidents is a lot of noise. The only useful question is which ones intersect something you actually run. Everything in the product is built around that filter.",
  },
  {
    index: "02",
    title: "Show the derivation",
    body: "Every score has a formula on a page you can read. If a number cannot be explained in a paragraph and a code block, it should not be on a dashboard.",
  },
  {
    index: "03",
    title: "Refuse the dramatic claim",
    body: "Ferroscope never says you were breached. It says your declared stack sits inside a blast path. The distance between those two sentences is the product's ethics.",
  },
  {
    index: "04",
    title: "Offline is a feature",
    body: "No feed, no API key, no LLM, no telemetry. The dataset is in git, the computation is local, and the whole thing works on a plane.",
  },
] as const;

export default function AboutPage() {
  return (
    <Container>
      <PageHeader
        index="18"
        kicker="About"
        title={
          <>
            Built after a week
            <br />
            of <em className="text-amber">reading</em>, not scrolling.
          </>
        }
        lede="Ferroscope started as a personal audit: which of the twenty-seven Black October incidents could actually reach this laptop? The answer was two. Turning that answer into an instrument took longer than finding it."
        meta={
          <>
            <span>aniruddha adak</span>
            <span>kolkata, india</span>
            <span>october 2026</span>
          </>
        }
      />

      <div className="grid gap-10 py-10 lg:grid-cols-[1fr_19rem] lg:items-start">
        <div className="space-y-10">
          <section>
            <Kicker>Origin</Kicker>
            <div className="mt-4 max-w-2xl space-y-4 text-base leading-relaxed text-muted">
              <p>
                The wave landed over forty-eight hours. PHP2Shell made the front pages, a
                certificate authority was quietly compromised, a hosting company announced it was
                shutting down, and a bank confirmed a breach affecting the region this laptop lives
                in.
              </p>
              <p>
                Reading all of it produced the wrong feeling: urgency without direction. So the work
                became mechanical. Write down what the machine actually runs. Write down what each
                incident actually needs. Intersect the two sets. The intersection was two incidents,
                and one of them had a three-minute fix.
              </p>
              <p>
                That gap — between twenty-seven headlines and two relevant items — is what
                Ferroscope visualises. Not to minimise the wave, but to make it actionable for one
                person at a time.
              </p>
            </div>
          </section>

          <Quote cite="The premise">
            Most breaches are not your breach. The ones that are tend to have a cheap first fix.
          </Quote>

          <section>
            <Kicker>Principles</Kicker>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {PRINCIPLES.map((principle) => (
                <Card key={principle.index} className="p-5">
                  <span className="font-mono text-[10px] tracking-[0.2em] text-faint">
                    {principle.index}
                  </span>
                  <p className="mt-4 font-display text-xl leading-tight text-ink">
                    {principle.title}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-muted">{principle.body}</p>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <Kicker>Colophon</Kicker>
            <div className="mt-4 divide-y divide-line border-y border-line">
              {[
                { label: "Display", value: "Instrument Serif" },
                { label: "Text", value: "Manrope" },
                { label: "Mono", value: "JetBrains Mono" },
                { label: "Palette", value: "Graphite, bone, signal amber, rust, moss" },
                { label: "Framework", value: "Next.js 15 · React 19 · TypeScript strict" },
                { label: "Engine", value: "Pure TypeScript, zero runtime dependencies" },
                { label: "Data", value: "27 incidents · 55 stack items · 24 actions" },
              ].map((row) => (
                <div key={row.label} className="grid gap-1 py-3 sm:grid-cols-[8rem_1fr]">
                  <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-faint">
                    {row.label}
                  </span>
                  <span className="text-sm text-ink">{row.value}</span>
                </div>
              ))}
            </div>
          </section>

          <Callout title="Corrections are welcome" tone="moss">
            The dataset is versioned like code and every incident carries sources. If something is
            wrong, open a pull request against the seed file with a link. That is a better
            correction mechanism than a comment thread.
          </Callout>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <Card className="p-5">
            <Kicker>The author</Kicker>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Aniruddha Adak is an AI agent engineer and full-stack developer in Kolkata. He
              contributes to open source, writes on DEV, and builds instruments for problems he
              personally needed solved.
            </p>
            <div className="mt-4 space-y-2">
              {[
                { label: "GitHub", href: "https://github.com/aniruddhaadak80" },
                { label: "DEV", href: "https://dev.to/aniruddhaadak" },
                { label: "X", href: "https://x.com/asi369_" },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between border border-line px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted hover:border-amber hover:text-amber"
                >
                  {link.label}
                  <span aria-hidden>→</span>
                </a>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <Kicker>Numbers</Kicker>
            <div className="mt-3 grid grid-cols-2 gap-px border border-line bg-line">
              <div className="bg-surface px-3 py-3">
                <Stat value="27" label="Incidents" />
              </div>
              <div className="bg-surface px-3 py-3">
                <Stat value="24" label="Actions" tone="amber" />
              </div>
              <div className="bg-surface px-3 py-3">
                <Stat value="8" label="Playbooks" tone="moss" />
              </div>
              <div className="bg-surface px-3 py-3">
                <Stat value="0" label="API keys" tone="rust" />
              </div>
            </div>
          </Card>

          <div className="border border-line bg-surface p-5">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-faint">Project</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <ButtonLink href="/method" variant="outline" size="sm">
                Method
              </ButtonLink>
              <ButtonLink href="/changelog" variant="ghost" size="sm">
                Changelog
              </ButtonLink>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {["MIT", "Next.js", "TypeScript", "no telemetry"].map((tag) => (
                <Badge key={tag} tone="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <p className="text-center font-mono text-[9px] uppercase tracking-[0.16em] text-faint">
            <Link href="/atlas" className="hover:text-amber">
              Read the atlas →
            </Link>
          </p>
        </aside>
      </div>
    </Container>
  );
}
