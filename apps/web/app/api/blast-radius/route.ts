import { buildBlastGraph, computeExposure } from "@ferroscope/core";
import { exposureRequestSchema } from "@ferroscope/sdk";
import { INCIDENTS, STACK_CATALOG } from "@ferroscope/seed";
import { jsonOk, parseBody } from "@/lib/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const parsed = await parseBody(request, exposureRequestSchema);
  if (!parsed.ok) return parsed.response;

  const report = computeExposure(parsed.data.profile, INCIDENTS, STACK_CATALOG);
  const graph = buildBlastGraph(report, parsed.data.profile, STACK_CATALOG);

  return jsonOk({ graph, report });
}
