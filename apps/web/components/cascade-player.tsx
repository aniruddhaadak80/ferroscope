"use client";

import {
  type CascadeResult,
  computeExposure,
  simulateCascade,
  vectorLabel,
} from "@ferroscope/core";
import { INCIDENTS, STACK_CATALOG } from "@ferroscope/seed";
import { Badge, Button, Card, Kicker, SeverityChip, Sparkline } from "@ferroscope/ui";
import { useEffect, useMemo, useRef, useState } from "react";
import { useProfile, useProfileHydrated } from "@/lib/store";

const PRESETS = ["php2shell", "emudhra", "litellm", "railway", "gitlab-onigmo", "onamae"];

export function CascadePlayer() {
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

  const [slug, setSlug] = useState("php2shell");
  const [tick, setTick] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [activeSlug, setActiveSlug] = useState(slug);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // A different incident invalidates the frame index. Adjusting state during
  // render is React's documented alternative to a reset effect, and it avoids
  // one paint with a stale frame.
  if (activeSlug !== slug) {
    setActiveSlug(slug);
    setTick(0);
    setPlaying(false);
  }

  const result: CascadeResult = useMemo(() => {
    const incident = INCIDENTS.find((item) => item.slug === slug) ?? INCIDENTS[0];
    if (!incident) throw new Error("dataset is empty");
    return simulateCascade(incident, profile, STACK_CATALOG, 12);
  }, [slug, profile]);

  const report = useMemo(() => computeExposure(profile, INCIDENTS, STACK_CATALOG), [profile]);

  useEffect(() => {
    if (!playing) {
      if (timer.current) clearInterval(timer.current);
      return;
    }
    timer.current = setInterval(() => {
      setTick((value) => {
        if (value >= result.frames.length - 1) {
          setPlaying(false);
          return value;
        }
        return value + 1;
      });
    }, 900 / speed);

    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [playing, result.frames.length, speed]);

  const frame = result.frames[Math.min(tick, result.frames.length - 1)] ?? result.frames[0];
  const risks = result.frames.map((item) => item.risk);
  const matched = report.matches.find((match) => match.incident.slug === slug);
  const labels = new Map(STACK_CATALOG.map((item) => [item.id, item.label]));

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem] lg:items-start">
      <div>
        <div className="flex flex-wrap gap-1.5 border-b border-line pb-4">
          {PRESETS.map((item) => {
            const incident = INCIDENTS.find((entry) => entry.slug === item);
            if (!incident) return null;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setSlug(item)}
                className={`border px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em] transition-colors ${
                  slug === item
                    ? "border-amber bg-amber/10 text-amber"
                    : "border-line text-muted hover:text-ink"
                }`}
              >
                {incident.name}
              </button>
            );
          })}
          <select
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            aria-label="Choose an incident"
            className="ml-auto h-8 border border-line bg-surface px-2 font-mono text-[9px] uppercase tracking-[0.12em] text-muted outline-none focus:border-amber"
          >
            {INCIDENTS.map((incident) => (
              <option key={incident.slug} value={incident.slug}>
                {incident.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-5 border border-line bg-surface">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <SeverityChip severity={result.incident.severity} />
              <Badge tone="neutral">{vectorLabel(result.incident.vector)}</Badge>
              {matched?.matched ? (
                <Badge tone="amber">In your path</Badge>
              ) : (
                <Badge tone="outline">Hypothetical</Badge>
              )}
            </div>
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-faint">
              tick {String(frame?.tick ?? 0).padStart(2, "0")} / {result.frames.length - 1}
            </span>
          </div>

          <div className="grid gap-6 p-5 sm:grid-cols-[1fr_8rem]">
            <div>
              <p className="font-display text-3xl leading-tight text-ink">{frame?.headline}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{frame?.detail}</p>

              <div className="mt-6">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-faint">
                    Simulated risk
                  </span>
                  <span className="font-mono text-lg tabular-nums text-rust">{frame?.risk}</span>
                </div>
                <div className="mt-2 flex h-24 items-end gap-1 border-b border-line">
                  {result.frames.map((item, index) => (
                    <button
                      key={item.tick}
                      type="button"
                      aria-label={`Frame ${index}`}
                      onClick={() => setTick(index)}
                      className="group relative flex-1"
                      style={{ height: "100%" }}
                    >
                      <span
                        className={`absolute bottom-0 left-0 w-full transition-all ${
                          index <= tick ? "bg-rust/80" : "bg-line-strong/40"
                        }`}
                        style={{ height: `${Math.max(4, item.risk)}%` }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    if (tick >= result.frames.length - 1) setTick(0);
                    setPlaying((value) => !value);
                  }}
                >
                  {playing ? "Pause" : tick >= result.frames.length - 1 ? "Replay" : "Play"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setPlaying(false);
                    setTick((value) => Math.max(0, value - 1));
                  }}
                >
                  ← Step
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setPlaying(false);
                    setTick((value) => Math.min(result.frames.length - 1, value + 1));
                  }}
                >
                  Step →
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setPlaying(false);
                    setTick(0);
                  }}
                >
                  Reset
                </Button>
                <div className="ml-auto flex items-center gap-1 border border-line">
                  {[1, 2, 4].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setSpeed(value)}
                      className={`px-2 py-1 font-mono text-[9px] tabular-nums transition-colors ${
                        speed === value ? "bg-ink text-canvas" : "text-muted hover:text-ink"
                      }`}
                    >
                      {value}×
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="hidden border-l border-line pl-4 sm:block">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-faint">Curve</p>
              <Sparkline values={risks} tone="rust" className="mt-3" height={70} />
              <dl className="mt-5 space-y-3">
                <div>
                  <dt className="font-mono text-[8px] uppercase tracking-[0.16em] text-faint">
                    Peak
                  </dt>
                  <dd className="font-display text-2xl tabular-nums text-rust">
                    {result.peakRisk}
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[8px] uppercase tracking-[0.16em] text-faint">
                    Frames
                  </dt>
                  <dd className="font-display text-2xl tabular-nums text-ink">{result.ticks}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="border-t border-line px-5 py-4">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-faint">
              Active surfaces
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {frame?.activeNodes.map((id) => (
                <span
                  key={id}
                  className="border border-amber/40 bg-amber/[0.07] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-amber"
                >
                  {labels.get(id) ?? id.replace("stack:", "")}
                </span>
              ))}
              {frame?.activeNodes.length === 0 ? (
                <span className="text-xs text-faint">Nothing lit yet.</span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-4 border border-line bg-surface p-5">
          <Kicker>What this simulation is</Kicker>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            A deterministic narrative over the declared stack: primary surfaces first, then
            same-category siblings, then a containment window. It is not a physics model and it does
            not predict attacker behaviour. It exists to make the word “lateral” concrete.
          </p>
        </div>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24">
        <Card className="p-5">
          <Kicker>The incident</Kicker>
          <p className="mt-3 font-display text-2xl leading-tight text-ink">
            {result.incident.name}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted">{result.incident.headline}</p>
          <div className="mt-4 border-t border-line pt-3">
            <p className="text-xs leading-relaxed text-muted">{result.incident.exposureNote}</p>
          </div>
        </Card>

        <Card className="p-5">
          <Kicker>Frames</Kicker>
          <ol className="mt-3 space-y-1">
            {result.frames.map((item, index) => (
              <li key={item.tick}>
                <button
                  type="button"
                  onClick={() => {
                    setPlaying(false);
                    setTick(index);
                  }}
                  className={`flex w-full items-baseline gap-3 px-2 py-1.5 text-left transition-colors ${
                    index === tick ? "bg-surface-2 text-ink" : "text-muted hover:text-ink"
                  }`}
                >
                  <span className="font-mono text-[9px] tabular-nums text-faint">
                    {String(index).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-xs">{item.headline}</span>
                  <span className="font-mono text-[9px] tabular-nums text-amber">{item.risk}</span>
                </button>
              </li>
            ))}
          </ol>
        </Card>
      </aside>
    </div>
  );
}
