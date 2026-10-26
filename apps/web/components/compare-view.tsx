"use client";

import { computeExposure, type ExposureProfile } from "@ferroscope/core";
import { INCIDENTS, SCENARIOS, STACK_CATALOG } from "@ferroscope/seed";
import { BandChip, Button, Card, Kicker, Meter } from "@ferroscope/ui";
import { useMemo, useState } from "react";
import { useProfile, useProfileHydrated } from "@/lib/store";

export function CompareView() {
  const hydrated = useProfileHydrated();
  const stored = useProfile((state) => state.profile);
  const loadProfile = useProfile((state) => state.loadProfile);
  const live = useMemo(
    () =>
      hydrated
        ? stored
        : ({
            stack: [],
            region: "IN",
            bank: false,
            passwordManager: false,
            twoFactor: false,
            autoUpdates: false,
          } as ExposureProfile),
    [hydrated, stored],
  );

  const [selected, setSelected] = useState<string[]>([
    "this-laptop",
    "hardened",
    "server-operator",
  ]);

  const rows = useMemo(() => {
    const base = computeExposure(live, INCIDENTS, STACK_CATALOG);
    const scenarios = SCENARIOS.filter((scenario) => selected.includes(scenario.id)).map(
      (scenario) => ({
        id: scenario.id,
        name: scenario.name,
        description: scenario.description,
        report: computeExposure(scenario.profile, INCIDENTS, STACK_CATALOG),
        profile: scenario.profile,
      }),
    );

    return {
      you: {
        id: "you",
        name: "Your profile",
        report: base,
        profile: live,
        description: "Live, from localStorage.",
      },
      scenarios,
    };
  }, [live, selected]);

  const max = Math.max(rows.you.report.risk, ...rows.scenarios.map((row) => row.report.risk), 1);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-1.5 border-b border-line pb-4">
        {SCENARIOS.map((scenario) => {
          const active = selected.includes(scenario.id);
          return (
            <button
              key={scenario.id}
              type="button"
              onClick={() =>
                setSelected((value) =>
                  active ? value.filter((id) => id !== scenario.id) : [...value, scenario.id],
                )
              }
              className={`border px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em] transition-colors ${
                active
                  ? "border-amber bg-amber/10 text-amber"
                  : "border-line text-muted hover:text-ink"
              }`}
            >
              {scenario.name}
            </button>
          );
        })}
        <span className="ml-auto font-mono text-[9px] uppercase tracking-[0.16em] text-faint">
          your profile is always included
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {[rows.you, ...rows.scenarios].map((row) => (
          <Card key={row.id} className="flex h-full flex-col p-5">
            <div className="flex items-start justify-between gap-2">
              <Kicker>{row.id === "you" ? "Live" : row.id.replace("-", " ")}</Kicker>
              <BandChip band={row.report.band} />
            </div>
            <p className="mt-4 font-display text-2xl leading-tight text-ink">{row.name}</p>
            <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted">
              {row.description}
            </p>

            <div className="mt-5 flex items-baseline gap-2">
              <span className="font-display text-5xl tabular-nums leading-none text-ink">
                {row.report.risk}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-faint">
                risk
              </span>
            </div>

            <div className="mt-4">
              <Meter
                value={(row.report.risk / max) * 100}
                tone="rust"
                label="Relative"
                hint={`${row.report.risk}`}
              />
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-px border border-line bg-line">
              <div className="bg-surface px-3 py-2">
                <dt className="font-mono text-[8px] uppercase tracking-[0.14em] text-faint">
                  Hits
                </dt>
                <dd className="mt-0.5 font-display text-xl tabular-nums text-ink">
                  {row.report.exposed.length}
                </dd>
              </div>
              <div className="bg-surface px-3 py-2">
                <dt className="font-mono text-[8px] uppercase tracking-[0.14em] text-faint">
                  Stack
                </dt>
                <dd className="mt-0.5 font-display text-xl tabular-nums text-ink">
                  {row.profile.stack.length}
                </dd>
              </div>
            </dl>

            <ul className="mt-4 space-y-1.5">
              {row.report.exposed.slice(0, 3).map((match) => (
                <li key={match.incident.slug} className="flex justify-between gap-2 text-xs">
                  <span className="truncate text-muted">{match.incident.name}</span>
                  <span className="font-mono text-[9px] tabular-nums text-amber">
                    +{match.contribution}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-4">
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => loadProfile(row.profile)}
              >
                Adopt preset
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-line px-5 py-3">
          <Kicker>Delta table</Kicker>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr>
                <th className="border-b border-line px-4 py-2 font-mono text-[9px] uppercase tracking-[0.18em] text-faint">
                  Profile
                </th>
                <th className="border-b border-line px-4 py-2 font-mono text-[9px] uppercase tracking-[0.18em] text-faint">
                  Risk
                </th>
                <th className="border-b border-line px-4 py-2 font-mono text-[9px] uppercase tracking-[0.18em] text-faint">
                  Delta
                </th>
                <th className="border-b border-line px-4 py-2 font-mono text-[9px] uppercase tracking-[0.18em] text-faint">
                  Worst contributor
                </th>
              </tr>
            </thead>
            <tbody>
              {[rows.you, ...rows.scenarios].map((row) => (
                <tr key={`row-${row.id}`}>
                  <td className="border-b border-line/60 px-4 py-3 text-ink">{row.name}</td>
                  <td className="border-b border-line/60 px-4 py-3 font-mono tabular-nums text-muted">
                    {row.report.risk}
                  </td>
                  <td className="border-b border-line/60 px-4 py-3 font-mono tabular-nums">
                    <span
                      className={
                        row.report.risk === rows.you.report.risk
                          ? "text-faint"
                          : row.report.risk < rows.you.report.risk
                            ? "text-moss"
                            : "text-rust"
                      }
                    >
                      {row.report.risk === rows.you.report.risk
                        ? "—"
                        : `${row.report.risk > rows.you.report.risk ? "+" : ""}${row.report.risk - rows.you.report.risk}`}
                    </span>
                  </td>
                  <td className="border-b border-line/60 px-4 py-3 text-muted">
                    {row.report.exposed[0]?.incident.name ?? "none"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
