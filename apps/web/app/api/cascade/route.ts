import { simulateCascade } from "@ferroscope/core";
import { cascadeRequestSchema } from "@ferroscope/sdk";
import { INCIDENTS_BY_SLUG, STACK_CATALOG } from "@ferroscope/seed";
import { jsonError, jsonOk, parseBody } from "@/lib/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const parsed = await parseBody(request, cascadeRequestSchema);
  if (!parsed.ok) return parsed.response;

  const incident = INCIDENTS_BY_SLUG.get(parsed.data.incidentSlug);
  if (!incident) {
    return jsonError(
      "incident_not_found",
      `No incident is filed under "${parsed.data.incidentSlug}".`,
      404,
    );
  }

  const result = simulateCascade(incident, parsed.data.profile, STACK_CATALOG, parsed.data.ticks);

  return jsonOk({ result });
}
