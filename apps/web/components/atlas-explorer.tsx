"use client";

import {
  compareSeverity,
  type Incident,
  type Severity,
  type Vector,
  vectorLabel,
} from "@ferroscope/core";
import { Badge, SeverityChip } from "@ferroscope/ui";
import Link from "next/link";
import { useMemo, useState } from "react";

export function AtlasExplorer({ incidents }: { incidents: readonly Incident[] }) {
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState<Severity | "all">("all");
  const [vector, setVector] = useState<Vector | "all">("all");
  const [window, setWindow] = useState<"all" | "48h" | "month">("all");
  const [sort, setSort] = useState<"editorial" | "severity" | "date">("editorial");

  const vectors = useMemo(() => {
    const set = new Set(incidents.map((incident) => incident.vector));
    return [...set].sort();
  }, [incidents]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const result = incidents.filter((incident) => {
      if (severity !== "all" && incident.severity !== severity) return false;
      if (vector !== "all" && incident.vector !== vector) return false;
      if (window !== "all" && incident.window !== window) return false;
      if (!needle) return true;
      return (
        incident.name.toLowerCase().includes(needle) ||
        incident.headline.toLowerCase().includes(needle) ||
        incident.summary.toLowerCase().includes(needle) ||
        incident.iocs.some((ioc) => ioc.includes(needle))
      );
    });

    if (sort === "severity") {
      result.sort(
        (a, b) => compareSeverity(a.severity, b.severity) || a.name.localeCompare(b.name),
      );
    } else if (sort === "date") {
      result.sort((a, b) => Date.parse(b.disclosedAt) - Date.parse(a.disclosedAt));
    }

    return result;
  }, [incidents, query, severity, vector, window, sort]);

  return (
    <div>
      <div className="grid gap-3 border-b border-line pb-4 sm:grid-cols-[1fr_auto_auto_auto]">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search names, headlines, IPs…"
          aria-label="Search incidents"
          className="h-9 w-full border border-line bg-surface px-3 text-sm text-ink outline-none transition-colors placeholder:text-faint focus:border-amber"
        />
        <select
          value={severity}
          onChange={(event) => setSeverity(event.target.value as Severity | "all")}
          aria-label="Filter by severity"
          className="h-9 border border-line bg-surface px-2 font-mono text-[9px] uppercase tracking-[0.14em] text-muted outline-none focus:border-amber"
        >
          <option value="all">All severity</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select
          value={vector}
          onChange={(event) => setVector(event.target.value as Vector | "all")}
          aria-label="Filter by vector"
          className="h-9 max-w-[11rem] border border-line bg-surface px-2 font-mono text-[9px] uppercase tracking-[0.14em] text-muted outline-none focus:border-amber"
        >
          <option value="all">All vectors</option>
          {vectors.map((item) => (
            <option key={item} value={item}>
              {vectorLabel(item)}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value as "editorial" | "severity" | "date")}
          aria-label="Sort"
          className="h-9 border border-line bg-surface px-2 font-mono text-[9px] uppercase tracking-[0.14em] text-muted outline-none focus:border-amber"
        >
          <option value="editorial">Editorial order</option>
          <option value="severity">Severity</option>
          <option value="date">Newest</option>
        </select>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {(["all", "48h", "month"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setWindow(value)}
            className={`border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] transition-colors ${
              window === value
                ? "border-amber bg-amber/10 text-amber"
                : "border-line text-muted hover:text-ink"
            }`}
          >
            {value === "all" ? "All windows" : value === "48h" ? "48-hour wave" : "Month scale"}
          </button>
        ))}
        <span className="ml-auto font-mono text-[9px] uppercase tracking-[0.16em] text-faint">
          {filtered.length} of {incidents.length}
        </span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((incident, index) => (
          <Link
            key={incident.slug}
            href={`/atlas/${incident.slug}`}
            className="group flex flex-col border border-line bg-surface p-4 transition-colors hover:border-amber/60"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-wrap gap-1.5">
                <SeverityChip severity={incident.severity} />
                <Badge tone="neutral">{vectorLabel(incident.vector)}</Badge>
              </div>
              <span className="font-mono text-[9px] tabular-nums text-faint">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <h3 className="mt-4 font-display text-xl leading-tight text-ink group-hover:text-amber">
              {incident.name}
            </h3>
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted">
              {incident.headline}
            </p>
            <div className="mt-auto flex items-center justify-between gap-2 pt-4 font-mono text-[8px] uppercase tracking-[0.14em] text-faint">
              <span>{incident.affected.length} surfaces</span>
              <span>{incident.status}</span>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 border border-dashed border-line-strong px-6 py-12 text-center text-sm text-muted">
          Nothing matches that combination. The dataset is 27 incidents wide, not infinite.
        </p>
      ) : null}
    </div>
  );
}
