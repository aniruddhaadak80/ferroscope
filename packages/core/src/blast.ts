import { hashString } from "./format";
import { SEVERITY_WEIGHT } from "./severity";
import type {
  BlastEdge,
  BlastGraph,
  BlastNode,
  ExposureProfile,
  ExposureReport,
  IncidentMatch,
  StackItem,
} from "./types";

const WIDTH = 920;
const HEIGHT = 640;
const CENTER_X = WIDTH / 2;
const CENTER_Y = HEIGHT / 2;
const INNER_RADIUS = 178;
const OUTER_RADIUS = 296;
const MAX_STACK_NODES = 16;
const MAX_INCIDENT_NODES = 10;

function jitter(id: string): number {
  const value = (hashString(id) % 1000) / 1000;
  return (value - 0.5) * 0.18;
}

function polar(radius: number, angle: number): { x: number; y: number } {
  return {
    x: Math.round((CENTER_X + radius * Math.cos(angle)) * 10) / 10,
    y: Math.round((CENTER_Y + radius * Math.sin(angle)) * 10) / 10,
  };
}

function isNearMiss(match: IncidentMatch): boolean {
  return !match.matched && match.missing.length > 0 && match.missing.length <= 2;
}

/**
 * A deterministic radial layout. No simulation loop, no random seed at render
 * time — the same profile always produces the same graph, which makes it
 * diffable and screenshot-stable.
 */
export function buildBlastGraph(
  report: ExposureReport,
  profile: ExposureProfile,
  stack: readonly StackItem[],
): BlastGraph {
  const byId = new Map(stack.map((item) => [item.id, item]));
  const declared = profile.stack
    .map((id) => byId.get(id))
    .filter((item): item is StackItem => Boolean(item))
    .slice(0, MAX_STACK_NODES);

  const matched = report.matches.filter((match) => match.matched);
  const near = report.matches.filter(isNearMiss).slice(0, Math.max(0, 6 - matched.length));
  const incidents = [...matched, ...near].slice(0, MAX_INCIDENT_NODES);

  const nodes: BlastNode[] = [
    {
      id: "self",
      label: "You",
      kind: "self",
      severity: null,
      x: CENTER_X,
      y: CENTER_Y,
      weight: 1,
    },
  ];

  declared.forEach((item, index) => {
    const angle = -Math.PI / 2 + (index / Math.max(declared.length, 1)) * Math.PI * 2;
    const point = polar(INNER_RADIUS, angle + jitter(item.id));
    nodes.push({
      id: `stack:${item.id}`,
      label: item.label,
      kind: "stack",
      severity: null,
      x: point.x,
      y: point.y,
      weight: item.riskWeight,
    });
  });

  incidents.forEach((match, index) => {
    const angle = -Math.PI / 2 + (index / Math.max(incidents.length, 1)) * Math.PI * 2;
    const point = polar(OUTER_RADIUS, angle + jitter(match.incident.slug));
    nodes.push({
      id: `incident:${match.incident.slug}`,
      label: match.incident.name,
      kind: "incident",
      severity: match.incident.severity,
      x: point.x,
      y: point.y,
      weight: SEVERITY_WEIGHT[match.incident.severity] * Math.max(match.confidence, 0.35),
    });
  });

  const edges: BlastEdge[] = [];
  for (const item of declared) {
    edges.push({
      from: "self",
      to: `stack:${item.id}`,
      weight: 0.35 + item.riskWeight * 0.4,
      kind: "core-stack",
    });
  }

  for (const match of incidents) {
    if (match.incident.affected.length === 0) {
      edges.push({
        from: "self",
        to: `incident:${match.incident.slug}`,
        weight: match.confidence,
        kind: "core-stack",
      });
      continue;
    }
    for (const affected of match.incident.affected) {
      if (!profile.stack.includes(affected)) continue;
      edges.push({
        from: `stack:${affected}`,
        to: `incident:${match.incident.slug}`,
        weight: Math.max(0.3, match.confidence),
        kind: "stack-incident",
      });
    }
  }

  return { nodes, edges, width: WIDTH, height: HEIGHT };
}

export function blastEdgeKey(edge: BlastEdge): string {
  return `${edge.from}->${edge.to}`;
}
