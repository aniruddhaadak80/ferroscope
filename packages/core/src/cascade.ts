import { SEVERITY_WEIGHT } from "./severity";
import type {
  CascadeFrame,
  CascadeResult,
  ExposureProfile,
  Incident,
  StackCategory,
  StackItem,
} from "./types";

const DEFAULT_TICKS = 12;

/**
 * The cascade simulator is a deterministic story, not a physics model. It
 * answers one question well: if this incident reaches this stack, which parts
 * light up first, and how fast does the risk curve climb?
 */
export function simulateCascade(
  incident: Incident,
  profile: ExposureProfile,
  stack: readonly StackItem[],
  ticks: number = DEFAULT_TICKS,
): CascadeResult {
  const byId = new Map(stack.map((item) => [item.id, item]));
  const declared = new Set(profile.stack);

  const real = incident.affected.filter((id) => declared.has(id));
  const hypothetical = incident.affected.filter((id) => !declared.has(id));
  const primary = real.length > 0 ? real : hypothetical.slice(0, 4);
  const primaryLabels = primary.map((id) => byId.get(id)?.label ?? id);

  const categories = new Set<StackCategory>(
    primary
      .map((id) => byId.get(id)?.category)
      .filter((value): value is StackCategory => value !== undefined),
  );
  const siblings = stack
    .filter((item) => declared.has(item.id) && !primary.includes(item.id))
    .filter((item) => categories.has(item.category))
    .slice(0, 3)
    .map((item) => item.id);

  const frames: CascadeFrame[] = [];
  const peak = Math.min(
    96,
    Math.round(SEVERITY_WEIGHT[incident.severity] * 42 + primary.length * 7),
  );

  const active: string[] = [incident.slug];
  const edges: string[] = [];

  frames.push({
    tick: 0,
    activeNodes: [...active],
    activeEdges: [],
    risk: 3,
    headline: "Signal received",
    detail: `${incident.name} is disclosed. Nothing in your stack is active yet.`,
  });

  primary.forEach((id, index) => {
    const tick = index + 1;
    active.push(id);
    edges.push(`${incident.slug}->${id}`);
    frames.push({
      tick,
      activeNodes: [...active],
      activeEdges: [...edges],
      risk: Math.round(peak * (0.22 + (0.18 * tick) / Math.max(primary.length, 1))),
      headline: "Primary surface hit",
      detail: `${byId.get(id)?.label ?? id} is in the blast path. ${incident.vector} incidents move fast here.`,
    });
  });

  siblings.forEach((id, index) => {
    const tick = primary.length + index + 1;
    active.push(id);
    edges.push(`${primary[0] ?? incident.slug}->${id}`);
    frames.push({
      tick,
      activeNodes: [...active],
      activeEdges: [...edges],
      risk: Math.round(peak * (0.62 + index * 0.08)),
      headline: "Lateral spread",
      detail: `${byId.get(id)?.label ?? id} shares a category with the first hit. This is how one incident becomes three.`,
    });
  });

  while (frames.length < Math.max(ticks - 2, 1)) {
    const tick = frames.length;
    frames.push({
      tick,
      activeNodes: [...active],
      activeEdges: [...edges],
      risk: peak,
      headline: "Peak exposure",
      detail:
        "Every reachable node is active. The remaining question is what the attacker does next.",
    });
  }

  frames.push({
    tick: frames.length,
    activeNodes: [...active],
    activeEdges: [...edges],
    risk: Math.round(peak * 0.72),
    headline: "Containment window",
    detail:
      "Rotation and patching start to bite. The curve bends only if the fixes happen before the next disclosure.",
  });

  frames.push({
    tick: frames.length,
    activeNodes: [...active],
    activeEdges: [...edges],
    risk: Math.round(peak * 0.46),
    headline: "Residual risk",
    detail: `${primaryLabels.join(", ") || "No primary surface"} patched. What remains is the part the fixes did not cover.`,
  });

  return {
    incident,
    frames,
    peakRisk: peak,
    ticks: frames.length,
  };
}
