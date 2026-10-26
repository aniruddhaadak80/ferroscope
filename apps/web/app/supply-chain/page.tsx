import { formatMinutes, vectorLabel } from "@ferroscope/core";
import { ACTIONS, INCIDENTS } from "@ferroscope/seed";
import {
  Badge,
  ButtonLink,
  Callout,
  Card,
  Kicker,
  PageHeader,
  SeverityChip,
  Stat,
} from "@ferroscope/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/container";

export const metadata: Metadata = {
  title: "Supply chain",
  description:
    "The four ways a developer gets compromised without clicking anything: a package, a workflow, an update channel, and a hosting control plane.",
};

const supplyIncidents = INCIDENTS.filter((incident) =>
  ["supply-chain", "hosting"].includes(incident.vector),
);

const chainActions = ACTIONS.filter((action) =>
  ["supply-chain", "patching"].includes(action.category),
).slice(0, 8);

const STAGES = [
  {
    index: "01",
    title: "Update channel",
    body: "A signed binary is only as trustworthy as the pipeline that signed it. AOMEI, OVHcloud, and the WordPress plugin vendor all shipped malicious code through legitimate mechanisms.",
  },
  {
    index: "02",
    title: "Package registry",
    body: "LiteLLM was downloaded 3.4 million times a day. Install scripts run with your privileges, and an imported wheel can read every key the process can see.",
  },
  {
    index: "03",
    title: "CI workflow",
    body: "GitHub Actions holds deployment tokens. A workflow pinned to a tag can be moved by anyone who controls that tag. Pin to a commit SHA.",
  },
  {
    index: "04",
    title: "Control plane",
    body: "Railway, Zeabur, Onamae, and TiDB Cloud sit above your servers. Whoever owns the control plane can push code to every host beneath it.",
  },
] as const;

export default function SupplyChainPage() {
  const critical = supplyIncidents.filter((incident) => incident.severity === "critical").length;

  return (
    <Container>
      <PageHeader
        index="07"
        kicker="Supply chain"
        title={
          <>
            You do not have to click
            <br />
            anything to be <em className="text-amber">compromised</em>.
          </>
        }
        lede="Four of the twenty-seven incidents arrived through a trusted channel: an updater, a registry, a workflow, a hosting console. This page is the developer-specific cut of the dataset."
        meta={
          <>
            <span>{supplyIncidents.length} incidents</span>
            <span>{critical} critical</span>
            <span>{chainActions.length} actions</span>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-px border-b border-line bg-line sm:grid-cols-4">
        <div className="bg-canvas px-4 py-5">
          <Stat value="3.4M" label="Daily installs" hint="LiteLLM's reach" tone="rust" />
        </div>
        <div className="bg-canvas px-4 py-5">
          <Stat value="321k" label="Accounts" hint="Zeabur breach" tone="amber" />
        </div>
        <div className="bg-canvas px-4 py-5">
          <Stat value="26,739" label="Servers" hint="Onamae payload" tone="rust" />
        </div>
        <div className="bg-canvas px-4 py-5">
          <Stat value="0" label="Clicks needed" hint="Trusted channel" tone="moss" />
        </div>
      </div>

      <div className="grid gap-10 py-10 lg:grid-cols-[1fr_20rem] lg:items-start">
        <div className="space-y-10">
          <section>
            <Kicker>The chain</Kicker>
            <div className="mt-5 grid gap-px border border-line bg-line sm:grid-cols-2">
              {STAGES.map((stage) => (
                <div key={stage.index} className="bg-surface p-5">
                  <span className="font-mono text-[10px] tracking-[0.2em] text-faint">
                    {stage.index}
                  </span>
                  <h3 className="mt-5 font-display text-2xl leading-tight text-ink">
                    {stage.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{stage.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <Kicker>Incidents on this surface</Kicker>
            <div className="mt-4 divide-y divide-line border-y border-line">
              {supplyIncidents.map((incident) => (
                <Link
                  key={incident.slug}
                  href={`/atlas/${incident.slug}`}
                  className="group flex flex-wrap items-start gap-3 py-4 transition-colors hover:bg-surface"
                >
                  <SeverityChip severity={incident.severity} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink group-hover:text-amber">
                      {incident.name}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted">{incident.headline}</p>
                  </div>
                  <Badge tone="outline">{vectorLabel(incident.vector)}</Badge>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <Kicker>The audit order</Kicker>
            <ol className="mt-4 space-y-3">
              {chainActions.map((action, index) => (
                <li key={action.id} className="flex gap-4 border-b border-line pb-3">
                  <span className="font-mono text-[10px] text-amber">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-ink">{action.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted">{action.detail}</p>
                    <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-faint">
                      {formatMinutes(action.minutes)} · {Math.round(action.reduces * 100)}% of the
                      surface
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <Callout title="The uncomfortable part" tone="rust">
            Every incident on this page arrived through a channel the victim had already decided to
            trust. “Do not install random software” is not a defence. Version pinning, commit-SHA
            pinning, and key rotation are.
          </Callout>

          <Card className="p-5">
            <Kicker>Minimum viable posture</Kicker>
            <ul className="mt-3 space-y-2.5">
              {[
                "Pin third-party GitHub Actions to a commit SHA.",
                "Default GITHUB_TOKEN to read-only.",
                "Keep deploy keys in a manager, not in a repo.",
                "Rotate anything a compromised package could read.",
                "Prefer a hosting provider with scoped tokens.",
              ].map((item) => (
                <li key={item} className="flex gap-2 text-xs leading-relaxed text-muted">
                  <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 bg-amber" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <ButtonLink href="/playbooks/supply-chain" variant="outline" size="sm">
                Open the playbook
              </ButtonLink>
            </div>
          </Card>
        </aside>
      </div>
    </Container>
  );
}
