import { computeExposure, rankActions, residualRisk, totalMinutes } from "@ferroscope/core";
import { plannerRequestSchema } from "@ferroscope/sdk";
import { ACTIONS, INCIDENTS, STACK_CATALOG } from "@ferroscope/seed";
import { jsonOk, parseBody } from "@/lib/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const parsed = await parseBody(request, plannerRequestSchema);
  if (!parsed.ok) return parsed.response;

  const report = computeExposure(parsed.data.profile, INCIDENTS, STACK_CATALOG);
  const plans = rankActions(ACTIONS, report, parsed.data.completed);

  return jsonOk({
    plans,
    residualRisk: residualRisk(report, plans),
    remainingMinutes: totalMinutes(plans),
    baselineRisk: report.risk,
    completed: parsed.data.completed,
  });
}
