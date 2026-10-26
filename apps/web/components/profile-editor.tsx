"use client";

import { computeExposure, formatMinutes, rankActions, type StackCategory } from "@ferroscope/core";
import { ACTIONS, DEFAULT_PROFILE, INCIDENTS, SCENARIOS, STACK_CATALOG } from "@ferroscope/seed";
import {
  BandChip,
  Button,
  Callout,
  Card,
  Kicker,
  Meter,
  Ring,
  SelectableTile,
  TextInput,
} from "@ferroscope/ui";
import { useMemo, useState } from "react";
import { useProfile, useProfileHydrated } from "@/lib/store";

const CATEGORY_ORDER: readonly StackCategory[] = [
  "os",
  "device",
  "browser",
  "runtime",
  "server",
  "service",
  "certificate",
  "account",
  "package",
  "ai",
];

const CATEGORY_LABEL: Record<StackCategory, string> = {
  os: "Operating systems",
  device: "Devices",
  browser: "Browsers",
  runtime: "Runtimes",
  server: "Web servers",
  service: "Platform & services",
  certificate: "Certificate authorities",
  account: "Accounts",
  package: "Package ecosystems",
  ai: "AI surfaces",
};

const REGIONS = [
  { value: "IN", label: "India (IN)" },
  { value: "US", label: "United States (US)" },
  { value: "KR", label: "South Korea (KR)" },
  { value: "JP", label: "Japan (JP)" },
  { value: "EU", label: "European Union (EU)" },
  { value: "GB", label: "United Kingdom (GB)" },
  { value: "AU", label: "Australia (AU)" },
] as const;

export function ProfileEditor() {
  const hydrated = useProfileHydrated();
  const profile = useProfile((state) => state.profile);
  const toggleStack = useProfile((state) => state.toggleStack);
  const setRegion = useProfile((state) => state.setRegion);
  const loadProfile = useProfile((state) => state.loadProfile);
  const reset = useProfile((state) => state.reset);
  const [query, setQuery] = useState("");
  const [openCategory, setOpenCategory] = useState<StackCategory | "all">("all");

  const liveReport = useMemo(() => computeExposure(profile, INCIDENTS, STACK_CATALOG), [profile]);

  const nextActions = useMemo(
    () =>
      rankActions(ACTIONS, liveReport)
        .filter((plan) => !plan.completed && plan.relevant.length > 0)
        .slice(0, 3),
    [liveReport],
  );

  const filtered = STACK_CATALOG.filter((item) => {
    if (openCategory !== "all" && item.category !== openCategory) return false;
    if (!query.trim()) return true;
    const needle = query.trim().toLowerCase();
    return (
      item.label.toLowerCase().includes(needle) ||
      item.vendor.toLowerCase().includes(needle) ||
      item.note.toLowerCase().includes(needle)
    );
  });

  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    items: filtered.filter((item) => item.category === category),
  })).filter((group) => group.items.length > 0);

  const active = new Set(profile.stack);

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_20rem] lg:items-start">
      <div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            label="Filter the catalogue"
            value={query}
            onChange={setQuery}
            placeholder="nginx, python, bank…"
            hint="Matches label, vendor, and note."
          />
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Region</p>
            <select
              value={profile.region}
              onChange={(event) => setRegion(event.target.value)}
              className="mt-2 h-10 w-full appearance-none border border-line bg-surface-2 px-3 text-sm text-ink outline-none transition-colors focus:border-amber"
              aria-label="Region"
            >
              {REGIONS.map((region) => (
                <option key={region.value} value={region.value}>
                  {region.label}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-faint">
              Regional incidents only fire inside their own geography.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setOpenCategory("all")}
            className={`border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] transition-colors ${
              openCategory === "all"
                ? "border-amber bg-amber/10 text-amber"
                : "border-line text-muted hover:text-ink"
            }`}
          >
            All {STACK_CATALOG.length}
          </button>
          {CATEGORY_ORDER.map((category) => {
            const count = STACK_CATALOG.filter((item) => item.category === category).length;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setOpenCategory(category)}
                className={`border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] transition-colors ${
                  openCategory === category
                    ? "border-amber bg-amber/10 text-amber"
                    : "border-line text-muted hover:text-ink"
                }`}
              >
                {CATEGORY_LABEL[category]} {count}
              </button>
            );
          })}
        </div>

        <div className="mt-8 space-y-8">
          {grouped.map((group) => (
            <div key={group.category}>
              <div className="flex items-center justify-between border-b border-line pb-2">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.22em] text-faint">
                  {CATEGORY_LABEL[group.category]}
                </h3>
                <span className="font-mono text-[9px] tabular-nums text-faint">
                  {group.items.filter((item) => active.has(item.id)).length}/{group.items.length}
                </span>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {group.items.map((item) => (
                  <SelectableTile
                    key={item.id}
                    selected={active.has(item.id)}
                    onSelect={() => toggleStack(item.id)}
                    title={item.label}
                    meta={item.vendor}
                    description={item.note}
                  />
                ))}
              </div>
            </div>
          ))}
          {grouped.length === 0 ? (
            <Callout title="Nothing matches" tone="neutral">
              Try a vendor name or a broader term. The catalogue only contains components the
              exposure model can actually reason about.
            </Callout>
          ) : null}
        </div>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24">
        <Card className="p-5">
          <div className="flex items-start justify-between gap-3">
            <Kicker>Live model</Kicker>
            <BandChip band={liveReport.band} />
          </div>
          <div className="mt-5 flex items-center gap-4">
            <Ring value={liveReport.score} label="safety" size={104} />
            <div className="min-w-0">
              <p className="font-display text-2xl leading-none text-ink">
                {liveReport.exposed.length}
                <span className="text-muted"> / {INCIDENTS.length}</span>
              </p>
              <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-faint">
                incidents in path
              </p>
              <p className="mt-3 text-xs leading-relaxed text-muted">
                {hydrated ? liveReport.summary : "Reading your stored profile…"}
              </p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            <Meter
              value={liveReport.risk}
              tone="rust"
              label="Exposure"
              hint={`${liveReport.risk}/100`}
            />
            <Meter
              value={liveReport.examinedStack}
              tone="amber"
              label="Declared"
              hint={`${liveReport.examinedStack} items`}
            />
          </div>
        </Card>

        <Card className="p-5">
          <Kicker>Next best moves</Kicker>
          <ol className="mt-4 space-y-3">
            {nextActions.map((plan, index) => (
              <li key={plan.action.id} className="flex gap-3">
                <span className="font-mono text-[10px] text-faint">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-ink">{plan.action.title}</p>
                  <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-amber">
                    {formatMinutes(plan.action.minutes)} · −{plan.riskReduced} pts
                  </p>
                </div>
              </li>
            ))}
            {nextActions.length === 0 ? (
              <li className="text-sm text-muted">
                No relevant action left. Either the stack is clean or the dataset moved on.
              </li>
            ) : null}
          </ol>
        </Card>

        <Card className="p-5">
          <Kicker>Presets</Kicker>
          <div className="mt-4 space-y-2">
            {SCENARIOS.map((scenario) => (
              <button
                key={scenario.id}
                type="button"
                onClick={() => loadProfile(scenario.profile)}
                className="w-full border border-line bg-surface px-3 py-2.5 text-left transition-colors hover:border-amber/60 hover:bg-surface-2"
              >
                <span className="block text-sm text-ink">{scenario.name}</span>
                <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-[0.14em] text-faint">
                  {scenario.profile.stack.length} components
                </span>
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => loadProfile(DEFAULT_PROFILE)}>
              Default laptop
            </Button>
            <Button variant="ghost" size="sm" onClick={reset}>
              Reset
            </Button>
          </div>
          <p className="mt-4 border-t border-line pt-3 text-xs leading-relaxed text-faint">
            Stored in your browser only. Nothing about this profile is sent to a database.
          </p>
        </Card>
      </aside>
    </div>
  );
}
