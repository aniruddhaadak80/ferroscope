import { downgrade, SEVERITY_WEIGHT } from "./severity";
import type {
  ExposureProfile,
  ExposureReport,
  Incident,
  IncidentMatch,
  RiskBand,
  Severity,
  StackItem,
  Vector,
  VectorRollup,
} from "./types";
import { VECTORS } from "./types";

const RISK_SATURATION = 0.55;
const MAX_MITIGATION = 0.8;

/**
 * How much of this incident's bite is already removed by the profile's
 * hygiene settings. Deliberately conservative: doing a thing partially is
 * worth less than ticking the box suggests.
 */
export function mitigationFor(profile: ExposureProfile, incident: Incident): number {
  let mitigation = 0;
  const vector = incident.vector;

  if (
    profile.twoFactor &&
    (vector === "identity" ||
      vector === "banking" ||
      vector === "supply-chain" ||
      vector === "ai-agent" ||
      vector === "network" ||
      vector === "state-actor")
  ) {
    mitigation += 0.22;
  }

  if (
    profile.passwordManager &&
    (vector === "identity" || vector === "banking" || vector === "supply-chain")
  ) {
    mitigation += 0.18;
  }

  if (
    profile.autoUpdates &&
    (vector === "endpoint" ||
      vector === "runtime" ||
      vector === "browser" ||
      vector === "web-server" ||
      vector === "network" ||
      vector === "certificate-authority")
  ) {
    mitigation += 0.25;
  }

  return Math.min(MAX_MITIGATION, mitigation);
}

export function riskBand(risk: number): RiskBand {
  if (risk < 20) return "fortified";
  if (risk < 45) return "watchful";
  if (risk < 70) return "exposed";
  return "critical";
}

interface DraftMatch {
  incident: Incident;
  matched: boolean;
  confidence: number;
  reasons: string[];
  missing: string[];
  effectiveSeverity: Severity;
  raw: number;
}

function averageRisk(ids: readonly string[], byId: ReadonlyMap<string, StackItem>): number {
  if (ids.length === 0) return 0.5;
  let total = 0;
  for (const id of ids) {
    total += byId.get(id)?.riskWeight ?? 0.5;
  }
  return total / ids.length;
}

function isRegional(incident: Incident, profile: ExposureProfile): boolean {
  if (incident.regions.includes("global")) return false;
  return incident.regions.includes(profile.region);
}

/**
 * The core matcher. An incident is "matched" only when something the person
 * actually declared intersects its attack surface — or when a regional
 * incident applies to their region and has no stack surface by design.
 *
 * This is the difference between a breach headline and a personal exposure.
 */
export function matchIncident(
  incident: Incident,
  profile: ExposureProfile,
  byId: ReadonlyMap<string, StackItem>,
): DraftMatch {
  const stack = new Set(profile.stack);
  const present = incident.affected.filter((id) => stack.has(id));
  const missing = incident.affected.filter((id) => !stack.has(id));
  const reasons: string[] = [];

  let matched = present.length > 0;
  let confidence = 0;

  if (matched) {
    confidence = 0.55 + 0.45 * (present.length / Math.max(incident.affected.length, 1));
    for (const id of present) {
      const item = byId.get(id);
      reasons.push(`You declared ${item?.label ?? id}.`);
    }
  } else if (incident.affected.length === 0) {
    const regional = isRegional(incident, profile);
    if (incident.vector === "banking" && profile.bank && regional) {
      matched = true;
      confidence = 0.9;
      reasons.push(`You bank in ${profile.region}.`);
    } else if (
      (incident.vector === "data-breach" || incident.vector === "state-actor") &&
      regional
    ) {
      matched = true;
      confidence = 0.6;
      reasons.push(`The incident is scoped to ${profile.region}.`);
    }
  }

  if (!matched) {
    if (incident.affected.length > 0) {
      reasons.push("None of the affected components are in your declared stack.");
    } else {
      reasons.push("No matching region, sector, or account type.");
    }
  }

  const mitigation = mitigationFor(profile, incident);
  if (mitigation > 0) {
    reasons.push(`Existing hygiene removes about ${Math.round(mitigation * 100)}% of the impact.`);
  }

  const effectiveSeverity = mitigation >= 0.4 ? downgrade(incident.severity) : incident.severity;
  const weight = averageRisk(present.length > 0 ? present : incident.affected, byId);
  const raw = matched
    ? SEVERITY_WEIGHT[incident.severity] * weight * confidence * (1 - mitigation)
    : 0;

  return {
    incident,
    matched,
    confidence,
    reasons,
    missing,
    effectiveSeverity,
    raw,
  };
}

export function computeExposure(
  profile: ExposureProfile,
  incidents: readonly Incident[],
  stack: readonly StackItem[],
): ExposureReport {
  const byId = new Map(stack.map((item) => [item.id, item]));
  const drafts = incidents.map((incident) => matchIncident(incident, profile, byId));
  const exposedDrafts = drafts.filter((draft) => draft.matched);
  const totalRaw = exposedDrafts.reduce((sum, draft) => sum + draft.raw, 0);
  const risk = Math.round(100 * (1 - Math.exp(-totalRaw * RISK_SATURATION)));

  const counts: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const draft of exposedDrafts) {
    counts[draft.incident.severity] += 1;
  }

  const vectorRisk = new Map<Vector, { count: number; risk: number }>();
  for (const vector of VECTORS) vectorRisk.set(vector, { count: 0, risk: 0 });

  const matches: IncidentMatch[] = drafts.map((draft) => {
    const contribution =
      draft.matched && totalRaw > 0 ? Math.round((draft.raw / totalRaw) * risk) : 0;
    if (draft.matched) {
      const bucket = vectorRisk.get(draft.incident.vector);
      if (bucket) {
        bucket.count += 1;
        bucket.risk += contribution;
      }
    }
    return {
      incident: draft.incident,
      matched: draft.matched,
      confidence: Number(draft.confidence.toFixed(3)),
      reasons: draft.reasons,
      missing: draft.missing,
      effectiveSeverity: draft.effectiveSeverity,
      contribution,
    };
  });

  matches.sort((a, b) => {
    if (a.matched !== b.matched) return a.matched ? -1 : 1;
    if (a.contribution !== b.contribution) return b.contribution - a.contribution;
    return a.incident.name.localeCompare(b.incident.name);
  });

  const vectors: VectorRollup[] = VECTORS.map((vector) => {
    const bucket = vectorRisk.get(vector);
    return {
      vector,
      count: bucket?.count ?? 0,
      risk: Math.min(100, bucket?.risk ?? 0),
    };
  }).sort((a, b) => b.risk - a.risk);

  const exposed = matches.filter((match) => match.matched);
  const top = exposed[0];
  const summary =
    exposed.length === 0
      ? `None of the ${incidents.length} incidents intersect the stack you declared. Keep the hygiene settings honest.`
      : `${exposed.length} of ${incidents.length} incidents intersect your stack. The largest single contributor is ${top?.incident.name ?? "none"}.`;

  return {
    score: 100 - risk,
    risk,
    band: riskBand(risk),
    matches,
    exposed,
    counts,
    vectors,
    totalIncidents: incidents.length,
    examinedStack: profile.stack.length,
    summary,
  };
}
