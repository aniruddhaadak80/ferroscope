"use client";

import {
  computeExposure,
  type ExposureReport,
  formatDateTime,
  rankActions,
} from "@ferroscope/core";
import { ACTIONS, INCIDENTS, STACK_BY_ID, STACK_CATALOG } from "@ferroscope/seed";
import { Badge, Button, Card, Kicker, SeverityChip } from "@ferroscope/ui";
import { useMemo, useState } from "react";
import { useProfile, useProfileHydrated } from "@/lib/store";

export function ReportView() {
  const hydrated = useProfileHydrated();
  const stored = useProfile((state) => state.profile);
  const profile = useMemo(
    () =>
      hydrated
        ? stored
        : {
            stack: [],
            region: "IN",
            bank: false,
            passwordManager: false,
            twoFactor: false,
            autoUpdates: false,
          },
    [hydrated, stored],
  );
  const [copied, setCopied] = useState(false);

  const report = useMemo(() => computeExposure(profile, INCIDENTS, STACK_CATALOG), [profile]);
  const plans = useMemo(
    () =>
      rankActions(ACTIONS, report)
        .filter((plan) => plan.relevant.length > 0)
        .slice(0, 6),
    [report],
  );

  const payload = useMemo(
    () =>
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          dataset: "ferroscope-black-october@2026.10.23",
          seed: 2718,
          profile,
          report: {
            score: report.score,
            risk: report.risk,
            band: report.band,
            summary: report.summary,
            exposed: report.exposed.map((match) => ({
              slug: match.incident.slug,
              name: match.incident.name,
              severity: match.incident.severity,
              contribution: match.contribution,
              effectiveSeverity: match.effectiveSeverity,
            })),
          },
          plan: plans.map((plan) => ({
            id: plan.action.id,
            title: plan.action.title,
            minutes: plan.action.minutes,
            riskReduced: plan.riskReduced,
            efficiency: plan.efficiency,
          })),
        },
        null,
        2,
      ),
    [profile, report, plans],
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem] lg:items-start">
      <Card className="p-6 sm:p-8 print:border-0 print:p-0">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-faint">
              Ferroscope exposure report
            </p>
            <h2 className="mt-2 font-display text-4xl leading-none text-ink">
              {report.band} · {report.score}/100
            </h2>
          </div>
          <div className="text-right">
            <Badge tone="outline">seed 2718</Badge>
            <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.14em] text-faint">
              {hydrated ? formatDateTime(new Date().toISOString()) : "awaiting profile"}
            </p>
          </div>
        </div>

        <section className="mt-6">
          <Kicker>Summary</Kicker>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{report.summary}</p>
          <div className="mt-5 grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4">
            {[
              { label: "Risk", value: report.risk },
              { label: "Safety", value: report.score },
              { label: "In path", value: report.exposed.length },
              { label: "Declared", value: report.examinedStack },
            ].map((item) => (
              <div key={item.label} className="bg-surface px-4 py-3">
                <p className="font-display text-3xl tabular-nums leading-none text-ink">
                  {item.value}
                </p>
                <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-faint">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <Kicker>Exposed incidents</Kicker>
          <div className="mt-3 divide-y divide-line border-y border-line">
            {report.exposed.map((match) => (
              <div key={match.incident.slug} className="flex flex-wrap items-start gap-3 py-3">
                <SeverityChip severity={match.incident.severity} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{match.incident.name}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted">
                    {match.incident.exposureNote}
                  </p>
                </div>
                <span className="font-mono text-[10px] tabular-nums text-amber">
                  +{match.contribution}
                </span>
              </div>
            ))}
            {report.exposed.length === 0 ? (
              <p className="py-4 text-sm text-muted">
                No declared component intersects the dataset. That is a real result, not an error.
              </p>
            ) : null}
          </div>
        </section>

        <section className="mt-8">
          <Kicker>Declared stack</Kicker>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {profile.stack.map((id) => (
              <span
                key={id}
                className="border border-line px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-muted"
              >
                {STACK_BY_ID.get(id)?.label ?? id}
              </span>
            ))}
            {profile.stack.length === 0 ? (
              <span className="text-sm text-faint">Empty profile.</span>
            ) : null}
          </div>
          <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.14em] text-faint">
            region {profile.region} · bank {String(profile.bank)} · 2fa {String(profile.twoFactor)}{" "}
            · password manager {String(profile.passwordManager)} · auto updates{" "}
            {String(profile.autoUpdates)}
          </p>
        </section>

        <section className="mt-8">
          <Kicker>Recommended order</Kicker>
          <ol className="mt-3 space-y-2">
            {plans.map((plan, index) => (
              <li key={plan.action.id} className="flex gap-3 border-b border-line/60 pb-2">
                <span className="font-mono text-[9px] text-faint">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1 text-sm text-ink">{plan.action.title}</span>
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted">
                  {plan.action.minutes} min · −{plan.riskReduced}
                </span>
              </li>
            ))}
            {plans.length === 0 ? (
              <li className="text-sm text-muted">No action is relevant to this profile.</li>
            ) : null}
          </ol>
        </section>

        <footer className="mt-8 border-t border-line pt-4 font-mono text-[9px] uppercase leading-relaxed tracking-[0.14em] text-faint">
          Deterministic model · no telemetry · no account · dataset version 2026.10.23 · report is
          reproducible from the profile above.
        </footer>
      </Card>

      <aside className="space-y-4 print:hidden">
        <Card className="p-5">
          <Kicker>Export</Kicker>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Print to PDF, or copy the exact JSON the model used. The payload contains your declared
            stack, and nothing else.
          </p>
          <div className="mt-4 space-y-2">
            <Button size="sm" className="w-full" onClick={() => window.print()}>
              Print / save as PDF
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(payload);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1800);
                } catch {
                  setCopied(false);
                }
              }}
            >
              {copied ? "Copied" : "Copy JSON"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="w-full"
              onClick={() => {
                const blob = new Blob([payload], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const anchor = document.createElement("a");
                anchor.href = url;
                anchor.download = "ferroscope-report.json";
                anchor.click();
                URL.revokeObjectURL(url);
              }}
            >
              Download .json
            </Button>
          </div>
        </Card>

        <Card className="p-5">
          <Kicker>Reading it</Kicker>
          <ReportNote report={report} />
        </Card>
      </aside>
    </div>
  );
}

function ReportNote({ report }: { report: ExposureReport }) {
  return (
    <p className="mt-3 text-sm leading-relaxed text-muted">
      A {report.risk}/100 score means {report.exposed.length} of {report.totalIncidents} incidents
      intersect what you declared. Nothing here claims you were breached; it claims you are inside
      the blast path. The difference is the whole point.
    </p>
  );
}
