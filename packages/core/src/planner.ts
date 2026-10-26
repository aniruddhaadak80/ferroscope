import type { ActionPlan, ExposureReport, IncidentMatch, RemediationAction } from "./types";

/**
 * Ranking is intentional: risk removed per minute, not severity alone. That
 * ordering is why "update certifi" beats "audit every workflow" on day one.
 */
export function rankActions(
  actions: readonly RemediationAction[],
  report: ExposureReport,
  completed: readonly string[] = [],
): ActionPlan[] {
  const done = new Set(completed);

  const plans = actions.map((action) => {
    const relevant = report.exposed.filter(
      (match: IncidentMatch) =>
        action.vectors.includes(match.incident.vector) ||
        action.incidentSlugs.includes(match.incident.slug),
    );

    const relevantRisk = relevant.reduce((sum, match) => sum + match.contribution, 0);
    const riskReduced = Math.min(report.risk, Math.round(relevantRisk * action.reduces));
    const efficiency = riskReduced / Math.max(action.minutes, 1);

    return {
      action,
      relevant: relevant.map((match) => match.incident.slug),
      riskReduced,
      efficiency: Number(efficiency.toFixed(2)),
      completed: done.has(action.id),
    } satisfies ActionPlan;
  });

  plans.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    // Efficiency is the published ranking key: risk points removed per minute.
    if (b.efficiency !== a.efficiency) return b.efficiency - a.efficiency;
    // Ties break toward the action that touches more of your incidents, then
    // toward the cheaper one, so the order never depends on array position.
    if (b.relevant.length !== a.relevant.length) return b.relevant.length - a.relevant.length;
    return a.action.minutes - b.action.minutes;
  });

  return plans;
}

/**
 * Sequential, multiplicative residual risk. This avoids the "sum of all
 * reductions exceeds 100%" bug that makes dashboards lie.
 */
export function residualRisk(report: ExposureReport, plans: readonly ActionPlan[]): number {
  let risk = report.risk;
  for (const plan of plans) {
    if (!plan.completed) continue;
    risk -= risk * plan.action.reduces * 0.72;
  }
  return Math.max(0, Math.round(risk));
}

export function totalMinutes(plans: readonly ActionPlan[]): number {
  return plans.reduce((sum, plan) => (plan.completed ? sum : sum + plan.action.minutes), 0);
}

export function nextBestAction(plans: readonly ActionPlan[]): ActionPlan | null {
  return plans.find((plan) => !plan.completed && plan.relevant.length > 0) ?? null;
}
