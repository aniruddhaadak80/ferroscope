"use client";

import {
  type BlastNode,
  buildBlastGraph,
  computeExposure,
  type ExposureProfile,
  vectorLabel,
} from "@ferroscope/core";
import { INCIDENTS, STACK_CATALOG } from "@ferroscope/seed";
import { Badge, BandChip, ButtonLink, Card, Kicker, SeverityChip } from "@ferroscope/ui";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useProfile, useProfileHydrated } from "@/lib/store";

const FILL: Record<string, string> = {
  critical: "var(--rust)",
  high: "var(--amber)",
  medium: "var(--muted)",
  low: "var(--moss)",
};

export function BlastRadiusView() {
  const hydrated = useProfileHydrated();
  const stored = useProfile((state) => state.profile);
  const profile: ExposureProfile = hydrated
    ? stored
    : {
        stack: [],
        region: "IN",
        bank: false,
        passwordManager: false,
        twoFactor: false,
        autoUpdates: false,
      };

  const report = useMemo(() => computeExposure(profile, INCIDENTS, STACK_CATALOG), [profile]);
  const graph = useMemo(() => buildBlastGraph(report, profile, STACK_CATALOG), [report, profile]);

  const [selected, setSelected] = useState<string | null>(null);
  const [showNear, setShowNear] = useState(true);

  const byId = new Map(graph.nodes.map((node) => [node.id, node]));
  const nearMisses = report.matches.filter((match) => !match.matched && match.missing.length <= 2);
  const visibleIncidentIds = new Set(
    graph.nodes
      .filter((node) => node.kind === "incident")
      .filter((node) => {
        if (showNear) return true;
        const slug = node.id.replace("incident:", "");
        return report.exposed.some((match) => match.incident.slug === slug);
      })
      .map((node) => node.id),
  );

  const selectedNode = selected ? byId.get(selected) : null;
  const selectedIncident =
    selectedNode?.kind === "incident"
      ? report.matches.find(
          (match) => match.incident.slug === selectedNode.id.replace("incident:", ""),
        )
      : null;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
      <div>
        <div className="flex flex-wrap items-center gap-3 border-b border-line pb-3">
          <button
            type="button"
            onClick={() => setShowNear((value) => !value)}
            className={`border px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] transition-colors ${
              showNear
                ? "border-amber bg-amber/10 text-amber"
                : "border-line text-muted hover:text-ink"
            }`}
          >
            Near misses {showNear ? "on" : "off"}
          </button>
          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-faint">
            {graph.nodes.length} nodes · {graph.edges.length} edges · deterministic layout
          </span>
          <div className="ml-auto flex items-center gap-2">
            <BandChip band={report.band} score={report.score} />
          </div>
        </div>

        <div className="relative mt-4 border border-line bg-surface">
          <svg
            viewBox={`0 0 ${graph.width} ${graph.height}`}
            className="h-[30rem] w-full sm:h-[38rem]"
            role="img"
            aria-label="Interactive blast radius graph"
          >
            <defs>
              <radialGradient id="br-core" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="var(--amber)" stopOpacity="0.2" />
                <stop offset="100%" stopColor="var(--amber)" stopOpacity="0" />
              </radialGradient>
              <pattern id="br-grid" width="46" height="46" patternUnits="userSpaceOnUse">
                <path d="M46 0H0V46" fill="none" stroke="var(--line)" strokeWidth="0.6" />
              </pattern>
            </defs>

            <rect width={graph.width} height={graph.height} fill="url(#br-grid)" opacity="0.5" />
            <circle cx={graph.width / 2} cy={graph.height / 2} r="190" fill="url(#br-core)" />

            <g>
              {graph.edges.map((edge) => {
                const from = byId.get(edge.from);
                const to = byId.get(edge.to);
                if (!from || !to) return null;
                if (edge.to.startsWith("incident:") && !visibleIncidentIds.has(edge.to))
                  return null;
                const dim = selected ? edge.from !== selected && edge.to !== selected : false;
                return (
                  <line
                    key={`${edge.from}-${edge.to}`}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={edge.kind === "stack-incident" ? "var(--amber)" : "var(--line-strong)"}
                    strokeOpacity={dim ? 0.1 : edge.kind === "stack-incident" ? 0.6 : 0.32}
                    strokeWidth={edge.kind === "stack-incident" ? 1.2 : 1}
                    strokeDasharray={edge.kind === "stack-incident" ? "4 5" : undefined}
                  />
                );
              })}
            </g>

            {graph.nodes.map((node) => {
              if (node.kind === "incident" && !visibleIncidentIds.has(node.id)) return null;
              return (
                <GraphNode
                  key={node.id}
                  node={node}
                  selected={selected === node.id}
                  dimmed={
                    selected !== null &&
                    selected !== node.id &&
                    !isNeighbour(graph, selected, node.id)
                  }
                  onSelect={() => setSelected(selected === node.id ? null : node.id)}
                />
              );
            })}
          </svg>

          <div className="pointer-events-none absolute bottom-3 left-3 flex flex-wrap gap-3 font-mono text-[8px] uppercase tracking-[0.16em] text-faint">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 bg-amber" /> intersection
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 bg-line-strong" /> declared
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 bg-rust" /> critical
            </span>
          </div>
        </div>

        <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.16em] text-faint">
          Click a node to isolate its edges.
        </p>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24">
        <Card className="p-5">
          <Kicker>{selectedIncident ? "Incident" : "Exposure"}</Kicker>
          {selectedIncident ? (
            <>
              <div className="mt-3 flex flex-wrap gap-2">
                <SeverityChip severity={selectedIncident.incident.severity} />
                <Badge tone="neutral">{vectorLabel(selectedIncident.incident.vector)}</Badge>
              </div>
              <p className="mt-3 font-display text-2xl leading-tight text-ink">
                {selectedIncident.incident.name}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {selectedIncident.incident.exposureNote}
              </p>
              <ul className="mt-4 space-y-2 border-t border-line pt-3">
                {selectedIncident.reasons.map((reason) => (
                  <li key={reason} className="flex gap-2 text-xs leading-relaxed text-muted">
                    <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 bg-amber" />
                    {reason}
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <ButtonLink
                  href={`/atlas/${selectedIncident.incident.slug}`}
                  variant="outline"
                  size="sm"
                >
                  Open the file →
                </ButtonLink>
              </div>
            </>
          ) : (
            <>
              <p className="mt-3 font-display text-3xl leading-none text-ink">
                {report.exposed.length}
                <span className="text-muted"> of {report.totalIncidents}</span>
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{report.summary}</p>
              <dl className="mt-4 grid grid-cols-2 gap-px border border-line bg-line">
                <div className="bg-surface px-3 py-2.5">
                  <dt className="font-mono text-[8px] uppercase tracking-[0.16em] text-faint">
                    Declared
                  </dt>
                  <dd className="mt-1 font-display text-xl tabular-nums text-ink">
                    {report.examinedStack}
                  </dd>
                </div>
                <div className="bg-surface px-3 py-2.5">
                  <dt className="font-mono text-[8px] uppercase tracking-[0.16em] text-faint">
                    Near miss
                  </dt>
                  <dd className="mt-1 font-display text-xl tabular-nums text-amber">
                    {nearMisses.length}
                  </dd>
                </div>
              </dl>
            </>
          )}
        </Card>

        <Card className="p-5">
          <Kicker>Stop showing this</Kicker>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Every node is a component you declared. Remove one in the profile and the edge
            disappears — that is the entire trust model.
          </p>
          <div className="mt-4 flex gap-2">
            <ButtonLink href="/profile" size="sm" variant="outline">
              Edit stack
            </ButtonLink>
            <ButtonLink href="/planner" size="sm" variant="ghost">
              Fix list
            </ButtonLink>
          </div>
        </Card>

        <Card className="p-5">
          <Kicker>Matched</Kicker>
          <ol className="mt-3 divide-y divide-line">
            {report.exposed.map((match) => (
              <li key={match.incident.slug}>
                <Link
                  href={`/atlas/${match.incident.slug}`}
                  className="flex items-center justify-between gap-3 py-2.5 hover:text-amber"
                >
                  <span className="min-w-0 truncate text-sm text-ink">{match.incident.name}</span>
                  <span className="font-mono text-[10px] tabular-nums text-amber">
                    +{match.contribution}
                  </span>
                </Link>
              </li>
            ))}
            {report.exposed.length === 0 ? (
              <li className="py-3 text-sm text-muted">
                Nothing intersects this profile. Hover the atlas for context.
              </li>
            ) : null}
          </ol>
        </Card>
      </aside>
    </div>
  );
}

function isNeighbour(
  graph: { edges: readonly { from: string; to: string }[] },
  selected: string | null,
  id: string,
): boolean {
  if (!selected) return true;
  return graph.edges.some(
    (edge) =>
      (edge.from === selected && edge.to === id) || (edge.to === selected && edge.from === id),
  );
}

function GraphNode({
  node,
  selected,
  dimmed,
  onSelect,
}: {
  node: BlastNode;
  selected: boolean;
  dimmed: boolean;
  onSelect: () => void;
}) {
  const fill = node.severity ? (FILL[node.severity] ?? "var(--amber)") : "var(--line-strong)";
  const opacity = dimmed ? 0.28 : 1;

  return (
    // biome-ignore lint/a11y/useSemanticElements: an SVG <g> cannot be a <button>; role="button" with Enter/Space handling is the correct pattern for an interactive graph node.
    <g
      opacity={opacity}
      onClick={onSelect}
      style={{ cursor: "pointer" }}
      role="button"
      tabIndex={0}
      aria-label={node.label}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onSelect();
      }}
    >
      <title>{node.label}</title>
      {node.kind === "self" ? (
        <>
          <rect
            x={node.x - 12}
            y={node.y - 12}
            width="24"
            height="24"
            fill="var(--canvas)"
            stroke={selected ? "var(--amber)" : "var(--line-strong)"}
            strokeWidth={selected ? 2 : 1.4}
          />
          <rect x={node.x - 3} y={node.y - 3} width="6" height="6" fill="var(--amber)" />
          <text
            x={node.x}
            y={node.y + 32}
            textAnchor="middle"
            fontSize="10"
            fill="var(--ink)"
            fontFamily="var(--font-mono)"
            letterSpacing="2"
          >
            YOU
          </text>
        </>
      ) : null}

      {node.kind === "stack" ? (
        <>
          <rect
            x={node.x - 4.5}
            y={node.y - 4.5}
            width="9"
            height="9"
            fill="var(--surface)"
            stroke={selected ? "var(--amber)" : "var(--line-strong)"}
            strokeWidth={selected ? 2 : 1}
          />
          <text
            x={node.x}
            y={node.y + 17}
            textAnchor="middle"
            fontSize="9"
            fill={selected ? "var(--amber)" : "var(--muted)"}
            fontFamily="var(--font-mono)"
          >
            {node.label}
          </text>
        </>
      ) : null}

      {node.kind === "incident" ? (
        <>
          <circle
            cx={node.x}
            cy={node.y}
            r={8 + node.weight * 9}
            fill={fill}
            fillOpacity={selected ? 0.32 : 0.16}
            stroke={fill}
            strokeWidth={selected ? 2 : 1.2}
          />
          <circle cx={node.x} cy={node.y} r="2.4" fill={fill} />
          <text
            x={node.x}
            y={node.y - 19}
            textAnchor="middle"
            fontSize="10"
            fill={selected ? "var(--amber)" : "var(--ink)"}
            fontFamily="var(--font-mono)"
          >
            {node.label}
          </text>
        </>
      ) : null}
    </g>
  );
}
